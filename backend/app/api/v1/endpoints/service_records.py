from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.service_record import ServiceRecordResponse
from app.services.service_record_service import ServiceRecordService

router = APIRouter()


@router.get("", response_model=List[ServiceRecordResponse], summary="Historie všech servisních zásahů")
def list_service_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    service = ServiceRecordService(db)
    return service.list_all(skip=skip, limit=limit)


@router.get("/equipment/{equipment_item_id}", response_model=List[ServiceRecordResponse], summary="Historie servisu konkrétního kusu")
def list_service_records_for_item(equipment_item_id: int, db: Session = Depends(get_db)):
    service = ServiceRecordService(db)
    return service.list_for_item(equipment_item_id)
