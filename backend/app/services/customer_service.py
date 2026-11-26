from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.repositories.customer_repository import CustomerRepository


class CustomerService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = CustomerRepository(db)

    def list_customers(self, search: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Customer]:
        return self.repository.search(search=search, skip=skip, limit=limit)

    def get_customer(self, customer_id: int) -> Customer:
        customer = self.repository.get(customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Zákazník s ID {customer_id} nebyl nalezen.",
            )
        return customer

    def create_customer(self, customer_in: CustomerCreate) -> Customer:
        existing = self.repository.get_by_id_card(customer_in.id_card_number)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Zákazník s číslem dokladu '{customer_in.id_card_number}' již v evidenci existuje.",
            )
        db_customer = Customer(
            name=customer_in.name.strip(),
            phone=customer_in.phone.strip(),
            email=customer_in.email.strip() if customer_in.email else None,
            id_card_number=customer_in.id_card_number.strip().upper(),
            notes=customer_in.notes,
        )
        return self.repository.create(db_customer)

    def update_customer(self, customer_id: int, customer_in: CustomerUpdate) -> Customer:
        customer = self.get_customer(customer_id)
        update_data = customer_in.model_dump(exclude_unset=True)

        if "id_card_number" in update_data and update_data["id_card_number"]:
            new_card = update_data["id_card_number"].strip().upper()
            existing = self.repository.get_by_id_card(new_card)
            if existing and existing.id != customer_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Číslo dokladu '{new_card}' již patří jinému zákazníkovi.",
                )
            update_data["id_card_number"] = new_card

        for field, value in update_data.items():
            if value is not None:
                setattr(customer, field, value)

        self.db.commit()
        self.db.refresh(customer)
        return customer
