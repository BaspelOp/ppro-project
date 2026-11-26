from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ServiceRecordCreate(BaseModel):
    equipment_item_id: int
    issue_description: str = Field(..., min_length=2, max_length=1000)
    cost: float = Field(default=0.0, ge=0.0)


class ServiceRecordResponse(BaseModel):
    id: int
    equipment_item_id: int
    service_start: datetime
    service_end: Optional[datetime] = None
    issue_description: str
    resolution_notes: Optional[str] = None
    cost: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
