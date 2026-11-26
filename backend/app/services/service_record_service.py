from typing import List
from sqlalchemy.orm import Session
from app.models.service_record import ServiceRecord
from app.repositories.service_record_repository import ServiceRecordRepository


class ServiceRecordService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = ServiceRecordRepository(db)

    def list_for_item(self, equipment_item_id: int) -> List[ServiceRecord]:
        return self.repository.list_for_item(equipment_item_id)

    def list_all(self, skip: int = 0, limit: int = 100) -> List[ServiceRecord]:
        return self.repository.list_all(skip=skip, limit=limit)
