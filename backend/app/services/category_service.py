from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.repositories.category_repository import CategoryRepository


class CategoryService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = CategoryRepository(db)

    def list_categories(self) -> List[Category]:
        return self.repository.list_all_ordered()

    def get_category(self, category_id: int) -> Category:
        cat = self.repository.get(category_id)
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kategorie s ID {category_id} nebyla nalezena.",
            )
        return cat

    def create_category(self, cat_in: CategoryCreate) -> Category:
        existing = self.repository.get_by_code(cat_in.code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kategorie s kódem '{cat_in.code}' již existuje.",
            )
        db_cat = Category(
            code=cat_in.code.strip().upper(),
            name=cat_in.name.strip(),
            default_daily_rate=cat_in.default_daily_rate,
            default_deposit=cat_in.default_deposit,
            description=cat_in.description,
        )
        return self.repository.create(db_cat)

    def update_category(self, category_id: int, cat_in: CategoryUpdate) -> Category:
        cat = self.get_category(category_id)
        update_data = cat_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(cat, field, value)
        self.db.commit()
        self.db.refresh(cat)
        return cat
