from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class DeviceModelInfo(BaseModel):
    id: str
    brand: str
    model_name: str
    shape: str
    resolution_width: int
    resolution_height: int
    screen_type: str
    screen_size: str
    companion_app: str
    companion_package: str
    chipset: str
    ble_name_prefix: str
    supported_services: List[str]
    has_standard_heart_rate: bool
    has_standard_battery: bool
    has_immediate_alert: bool
    custom_wallpaper_export: bool
    direct_ota_watchface: bool
    verification_level: str  # VERIFIED_GATT, PARTIAL_HYBRID, UNSUPPORTED_PROPRIETARY
    limitations_notes: str
    app_guide_steps: List[str]

class DeviceCompatibilityReport(BaseModel):
    device_id: str
    brand: str
    model_name: str
    verification_level: str
    is_fully_supported: bool
    supported_features: List[str]
    unsupported_features: List[str]
    companion_app: str
    chipset_notes: str
    wallpaper_resolution: str
    wallpaper_workflow: str
    ble_gatt_status: str
    guide_steps: List[str]

class ConnectDeviceRequest(BaseModel):
    device_model_id: str
    device_name: Optional[str] = None
    mac_address: Optional[str] = "D4:F5:13:88:21:40"
    connection_mode: str = "DEMO_SIMULATED"  # DEMO_SIMULATED, CONNECTED_BLE, CONNECTED_COMPANION

class ConnectedDeviceState(BaseModel):
    id: str
    device_model_id: str
    device_name: str
    mac_address: str
    connection_mode: str
    is_connected: bool
    battery_level: int
    last_heart_rate: int
    rssi: int
    firmware_version: str
    connected_at: datetime
    last_synced_at: datetime

class FindWatchCommand(BaseModel):
    device_id: str
    action: str = "trigger_alert"  # trigger_alert, stop_alert, query_rssi
    alert_level: int = 2  # 0=None, 1=Mild, 2=High Alert (vibrate/buzzer)

class FindWatchResponse(BaseModel):
    device_id: str
    action_executed: str
    success: bool
    is_hardware_alert: bool
    rssi: Optional[int] = None
    estimated_proximity_level: str  # "Immediate (< 1m)", "Near (1-3m)", "Far (3-10m)", "Out of range / Unreachable"
    estimated_distance_meters: Optional[float] = None
    radar_angle_deg: int = 45
    interference_warning: str
    message: str
    last_known_timestamp: datetime
