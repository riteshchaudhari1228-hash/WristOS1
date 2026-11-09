from typing import Optional, List, Any
from pydantic import BaseModel, Field

class WristPilotAction(BaseModel):
    tool_name: str
    target_page: Optional[str] = None
    parameters: dict = Field(default_factory=dict)
    confirmation_required: bool = False
    is_supported: bool = True
    hardware_dependent: bool = False

class WristPilotRequest(BaseModel):
    message: str = Field(..., description="User prompt or natural language voice command")
    active_device_id: Optional[str] = "boat-wave-call-2"
    current_page: Optional[str] = "dashboard"

class WristPilotResponse(BaseModel):
    query: str
    intent: str
    reply_message: str
    action: Optional[WristPilotAction] = None
    action_result: Optional[dict] = None
    compatibility_note: Optional[str] = None
    suggested_quick_prompts: List[str] = []
