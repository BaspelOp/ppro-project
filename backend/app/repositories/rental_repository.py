from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.rental import Rental, RentalItem, RentalStatus
from app.repositories.base import BaseRepository


ACTIVE_RENTAL_STATUSES = [
    RentalStatus.RESERVED,
    RentalStatus.ACTIVE,
    RentalStatus.PARTIALLY_RETURNED,
]


class RentalRepository(BaseRepository[Rental]):
    def __init__(self, db: Session):
        super().__init__(Rental, db)

    def get_with_details(self, rental_id: int) -> Optional[Rental]:
        return (
            self.db.query(Rental)
            .options(
                joinedload(Rental.customer),
                joinedload(Rental.items).joinedload(RentalItem.equipment_item),
            )
            .filter(Rental.id == rental_id)
            .first()
        )

    def list_filtered(
        self,
        status: Optional[RentalStatus] = None,
        customer_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Rental]:
        query = (
            self.db.query(Rental)
            .options(
                joinedload(Rental.customer),
                joinedload(Rental.items).joinedload(RentalItem.equipment_item),
            )
        )
        if status:
            query = query.filter(Rental.status == status)
        if customer_id:
            query = query.filter(Rental.customer_id == customer_id)

        return query.order_by(Rental.rental_start.desc(), Rental.id.desc()).offset(skip).limit(limit).all()

    def find_overlapping_items(
        self,
        equipment_item_ids: List[int],
        rental_start: datetime,
        rental_end: datetime,
        exclude_rental_id: Optional[int] = None,
    ) -> List[RentalItem]:
        """
        Najde nevrácené položky (RentalItem) z aktivních či rezervovaných smluv,
        jejichž termín se překrývá s [rental_start, rental_end].
        """
        query = (
            self.db.query(RentalItem)
            .join(Rental, RentalItem.rental_id == Rental.id)
            .filter(
                RentalItem.equipment_item_id.in_(equipment_item_ids),
                RentalItem.returned_at.is_(None),
                Rental.status.in_(ACTIVE_RENTAL_STATUSES),
                Rental.rental_start < rental_end,
                Rental.rental_end > rental_start,
            )
        )
        if exclude_rental_id is not None:
            query = query.filter(Rental.id != exclude_rental_id)

        return query.all()

    def get_rental_item(self, rental_id: int, rental_item_id: int) -> Optional[RentalItem]:
        return (
            self.db.query(RentalItem)
            .filter(
                RentalItem.id == rental_item_id,
                RentalItem.rental_id == rental_id,
            )
            .first()
        )
