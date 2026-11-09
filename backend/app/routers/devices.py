from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.device_schemas import (
    DeviceModelInfo, DeviceCompatibilityReport, ConnectDeviceRequest,
    ConnectedDeviceState, FindWatchCommand, FindWatchResponse
)
from app.services.compatibility_service import compatibility_service
from app.services.ble_service import ble_service

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.get("", response_model=List[DeviceModelInfo])
def list_devices(brand: Optional[str] = Query(None, description="Filter by brand (Noise, boAt, Fire-Boltt)")):
    return compatibility_service.get_all_devices(brand=brand)

@router.get("/current/session", response_model=ConnectedDeviceState)
def get_current_session():
    return ble_service.get_current_device_state()

@router.get("/{device_id}", response_model=DeviceModelInfo)
def get_device(device_id: str):
    dev = compatibility_service.get_device_by_id(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device '{device_id}' not found in registry.")
    return dev

@router.get("/{device_id}/compatibility", response_model=DeviceCompatibilityReport)
def get_compatibility_report(device_id: str):
    return compatibility_service.evaluate_compatibility(device_id)

@router.post("/connect", response_model=ConnectedDeviceState)
def connect_device(req: ConnectDeviceRequest):
    return ble_service.connect_device(
        device_model_id=req.device_model_id,
        mode=req.connection_mode,
        name=req.device_name,
        mac=req.mac_address
    )

@router.post("/disconnect", response_model=ConnectedDeviceState)
def disconnect_device():
    return ble_service.disconnect_device()

@router.post("/find", response_model=FindWatchResponse)
def find_watch(command: FindWatchCommand):
    return ble_service.execute_find_watch(command)
