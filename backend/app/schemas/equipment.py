from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel, Field, ConfigDict
from app.models.equipment import EquipmentCategory, EquipmentStatus, EquipmentCondition


class EquipmentItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Název nebo model vybavení")
    category: EquipmentCategory = Field(..., description="Kategorie vybavení")
    size: str = Field(..., min_length=1, max_length=50, description="Velikost či rozměr (např. 175 cm, 43 EU, L)")
    purchase_year: int = Field(..., ge=1990, le=2030, description="Rok pořízení kusu")
    daily_rate: float = Field(default=250.0, ge=0.0, description="Základní denní sazba výpůjčky v Kč")
    deposit: float = Field(default=1000.0, ge=0.0, description="Požadovaná kauce v Kč")
    condition: EquipmentCondition = Field(default=EquipmentCondition.GOOD, description="Stav opotřebení")
    notes: Optional[str] = Field(default=None, max_length=1000, description="Interní poznámka k vybavení")


class EquipmentItemCreate(EquipmentItemBase):
    inventory_number: str = Field(..., min_length=2, max_length=50, description="Unikátní inventární číslo kusu")


class EquipmentItemUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    category: Optional[EquipmentCategory] = None
    size: Optional[str] = Field(default=None, min_length=1, max_length=50)
    purchase_year: Optional[int] = Field(default=None, ge=1990, le=2030)
    daily_rate: Optional[float] = Field(default=None, ge=0.0)
    deposit: Optional[float] = Field(default=None, ge=0.0)
    condition: Optional[EquipmentCondition] = None
    status: Optional[EquipmentStatus] = None
    service_notes: Optional[str] = None
    notes: Optional[str] = None


class ServiceActionType(str):
    SEND_TO_SERVICE = "SEND_TO_SERVICE"
    RETURN_FROM_SERVICE = "RETURN_FROM_SERVICE"


class EquipmentServiceAction(BaseModel):
    action: str = Field(..., description="SEND_TO_SERVICE nebo RETURN_FROM_SERVICE")
    service_notes: Optional[str] = Field(default=None, description="Popis závady či provedené údržby")
    new_condition: Optional[EquipmentCondition] = Field(default=None, description="Nový stav opotřebení po servisu")
    cost: Optional[float] = Field(default=0.0, ge=0.0, description="Náklady na servisní zásah v Kč")


class EquipmentItemResponse(EquipmentItemBase):
    id: int
    inventory_number: str
    category_id: Optional[int] = None
    status: EquipmentStatus
    service_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EquipmentStatsResponse(BaseModel):
    total: int
    available: int
    rented: int
    in_service: int
    discarded: int
    by_category: Dict[str, int]
