from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from app.database import Base

class WatchFaceDesign(Base):
    __tablename__ = "watchface_designs"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    theme = Column(String, default="cyberpunk")  # college, sports, minimal, gaming, cyberpunk, business, neon
    style = Column(String, default="digital")    # digital, analog, hybrid
    target_model_id = Column(String, default="boat-wave-call-2")
    resolution_width = Column(Integer, default=240)
    resolution_height = Column(Integer, default=280)
    clock_font = Column(String, default="Space Grotesk")
    clock_position = Column(String, default="center")  # top, center, bottom
    time_format = Column(String, default="24h")        # 12h, 24h
    primary_color = Column(String, default="#00F2FE")
    secondary_color = Column(String, default="#9d4edd")
    accent_color = Column(String, default="#00FF88")
    background_type = Column(String, default="ai_art")  # ai_art, gradient, pattern, solid, upload
    background_prompt = Column(String, default="")
    background_image_data = Column(Text, default="")
    show_seconds = Column(Boolean, default=True)
    show_date = Column(Boolean, default=True)
    show_steps = Column(Boolean, default=True)
    show_heart_rate = Column(Boolean, default=True)
    show_battery = Column(Boolean, default=True)
    show_calories = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
