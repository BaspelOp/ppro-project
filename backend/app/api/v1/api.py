from fastapi import APIRouter
from app.api.v1.endpoints import equipment, categories, customers, rentals, service_records, reports

api_router = APIRouter()
api_router.include_router(equipment.router, prefix="/equipment", tags=["Vybavení (Equipment)"])
api_router.include_router(categories.router, prefix="/categories", tags=["Kategorie & Ceník (Categories)"])
api_router.include_router(customers.router, prefix="/customers", tags=["Zákazníci (Customers)"])
api_router.include_router(rentals.router, prefix="/rentals", tags=["Výpůjčky & Rezervace (Rentals)"])
api_router.include_router(service_records.router, prefix="/service-records", tags=["Servisní historie (Service Records)"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reporting & Statistiky (Reports)"])
