from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.rental import RentalStatus
from app.schemas.rental import RentalCreate, RentalResponse, ReturnItemRequest
from app.schemas.report import RentalProtocolResponse
from app.services.rental_service import RentalService
from app.services.report_service import ReportService

router = APIRouter()


@router.get("", response_model=List[RentalResponse], summary="Seznam výpůjček a rezervací")
def list_rentals(
    status: Optional[RentalStatus] = Query(None, description="Filtrovat dle stavu smlouvy"),
    customer_id: Optional[int] = Query(None, description="Filtrovat dle zákazníka"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    service = RentalService(db)
    return service.list_rentals(status_filter=status, customer_id=customer_id, skip=skip, limit=limit)


@router.get("/{rental_id}", response_model=RentalResponse, summary="Detail výpůjčky včetně položek M:N")
def get_rental(rental_id: int, db: Session = Depends(get_db)):
    service = RentalService(db)
    return service.get_rental(rental_id)


@router.post("", response_model=RentalResponse, status_code=status.HTTP_201_CREATED, summary="Vytvořit novou výpůjčku nebo rezervaci")
def create_rental(rental_in: RentalCreate, db: Session = Depends(get_db)):
    service = RentalService(db)
    return service.create_rental(rental_in)


@router.post("/{rental_id}/activate", response_model=RentalResponse, summary="Vydat rezervaci (přechod RESERVED -> ACTIVE)")
def activate_reservation(rental_id: int, db: Session = Depends(get_db)):
    service = RentalService(db)
    return service.activate_reservation(rental_id)


@router.post("/{rental_id}/cancel", response_model=RentalResponse, summary="Stornovat rezervaci (historie zůstává zachována)")
def cancel_rental(
    rental_id: int,
    reason: Optional[str] = Query(None, description="Důvod storna"),
    db: Session = Depends(get_db),
):
    service = RentalService(db)
    return service.cancel_rental(rental_id, reason=reason)


@router.post(
    "/{rental_id}/items/{rental_item_id}/return",
    response_model=RentalResponse,
    summary="Vrátit konkrétní kus z výpůjčky (částečné/úplné vrácení s výpočtem penále)",
)
def return_rental_item(
    rental_id: int,
    rental_item_id: int,
    return_data: ReturnItemRequest,
    db: Session = Depends(get_db),
):
    service = RentalService(db)
    return service.return_item(rental_id, rental_item_id, return_data)


@router.get(
    "/{rental_id}/protocol",
    response_model=RentalProtocolResponse,
    summary="Vygenerovat předvyplněný protokol o výpůjčce pro náhled a tisk",
)
def get_rental_protocol(rental_id: int, db: Session = Depends(get_db)):
    service = ReportService(db)
    return service.get_rental_protocol(rental_id)
