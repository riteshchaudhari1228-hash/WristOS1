import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "WRISTOS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database: Render provides DATABASE_URL for Postgres; default SQLite for local dev
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./wristos.db")

    DEMO_MODE_DEFAULT: bool = True
    ENABLE_AI_SYNTHESIS: bool = True
    COMPANION_SECRET_KEY: str = os.getenv("COMPANION_SECRET", "wristos-companion-key-secret-2026")

    # PORT: Render injects $PORT at runtime — used in main.py startup
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS origins — set ALLOWED_ORIGINS env var on Render as comma-separated list.
    # Example: https://wristos.vercel.app,https://wristos-preview.vercel.app
    # Defaults to wildcard so local dev and Vercel previews work automatically.
    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        raw = os.getenv("ALLOWED_ORIGINS", "*")
        if raw == "*":
            return ["*"]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

settings = Settings()
