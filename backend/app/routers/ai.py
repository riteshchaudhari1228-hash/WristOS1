from typing import List
from fastapi import APIRouter
from app.schemas.ai_schemas import WristPilotRequest, WristPilotResponse
from app.services.ai_pilot_service import ai_pilot_service

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/command", response_model=WristPilotResponse)
def execute_wristpilot_command(req: WristPilotRequest):
    return ai_pilot_service.process_command(req)

@router.get("/suggestions", response_model=List[str])
def get_prompt_suggestions():
    return [
        "Design a black and gold watch face",
        "Show my steps from this week",
        "Find my connected watch",
        "Why does my watch keep disconnecting?",
        "Create a college presentation watch theme",
        "Summarize my last seven days of activity",
        "Prepare a morning routine"
    ]
