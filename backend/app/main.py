from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, SessionLocal
from app.models.base import Base
from app.seed import seed_database
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializace schématu databáze
    Base.metadata.create_all(bind=engine)
    
    # Automatické naplnění syntetickými daty pro půjčovnu, pokud je DB prázdná
    db = SessionLocal()
    try:
        count = seed_database(db)
        if count > 0:
            print(f"[SEED] Úspěšně vloženo {count} vzorových kusů vybavení pro půjčovnu 'Hory a voda'.")
    finally:
        db.close()
    
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Informační systém půjčovny vybavení 'Hory a voda' (PPRO Semestrální projekt - Zadání D)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# Nastavení CORS pro komunikaci s frontendem
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Začlenění API routerů
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


from pathlib import Path
from fastapi.staticfiles import StaticFiles

# Pokud existuje zkompilovaný frontend (frontend/dist), servírujeme jej přímo
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": f"Vítejte v API systému {settings.PROJECT_NAME}",
            "docs": f"{settings.API_V1_STR}/docs",
            "version": settings.VERSION
        }

