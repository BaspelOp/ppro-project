from fastapi import APIRouter
from app.api.v1.endpoints import equipment

api_router = APIRouter()
api_router.include_router(equipment.router, prefix="/equipment", tags=["Vybavení (Equipment)"])
