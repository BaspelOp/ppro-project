from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import Base


class ServiceRecord(Base):
    __tablename__ = "service_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    equipment_item_id = Column(Integer, ForeignKey("equipment_items.id"), nullable=False, index=True)
    service_start = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    service_end = Column(DateTime, nullable=True)
    issue_description = Column(Text, nullable=False)
    resolution_notes = Column(Text, nullable=True)
    cost = Column(Float, nullable=False, default=0.0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    equipment_item = relationship("EquipmentItem", back_populates="service_records")

    def __repr__(self) -> str:
        return f"<ServiceRecord(id={self.id}, equipment_item_id={self.equipment_item_id}, cost={self.cost})>"
