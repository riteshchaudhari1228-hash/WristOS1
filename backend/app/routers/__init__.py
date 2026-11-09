from app.routers.devices import router as devices_router
from app.routers.watchfaces import router as watchfaces_router
from app.routers.health import router as health_router
from app.routers.ai import router as ai_router
from app.routers.automations import router as automations_router
from app.routers.companion import router as companion_router

__all__ = [
    "devices_router",
    "watchfaces_router",
    "health_router",
    "ai_router",
    "automations_router",
    "companion_router"
]
