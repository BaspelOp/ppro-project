from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.customer_service import CustomerService

router = APIRouter()


@router.get("", response_model=List[CustomerResponse], summary="Seznam zákazníků s vyhledáváním")
def list_customers(
    search: Optional[str] = Query(None, description="Hledat dle jména, telefonu nebo čísla dokladu"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    service = CustomerService(db)
    return service.list_customers(search=search, skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=CustomerResponse, summary="Detail zákazníka")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    service = CustomerService(db)
    return service.get_customer(customer_id)


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, summary="Registrovat nového zákazníka")
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    service = CustomerService(db)
    return service.create_customer(customer_in)


@router.put("/{customer_id}", response_model=CustomerResponse, summary="Upravit údaje zákazníka")
def update_customer(customer_id: int, customer_in: CustomerUpdate, db: Session = Depends(get_db)):
    service = CustomerService(db)
    return service.update_customer(customer_id, customer_in)
