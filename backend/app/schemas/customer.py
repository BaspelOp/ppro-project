from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, description="Jméno a příjmení zákazníka")
    phone: str = Field(..., min_length=6, max_length=30, description="Telefonní číslo")
    email: Optional[str] = Field(default=None, max_length=150, description="E-mailová adresa")
    id_card_number: str = Field(..., min_length=4, max_length=50, description="Číslo občanského průkazu nebo pasu")
    notes: Optional[str] = Field(default=None, max_length=1000, description="Poznámka k zákazníkovi")


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    phone: Optional[str] = Field(default=None, min_length=6, max_length=30)
    email: Optional[str] = Field(default=None, max_length=150)
    id_card_number: Optional[str] = Field(default=None, min_length=4, max_length=50)
    notes: Optional[str] = Field(default=None, max_length=1000)


class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
