from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ActiveRentedItemReport(BaseModel):
    rental_id: int
    rental_item_id: int
    equipment_item_id: int
    inventory_number: str
    equipment_name: str
    category: str
    customer_id: int
    customer_name: str
    customer_phone: str
    rental_start: datetime
    rental_end: datetime
    agreed_daily_rate: float
    is_overdue: bool
    overdue_days: int
    estimated_penalty: float


class ActiveOverdueSummaryResponse(BaseModel):
    active_rentals_count: int
    active_items_count: int
    overdue_items_count: int
    total_estimated_penalty: float
    items: List[ActiveRentedItemReport]


class EquipmentUtilizationItem(BaseModel):
    equipment_item_id: int
    inventory_number: str
    name: str
    category: str
    status: str
    rental_count: int
    total_rented_days: int
    total_revenue: float
    service_count: int
    total_service_cost: float


class CategoryUtilizationItem(BaseModel):
    category: str
    total_items: int
    available_items: int
    rented_items: int
    in_service_items: int
    total_rentals: int
    total_revenue: float
    occupancy_pct: float


class UtilizationReportResponse(BaseModel):
    by_category: List[CategoryUtilizationItem]
    by_equipment: List[EquipmentUtilizationItem]


class ProtocolItem(BaseModel):
    inventory_number: str
    name: str
    size: str
    agreed_daily_rate: float
    agreed_deposit: float
    returned_at: Optional[datetime] = None
    late_penalty: float
    item_return_condition: Optional[str] = None


class RentalProtocolResponse(BaseModel):
    protocol_number: str
    generated_at: datetime
    provider_name: str
    provider_address: str
    rental_id: int
    status: str
    tariff_type: str
    rental_start: datetime
    rental_end: datetime
    billing_days: float
    customer_name: str
    customer_phone: str
    customer_id_card: str
    customer_email: Optional[str] = None
    total_deposit: float
    discount_amount: float
    total_price: float
    total_penalties: float
    notes: Optional[str] = None
    items: List[ProtocolItem]
