from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.rental import RentalStatus
from app.models.equipment import EquipmentCondition
from app.schemas.customer import CustomerResponse


class RentalCreate(BaseModel):
    customer_id: int = Field(..., description="ID zákazníka")
    equipment_item_ids: List[int] = Field(..., min_length=1, description="Seznam ID kusů vybavení k zapůjčení/rezervaci")
    rental_start: datetime = Field(..., description="Začátek výpůjčky / rezervace")
    rental_end: datetime = Field(..., description="Plánovaný konec výpůjčky / rezervace")
    is_reservation: bool = Field(default=False, description="True = rezervace předem (RESERVED), False = okamžitý výdej (ACTIVE)")
    discount_amount: float = Field(default=0.0, ge=0.0, description="Manuální sleva obsluhou v Kč")
    notes: Optional[str] = Field(default=None, max_length=1000)


class ReturnItemRequest(BaseModel):
    returned_at: Optional[datetime] = Field(default=None, description="Čas vrácení (výchozí: aktuální UTC čas)")
    item_return_condition: EquipmentCondition = Field(default=EquipmentCondition.GOOD, description="Stav kusu při vrácení")
    send_to_service: bool = Field(default=False, description="Odeslat kus rovnou do servisu (např. při poškození)")
    notes: Optional[str] = Field(default=None, max_length=1000)


class RentalItemEquipmentSummary(BaseModel):
    id: int
    inventory_number: str
    name: str
    category: str
    size: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class RentalItemResponse(BaseModel):
    id: int
    rental_id: int
    equipment_item_id: int
    agreed_daily_rate: float
    agreed_deposit: float
    returned_at: Optional[datetime] = None
    late_penalty: float
    item_return_condition: Optional[EquipmentCondition] = None
    notes: Optional[str] = None
    equipment_item: Optional[RentalItemEquipmentSummary] = None

    model_config = ConfigDict(from_attributes=True)


class RentalResponse(BaseModel):
    id: int
    customer_id: int
    rental_start: datetime
    rental_end: datetime
    total_deposit: float
    discount_amount: float
    total_price: float
    tariff_type: str = "STANDARD"
    status: RentalStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None
    items: List[RentalItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
