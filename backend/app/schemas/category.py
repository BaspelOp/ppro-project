from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class CategoryBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=50, description="Unikátní kód kategorie (např. SKIS)")
    name: str = Field(..., min_length=2, max_length=100, description="Název kategorie")
    default_daily_rate: float = Field(default=250.0, ge=0.0, description="Výchozí denní sazba (Kč)")
    default_deposit: float = Field(default=1000.0, ge=0.0, description="Výchozí kauce (Kč)")
    description: Optional[str] = Field(default=None, max_length=500)


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    default_daily_rate: Optional[float] = Field(default=None, ge=0.0)
    default_deposit: Optional[float] = Field(default=None, ge=0.0)
    description: Optional[str] = Field(default=None, max_length=500)


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
