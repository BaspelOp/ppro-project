import math
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.equipment import EquipmentStatus, EquipmentCondition
from app.models.rental import Rental, RentalItem, RentalStatus
from app.models.service_record import ServiceRecord
from app.schemas.rental import RentalCreate, ReturnItemRequest
from app.repositories.rental_repository import RentalRepository
from app.repositories.customer_repository import CustomerRepository
from app.repositories.equipment_repository import EquipmentRepository


def _to_naive_utc(dt: datetime) -> datetime:
    """Normalizuje datetime na naive UTC pro konzistentní porovnávání v SQLite i PostgreSQL."""
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


class RentalService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = RentalRepository(db)
        self.customer_repo = CustomerRepository(db)
        self.equipment_repo = EquipmentRepository(db)

    def list_rentals(
        self,
        status_filter: Optional[RentalStatus] = None,
        customer_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Rental]:
        return self.repository.list_filtered(
            status=status_filter,
            customer_id=customer_id,
            skip=skip,
            limit=limit,
        )

    def get_rental(self, rental_id: int) -> Rental:
        rental = self.repository.get_with_details(rental_id)
        if not rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Výpůjčka s ID {rental_id} nebyla nalezena.",
            )
        return rental

    def create_rental(self, rental_in: RentalCreate) -> Rental:
        # 1. Validace termínu
        start_dt = _to_naive_utc(rental_in.rental_start)
        end_dt = _to_naive_utc(rental_in.rental_end)
        if end_dt <= start_dt:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Datum konce výpůjčky musí být po datu začátku.",
            )

        # 2. Ověření zákazníka
        customer = self.customer_repo.get(rental_in.customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Zákazník s ID {rental_in.customer_id} nebyl nalezen.",
            )

        # Deduplikace ID kusů
        unique_item_ids = list(dict.fromkeys(rental_in.equipment_item_ids))
        items = []
        for eq_id in unique_item_ids:
            eq = self.equipment_repo.get(eq_id)
            if not eq:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Kus vybavení s ID {eq_id} nebyl nalezen.",
                )
            # Byznys pravidlo: Kus v servisu nebo vyřazený nelze půjčit ani rezervovat
            if eq.status == EquipmentStatus.IN_SERVICE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Kus '{eq.inventory_number}' je aktuálně v servisu a nelze jej zapůjčit ani rezervovat.",
                )
            if eq.status == EquipmentStatus.DISCARDED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Kus '{eq.inventory_number}' je vyřazen z fondu a nelze jej zapůjčit.",
                )
            # Pokud jde o okamžitý výdej (ne rezervaci), kus nesmí být aktuálně RENTED
            if not rental_in.is_reservation and eq.status == EquipmentStatus.RENTED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Kus '{eq.inventory_number}' je aktuálně zapůjčen jinému zákazníkovi.",
                )
            items.append(eq)

        # 3. Byznys pravidlo: Kus nesmí být ve dvou překrývajících se výpůjčkách/rezervacích
        overlapping = self.repository.find_overlapping_items(
            equipment_item_ids=unique_item_ids,
            rental_start=start_dt,
            rental_end=end_dt,
        )
        if overlapping:
            conflict_eq = self.equipment_repo.get(overlapping[0].equipment_item_id)
            inv = conflict_eq.inventory_number if conflict_eq else str(overlapping[0].equipment_item_id)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kus '{inv}' je v požadovaném termínu již rezervován nebo zapůjčen v jiné smlouvě (#{overlapping[0].rental_id}).",
            )

        # 4. Výpočet ceny a kauce (OB-5: snapshot sazby do RentalItem)
        duration_seconds = (end_dt - start_dt).total_seconds()
        rental_days = max(1, math.ceil(duration_seconds / 86400.0))

        total_deposit = sum(eq.deposit for eq in items)
        gross_price = sum(eq.daily_rate * rental_days for eq in items)
        total_price = max(0.0, gross_price - rental_in.discount_amount)

        rental_status = RentalStatus.RESERVED if rental_in.is_reservation else RentalStatus.ACTIVE

        db_rental = Rental(
            customer_id=customer.id,
            rental_start=start_dt,
            rental_end=end_dt,
            total_deposit=total_deposit,
            discount_amount=rental_in.discount_amount,
            total_price=total_price,
            status=rental_status,
            notes=rental_in.notes,
        )
        self.db.add(db_rental)
        self.db.flush()

        for eq in items:
            rental_item = RentalItem(
                rental_id=db_rental.id,
                equipment_item_id=eq.id,
                agreed_daily_rate=eq.daily_rate,
                agreed_deposit=eq.deposit,
            )
            self.db.add(rental_item)
            if not rental_in.is_reservation:
                eq.status = EquipmentStatus.RENTED

        self.db.commit()
        return self.get_rental(db_rental.id)

    def activate_reservation(self, rental_id: int) -> Rental:
        """Převede rezervaci (RESERVED) na aktivní výpůjčku (ACTIVE) při vyzvednutí."""
        rental = self.get_rental(rental_id)
        if rental.status != RentalStatus.RESERVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Aktivovat lze pouze rezervaci ve stavu RESERVED (aktuální stav: {rental.status.value}).",
            )

        for r_item in rental.items:
            eq = r_item.equipment_item
            if eq.status == EquipmentStatus.IN_SERVICE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Kus '{eq.inventory_number}' je v servisu, rezervaci nelze vydat.",
                )
            if eq.status == EquipmentStatus.RENTED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Kus '{eq.inventory_number}' je stále zapůjčen, nelze jej vydat.",
                )

        for r_item in rental.items:
            r_item.equipment_item.status = EquipmentStatus.RENTED

        rental.status = RentalStatus.ACTIVE
        self.db.commit()
        return self.get_rental(rental.id)

    def cancel_rental(self, rental_id: int, reason: Optional[str] = None) -> Rental:
        """
        Byznys pravidlo: Historie výpůjček se nemaže.
        Zrušení pouze nastaví stav na CANCELLED a uvolní případně blokované kusy.
        """
        rental = self.get_rental(rental_id)
        if rental.status in (RentalStatus.RETURNED, RentalStatus.CANCELLED):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Smlouvu ve stavu {rental.status.value} nelze zrušit.",
            )

        if rental.status in (RentalStatus.ACTIVE, RentalStatus.PARTIALLY_RETURNED):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aktivní výpůjčku s vydaným vybavením nelze stornovat; položky je nutné řádně vrátit.",
            )

        rental.status = RentalStatus.CANCELLED
        if reason:
            rental.notes = (rental.notes or "") + f" [Stornováno: {reason}]"

        self.db.commit()
        return self.get_rental(rental.id)

    def return_item(self, rental_id: int, rental_item_id: int, return_data: ReturnItemRequest) -> Rental:
        """
        Vrácení konkrétní položky z výpůjčky (podpora částečného vrácení OB-4)
        s automatickým výpočtem penále za každý započatý den prodlení.
        """
        rental = self.get_rental(rental_id)
        if rental.status not in (RentalStatus.ACTIVE, RentalStatus.PARTIALLY_RETURNED):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Vracet položky lze pouze u aktivní výpůjčky (aktuální stav: {rental.status.value}).",
            )

        r_item = self.repository.get_rental_item(rental_id, rental_item_id)
        if not r_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Položka výpůjčky s ID {rental_item_id} nebyla v této smlouvě nalezena.",
            )

        if r_item.returned_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tato položka již byla vrácena.",
            )

        returned_at = _to_naive_utc(return_data.returned_at or datetime.now(timezone.utc))
        rental_end = _to_naive_utc(rental.rental_end)

        # Byznys pravidlo: Penále za pozdní vrácení za každý započatý den
        late_penalty = 0.0
        if returned_at > rental_end:
            overdue_seconds = (returned_at - rental_end).total_seconds()
            overdue_days = math.ceil(overdue_seconds / 86400.0)
            late_penalty = overdue_days * r_item.agreed_daily_rate

        r_item.returned_at = returned_at
        r_item.late_penalty = late_penalty
        r_item.item_return_condition = return_data.item_return_condition
        if return_data.notes:
            r_item.notes = return_data.notes

        # Aktualizace stavu kusu vybavení
        eq = self.equipment_repo.get(r_item.equipment_item_id)
        if eq:
            eq.condition = return_data.item_return_condition
            if return_data.send_to_service or return_data.item_return_condition == EquipmentCondition.DAMAGED:
                eq.status = EquipmentStatus.IN_SERVICE
                issue = return_data.notes or "Poškození zjištěné při vrácení z výpůjčky"
                eq.service_notes = issue
                self.db.add(
                    ServiceRecord(
                        equipment_item_id=eq.id,
                        service_start=returned_at,
                        issue_description=issue,
                        cost=0.0,
                    )
                )
            else:
                eq.status = EquipmentStatus.AVAILABLE

        # Přepočet stavu celé smlouvy (PARTIALLY_RETURNED vs RETURNED)
        self.db.flush()
        all_items = self.db.query(RentalItem).filter(RentalItem.rental_id == rental.id).all()
        if all(it.returned_at is not None for it in all_items):
            rental.status = RentalStatus.RETURNED
        else:
            rental.status = RentalStatus.PARTIALLY_RETURNED

        self.db.commit()
        return self.get_rental(rental.id)
