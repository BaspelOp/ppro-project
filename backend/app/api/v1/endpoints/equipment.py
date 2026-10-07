from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.equipment import EquipmentCategory, EquipmentStatus
from app.schemas.equipment import (
    EquipmentItemCreate,
    EquipmentItemUpdate,
    EquipmentItemResponse,
    EquipmentServiceAction,
    EquipmentStatsResponse,
)
from app.services.equipment_service import EquipmentService

router = APIRouter()


@router.get("/stats", response_model=EquipmentStatsResponse, summary="Přehledové statistiky vybavení")
def get_equipment_stats(db: Session = Depends(get_db)):
    """Vrací souhrnné počty kusů (celkem, k dispozici, zapůjčeno, v servisu, vyřazeno) a rozpad dle kategorií."""
    service = EquipmentService(db)
    return service.get_stats()


@router.get("", response_model=List[EquipmentItemResponse], summary="Seznam kusů vybavení s filtry")
def list_equipment(
    category: Optional[EquipmentCategory] = Query(None, description="Filtrovat dle kategorie"),
    status: Optional[EquipmentStatus] = Query(None, description="Filtrovat dle stavu"),
    search: Optional[str] = Query(None, description="Hledat v názvu, inventárním čísle či velikosti"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Získání seznamu vybavení s podporou fulltextového hledání a filtrů pro rychlou obsluhu."""
    service = EquipmentService(db)
    return service.get_items(
        category=category,
        status_filter=status,
        search=search,
        skip=skip,
        limit=limit
    )


@router.get("/{item_id}", response_model=EquipmentItemResponse, summary="Detail konkrétního kusu vybavení")
def get_equipment_item(item_id: int, db: Session = Depends(get_db)):
    service = EquipmentService(db)
    return service.get_item(item_id)


@router.post("", response_model=EquipmentItemResponse, status_code=status.HTTP_201_CREATED, summary="Zaevidovat nový kus do půjčovny")
def create_equipment_item(item_in: EquipmentItemCreate, db: Session = Depends(get_db)):
    service = EquipmentService(db)
    return service.create_item(item_in)


@router.put("/{item_id}", response_model=EquipmentItemResponse, summary="Upravit parametry kusu vybavení")
def update_equipment_item(item_id: int, item_in: EquipmentItemUpdate, db: Session = Depends(get_db)):
    service = EquipmentService(db)
    return service.update_item(item_id, item_in)


@router.post("/{item_id}/service", response_model=EquipmentItemResponse, summary="Odeslat do servisu nebo vrátit ze servisu")
def handle_service_action(item_id: int, action_data: EquipmentServiceAction, db: Session = Depends(get_db)):
    """Umožňuje přepnout kus do stavu IN_SERVICE s popisem závady, nebo jej vrátit zpět do AVAILABLE."""
    service = EquipmentService(db)
    return service.handle_service_action(item_id, action_data)


@router.delete("/{item_id}", response_model=EquipmentItemResponse, summary="Vyřadit kus vybavení z evidence")
def discard_equipment_item(item_id: int, reason: Optional[str] = Query(None, description="Důvod vyřazení kusu"), db: Session = Depends(get_db)):
    """Nastaví stav kusu na DISCARDED (historie zůstává uložena pro audit)."""
    service = EquipmentService(db)
    return service.discard_item(item_id, reason=reason)
