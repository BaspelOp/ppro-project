from typing import Optional, List
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.repositories.base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, db: Session):
        super().__init__(Customer, db)

    def get_by_id_card(self, id_card_number: str) -> Optional[Customer]:
        return self.db.query(Customer).filter(
            func.lower(Customer.id_card_number) == id_card_number.strip().lower()
        ).first()

    def search(self, search: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Customer]:
        query = self.db.query(Customer)
        if search:
            pattern = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(Customer.name).like(pattern),
                    func.lower(Customer.phone).like(pattern),
                    func.lower(Customer.id_card_number).like(pattern),
                    func.lower(Customer.email).like(pattern),
                )
            )
        return query.order_by(Customer.name.asc()).offset(skip).limit(limit).all()
