from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database import Base, engine
from app.routers import (
    devices_router, watchfaces_router, health_router,
    ai_router, automations_router, companion_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="WRISTOS — Smartwatch Control Platform API",
    description="Full-stack enterprise control center for Noise, boAt, and Fire-Boltt smartwatches.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS — allow origins from env var (Render) or wildcard for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(devices_router)
app.include_router(watchfaces_router)
app.include_router(health_router)
app.include_router(ai_router)
app.include_router(automations_router)
app.include_router(companion_router)

@app.get("/")
def root():
    return {
        "product": "WRISTOS",
        "tagline": "Professional Smartwatch Control Platform",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "supported_brands": ["Noise", "boAt", "Fire-Boltt"],
        "modes": ["DEMO_SIMULATED", "CONNECTED_BLE", "UNSUPPORTED_PROPRIETARY"],
        "docs_url": "/docs"
    }

@app.get("/api/health-check")
def health_check():
    return {"status": "HEALTHY", "service": "wristos-backend"}

if __name__ == "__main__":
    import uvicorn
    # Render provides $PORT at runtime; fallback to 8000 for local dev
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=False
    )
