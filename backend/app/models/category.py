from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from app.models.base import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    default_daily_rate = Column(Float, nullable=False, default=250.0)
    default_deposit = Column(Float, nullable=False, default=1000.0)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    equipment_items = relationship("EquipmentItem", back_populates="category_rel")

    def __repr__(self) -> str:
        return f"<Category(id={self.id}, code='{self.code}', name='{self.name}')>"
