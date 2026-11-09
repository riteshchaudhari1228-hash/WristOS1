from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException
from app.schemas.health_schemas import HealthConnectSyncPayload, HealthConnectSyncResponse
from app.services.health_service import health_service
from app.services.ble_service import ble_service
from app.core.config import settings

router = APIRouter(prefix="/api/companion", tags=["companion"])

@router.post("/sync", response_model=HealthConnectSyncResponse)
def sync_companion_data(payload: HealthConnectSyncPayload, x_bridge_token: str = Header(None)):
    # Verify companion token if present
    if x_bridge_token and x_bridge_token != settings.COMPANION_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Invalid Companion Bridge Authorization Token")

    # Ingest health records
    response = health_service.process_companion_sync(payload)

    # If steps or heart rate records were provided, update active session state
    if payload.heart_rate_records:
        latest_hr = payload.heart_rate_records[-1].get("beats_per_minute", 74)
        ble_service.update_telemetry(heart_rate=int(latest_hr))

    return response

@router.get("/status")
def get_bridge_status():
    session = ble_service.get_current_device_state()
    return {
        "bridge_server_active": True,
        "companion_api_version": "1.2.0",
        "pairing_code": "WRIST-7824",
        "last_sync_timestamp": session.last_synced_at.isoformat(),
        "active_device_id": session.device_model_id,
        "active_device_name": session.device_name,
        "is_connected": session.is_connected,
        "supported_sources": ["Health Connect (Android 14+)", "Native BluetoothLeScanner", "GATT Client"]
    }

@router.post("/pair")
def pair_companion_device(payload: dict):
    pairing_code = payload.get("pairing_code", "")
    device_name = payload.get("device_name", "Android Companion Device")
    if pairing_code != "WRIST-7824":
        raise HTTPException(status_code=400, detail="Invalid 6-character Pairing Code")

    return {
        "status": "PAIRED",
        "access_token": settings.COMPANION_SECRET_KEY,
        "device_name": device_name,
        "paired_at": datetime.now(timezone.utc).isoformat()
    }
