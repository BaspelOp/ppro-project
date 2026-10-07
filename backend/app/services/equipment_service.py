from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.equipment import EquipmentItem, EquipmentCategory, EquipmentStatus, EquipmentCondition
from app.schemas.equipment import (
    EquipmentItemCreate,
    EquipmentItemUpdate,
    EquipmentServiceAction,
)
from app.repositories.equipment_repository import EquipmentRepository


class EquipmentService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = EquipmentRepository(db)

    def get_item(self, item_id: int) -> EquipmentItem:
        item = self.repository.get(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kus vybavení s ID {item_id} nebyl nalezen."
            )
        return item

    def get_items(
        self,
        category: Optional[EquipmentCategory] = None,
        status_filter: Optional[EquipmentStatus] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[EquipmentItem]:
        return self.repository.search_and_filter(
            category=category,
            status=status_filter,
            search=search,
            skip=skip,
            limit=limit
        )

    def get_stats(self) -> Dict[str, Any]:
        return self.repository.get_stats()

    def create_item(self, item_in: EquipmentItemCreate) -> EquipmentItem:
        # Pravidlo 1: Kontrola unikátnosti inventárního čísla
        existing = self.repository.get_by_inventory_number(item_in.inventory_number)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Inventární číslo '{item_in.inventory_number}' již v evidenci existuje. Každý kus musí mít unikátní označení."
            )

        # Nový kus začíná vždy ve stavu AVAILABLE
        db_item = EquipmentItem(
            inventory_number=item_in.inventory_number.strip().upper(),
            name=item_in.name.strip(),
            category=item_in.category,
            size=item_in.size.strip(),
            purchase_year=item_in.purchase_year,
            daily_rate=item_in.daily_rate,
            deposit=item_in.deposit,
            condition=item_in.condition,
            status=EquipmentStatus.AVAILABLE,
            notes=item_in.notes
        )
        return self.repository.create(db_item)

    def update_item(self, item_id: int, item_in: EquipmentItemUpdate) -> EquipmentItem:
        item = self.get_item(item_id)

        update_data = item_in.model_dump(exclude_unset=True)

        # Kontrola změny stavu, pokud je v update datech
        if "status" in update_data and update_data["status"] is not None:
            new_status = update_data["status"]
            # Byznys pravidlo: Kus v servisu nelze přímo označit jako RENTED
            if item.status == EquipmentStatus.IN_SERVICE and new_status == EquipmentStatus.RENTED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Kus v servisu nelze zapůjčit. Nejprve musí být vrácen ze servisu do provozu."
                )

        for field, value in update_data.items():
            if value is not None:
                setattr(item, field, value)

        self.db.commit()
        self.db.refresh(item)
        return item

    def handle_service_action(self, item_id: int, action_data: EquipmentServiceAction) -> EquipmentItem:
        """
        Správa servisních odstávek kusu:
        - SEND_TO_SERVICE: Vyřadí kus z půjčování po dobu servisu
        - RETURN_FROM_SERVICE: Vrátí kus zpět do provozu (AVAILABLE)
        """
        item = self.get_item(item_id)
        action = action_data.action.upper()

        if action == "SEND_TO_SERVICE":
            # Kus nesmí být v době odeslání do servisu půjčený
            if item.status == EquipmentStatus.RENTED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Kus je aktuálně zapůjčen zákazníkovi. Před odesláním do servisu musí být nejprve vrácen."
                )
            if item.status == EquipmentStatus.DISCARDED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Vyřazený kus již nelze odeslat do běžného servisu."
                )
            item.status = EquipmentStatus.IN_SERVICE
            if action_data.service_notes:
                item.service_notes = action_data.service_notes
            if action_data.new_condition:
                item.condition = action_data.new_condition

        elif action == "RETURN_FROM_SERVICE":
            if item.status != EquipmentStatus.IN_SERVICE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Kus není ve stavu servisu (aktuální stav: {item.status.value})."
                )
            item.status = EquipmentStatus.AVAILABLE
            if action_data.service_notes:
                item.service_notes = (item.service_notes or "") + f" | Ukončeno: {action_data.service_notes}"
            if action_data.new_condition:
                item.condition = action_data.new_condition
            else:
                item.condition = EquipmentCondition.GOOD

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Neznámá servisní akce '{action_data.action}'. Povolené hodnoty: SEND_TO_SERVICE, RETURN_FROM_SERVICE."
            )

        self.db.commit()
        self.db.refresh(item)
        return item

    def discard_item(self, item_id: int, reason: Optional[str] = None) -> EquipmentItem:
        """
        Bezpečné vyřazení kusu (označení DISCARDED). Historie a záznam v DB zůstávají zachovány.
        """
        item = self.get_item(item_id)
        if item.status == EquipmentStatus.RENTED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nelze vyřadit kus, který je aktuálně zapůjčen zákazníkovi."
            )

        item.status = EquipmentStatus.DISCARDED
        if reason:
            item.notes = (item.notes or "") + f" [Vyřazeno: {reason}]"

        self.db.commit()
        self.db.refresh(item)
        return item
