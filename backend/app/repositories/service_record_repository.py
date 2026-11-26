from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.service_record import ServiceRecord
from app.repositories.base import BaseRepository


class ServiceRecordRepository(BaseRepository[ServiceRecord]):
    def __init__(self, db: Session):
        super().__init__(ServiceRecord, db)

    def get_open_record_for_item(self, equipment_item_id: int) -> Optional[ServiceRecord]:
        return (
            self.db.query(ServiceRecord)
            .filter(
                ServiceRecord.equipment_item_id == equipment_item_id,
                ServiceRecord.service_end.is_(None),
            )
            .order_by(ServiceRecord.service_start.desc())
            .first()
        )

    def list_for_item(self, equipment_item_id: int) -> List[ServiceRecord]:
        return (
            self.db.query(ServiceRecord)
            .filter(ServiceRecord.equipment_item_id == equipment_item_id)
            .order_by(ServiceRecord.service_start.desc())
            .all()
        )

    def list_all(self, skip: int = 0, limit: int = 100) -> List[ServiceRecord]:
        return (
            self.db.query(ServiceRecord)
            .order_by(ServiceRecord.service_start.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
