from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.automation_schemas import (
    AdaptiveThemePresetSchema, RoutineItemSchema, RoutineCreateRequest
)
from app.services.automation_service import automation_service

router = APIRouter(prefix="/api/automations", tags=["automations"])

@router.get("/adaptive-themes", response_model=List[AdaptiveThemePresetSchema])
def get_adaptive_themes():
    return automation_service.get_adaptive_presets()

@router.get("/routines", response_model=List[RoutineItemSchema])
def get_routines():
    return automation_service.get_routines()

@router.post("/routines", response_model=RoutineItemSchema)
def create_routine(req: RoutineCreateRequest):
    return automation_service.create_routine(req)

@router.post("/routines/{routine_id}/toggle", response_model=RoutineItemSchema)
def toggle_routine(routine_id: str):
    rt = automation_service.toggle_routine(routine_id)
    if not rt:
        raise HTTPException(status_code=404, detail="Routine not found")
    return rt
