from typing import Optional, List, Dict, Any
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from app.models.equipment import EquipmentItem, EquipmentCategory, EquipmentStatus
from app.repositories.base import BaseRepository


class EquipmentRepository(BaseRepository[EquipmentItem]):
    def __init__(self, db: Session):
        super().__init__(EquipmentItem, db)

    def get_by_inventory_number(self, inventory_number: str) -> Optional[EquipmentItem]:
        return self.db.query(EquipmentItem).filter(
            func.lower(EquipmentItem.inventory_number) == inventory_number.strip().lower()
        ).first()

    def search_and_filter(
        self,
        category: Optional[EquipmentCategory] = None,
        status: Optional[EquipmentStatus] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[EquipmentItem]:
        query = self.db.query(EquipmentItem)

        if category:
            query = query.filter(EquipmentItem.category == category)
        if status:
            query = query.filter(EquipmentItem.status == status)
        if search:
            search_pattern = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    func.lower(EquipmentItem.name).like(search_pattern),
                    func.lower(EquipmentItem.inventory_number).like(search_pattern),
                    func.lower(EquipmentItem.size).like(search_pattern),
                    func.lower(EquipmentItem.notes).like(search_pattern)
                )
            )

        return query.order_by(EquipmentItem.inventory_number.asc()).offset(skip).limit(limit).all()

    def get_stats(self) -> Dict[str, Any]:
        """Calculates dashboard counts for morning rush overview."""
        total = self.db.query(func.count(EquipmentItem.id)).scalar() or 0
        available = self.db.query(func.count(EquipmentItem.id)).filter(EquipmentItem.status == EquipmentStatus.AVAILABLE).scalar() or 0
        rented = self.db.query(func.count(EquipmentItem.id)).filter(EquipmentItem.status == EquipmentStatus.RENTED).scalar() or 0
        in_service = self.db.query(func.count(EquipmentItem.id)).filter(EquipmentItem.status == EquipmentStatus.IN_SERVICE).scalar() or 0
        discarded = self.db.query(func.count(EquipmentItem.id)).filter(EquipmentItem.status == EquipmentStatus.DISCARDED).scalar() or 0

        # Breakdown by category
        cat_counts = (
            self.db.query(EquipmentItem.category, func.count(EquipmentItem.id))
            .group_by(EquipmentItem.category)
            .all()
        )
        by_category = {cat.value if hasattr(cat, 'value') else str(cat): count for cat, count in cat_counts}

        return {
            "total": total,
            "available": available,
            "rented": rented,
            "in_service": in_service,
            "discarded": discarded,
            "by_category": by_category,
        }
