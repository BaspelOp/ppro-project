import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.models.base import Base


class EquipmentCategory(str, enum.Enum):
    SKIS = "SKIS"
    SNOWBOARD = "SNOWBOARD"
    BOOTS = "BOOTS"
    POLES = "POLES"
    BOAT = "BOAT"
    RAFT = "RAFT"
    PADDLE = "PADDLE"
    LIFE_JACKET = "LIFE_JACKET"
    HELMET = "HELMET"
    OTHER = "OTHER"


class EquipmentStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"      # K dispozici k zapůjčení
    RENTED = "RENTED"            # Aktuálně půjčeno zákazníkovi
    IN_SERVICE = "IN_SERVICE"    # V servisu / opravě / posezónní údržbě
    DISCARDED = "DISCARDED"      # Vyřazeno z fondu půjčovny


class EquipmentCondition(str, enum.Enum):
    NEW = "NEW"                  # Nové / zánovní
    GOOD = "GOOD"                # Běžné dobré opotřebení
    WORN = "WORN"                # Vyšší opotřebení, funkční
    DAMAGED = "DAMAGED"          # Poškozeno, vyžaduje servis


class EquipmentItem(Base):
    __tablename__ = "equipment_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inventory_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(SQLEnum(EquipmentCategory, native_enum=False), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    size = Column(String(50), nullable=False)
    purchase_year = Column(Integer, nullable=False)
    daily_rate = Column(Float, nullable=False, default=250.0)
    deposit = Column(Float, nullable=False, default=1000.0)
    condition = Column(SQLEnum(EquipmentCondition, native_enum=False), nullable=False, default=EquipmentCondition.GOOD)
    status = Column(SQLEnum(EquipmentStatus, native_enum=False), nullable=False, default=EquipmentStatus.AVAILABLE, index=True)
    service_notes = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    category_rel = relationship("Category", back_populates="equipment_items")
    rental_items = relationship("RentalItem", back_populates="equipment_item")
    service_records = relationship("ServiceRecord", back_populates="equipment_item", order_by="ServiceRecord.service_start.desc()")

    def __repr__(self) -> str:
        return f"<EquipmentItem(id={self.id}, inv={self.inventory_number}, name='{self.name}', status={self.status})>"
