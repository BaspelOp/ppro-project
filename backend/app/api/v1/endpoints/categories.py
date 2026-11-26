from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.category_service import CategoryService

router = APIRouter()


@router.get("", response_model=List[CategoryResponse], summary="Seznam kategorií a výchozích tarifů")
def list_categories(db: Session = Depends(get_db)):
    service = CategoryService(db)
    return service.list_categories()


@router.get("/{category_id}", response_model=CategoryResponse, summary="Detail kategorie")
def get_category(category_id: int, db: Session = Depends(get_db)):
    service = CategoryService(db)
    return service.get_category(category_id)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="Vytvořit novou kategorii")
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db)):
    service = CategoryService(db)
    return service.create_category(cat_in)


@router.put("/{category_id}", response_model=CategoryResponse, summary="Upravit kategorii a ceník")
def update_category(category_id: int, cat_in: CategoryUpdate, db: Session = Depends(get_db)):
    service = CategoryService(db)
    return service.update_category(category_id, cat_in)
