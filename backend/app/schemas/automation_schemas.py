from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class AdaptiveThemePresetSchema(BaseModel):
    id: str
    context_name: str
    display_title: str
    description: str
    recommended_theme: str
    recommended_style: str
    palette: Dict[str, str]
    recommended_complications: List[str]
    routine_suggestion: str

class RoutineItemSchema(BaseModel):
    id: str
    title: str
    trigger_time: str
    context_name: str
    is_enabled: bool
    actions: List[str]
    notes: Optional[str] = ""

class RoutineCreateRequest(BaseModel):
    title: str
    trigger_time: str = "07:30"
    context_name: str = "College"
    actions: List[str] = ["Switch to College Watch Face", "Set Do Not Disturb until class ends"]
    notes: Optional[str] = ""
