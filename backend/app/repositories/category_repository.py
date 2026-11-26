from typing import Optional, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.category import Category
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category]):
    def __init__(self, db: Session):
        super().__init__(Category, db)

    def get_by_code(self, code: str) -> Optional[Category]:
        return self.db.query(Category).filter(
            func.lower(Category.code) == code.strip().lower()
        ).first()

    def list_all_ordered(self) -> List[Category]:
        return self.db.query(Category).order_by(Category.name.asc()).all()
