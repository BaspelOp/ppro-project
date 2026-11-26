from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.report import (
    ActiveOverdueSummaryResponse,
    UtilizationReportResponse,
)
from app.services.report_service import ReportService

router = APIRouter()


@router.get(
    "/active-overdue",
    response_model=ActiveOverdueSummaryResponse,
    summary="Přehled aktuálně zapůjčených kusů a prodlení s vrácením",
)
def get_active_and_overdue_report(db: Session = Depends(get_db)):
    service = ReportService(db)
    return service.get_active_and_overdue()


@router.get(
    "/utilization",
    response_model=UtilizationReportResponse,
    summary="Statistika vytíženosti vybavení a kategorií (podklad pro dokupování)",
)
def get_utilization_report(db: Session = Depends(get_db)):
    service = ReportService(db)
    return service.get_utilization_report()
