import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.models.base import Base
from app.models.equipment import EquipmentCondition


class RentalStatus(str, enum.Enum):
    RESERVED = "RESERVED"                      # Rezervace předem
    ACTIVE = "ACTIVE"                          # Aktivní výpůjčka (vyzvednuto)
    PARTIALLY_RETURNED = "PARTIALLY_RETURNED"  # Část kusů již vrácena
    RETURNED = "RETURNED"                      # Všechny kusy vráceny, smlouva uzavřena
    CANCELLED = "CANCELLED"                    # Zrušená rezervace (historie zachována)
    EXPIRED = "EXPIRED"                        # Nevyzvednutá rezervace po expiraci (OB-2)


class Rental(Base):
    __tablename__ = "rentals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    rental_start = Column(DateTime, nullable=False, index=True)
    rental_end = Column(DateTime, nullable=False, index=True)
    total_deposit = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    total_price = Column(Float, nullable=False, default=0.0)
    status = Column(SQLEnum(RentalStatus, native_enum=False), nullable=False, default=RentalStatus.ACTIVE, index=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    customer = relationship("Customer", back_populates="rentals")
    items = relationship("RentalItem", back_populates="rental", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Rental(id={self.id}, customer_id={self.customer_id}, status={self.status})>"


class RentalItem(Base):
    """Vazební tabulka M:N mezi Rental a EquipmentItem s atributy výpůjčky kusu."""
    __tablename__ = "rental_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    rental_id = Column(Integer, ForeignKey("rentals.id"), nullable=False, index=True)
    equipment_item_id = Column(Integer, ForeignKey("equipment_items.id"), nullable=False, index=True)
    agreed_daily_rate = Column(Float, nullable=False)
    agreed_deposit = Column(Float, nullable=False, default=0.0)
    returned_at = Column(DateTime, nullable=True)
    late_penalty = Column(Float, nullable=False, default=0.0)
    item_return_condition = Column(SQLEnum(EquipmentCondition, native_enum=False), nullable=True)
    notes = Column(Text, nullable=True)

    rental = relationship("Rental", back_populates="items")
    equipment_item = relationship("EquipmentItem", back_populates="rental_items")

    def __repr__(self) -> str:
        return f"<RentalItem(id={self.id}, rental_id={self.rental_id}, equipment_item_id={self.equipment_item_id})>"
