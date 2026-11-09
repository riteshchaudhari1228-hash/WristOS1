import json
from sqlalchemy import Column, String, Boolean, Text
from app.database import Base

class AdaptiveThemePreset(Base):
    __tablename__ = "adaptive_theme_presets"

    id = Column(String, primary_key=True)
    context_name = Column(String, unique=True, index=True) # College, Work, Workout, Travel, Night
    display_title = Column(String)
    description = Column(Text)
    recommended_theme = Column(String)
    recommended_style = Column(String)
    palette_json = Column(Text)
    recommended_complications = Column(Text)
    routine_suggestion = Column(Text)

    def get_palette(self) -> dict:
        try:
            return json.loads(self.palette_json or "{}")
        except Exception:
            return {}

class UserRoutine(Base):
    __tablename__ = "user_routines"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    trigger_time = Column(String, default="08:00")
    context_name = Column(String, default="College")
    is_enabled = Column(Boolean, default=True)
    actions_json = Column(Text, default="[]")
    notes = Column(String, default="")

    def get_actions(self) -> list[str]:
        try:
            return json.loads(self.actions_json or "[]")
        except Exception:
            return []
