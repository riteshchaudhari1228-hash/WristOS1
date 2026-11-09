import math
from datetime import datetime, timezone
from typing import Optional
from app.schemas.device_schemas import ConnectedDeviceState, FindWatchCommand, FindWatchResponse
from app.services.compatibility_service import compatibility_service

class BleService:
    def __init__(self):
        # Default active session in DEMO_SIMULATED mode
        self.active_session = ConnectedDeviceState(
            id="session-demo-01",
            device_model_id="boat-wave-call-2",
            device_name="boAt Wave Call 2 (Demo)",
            mac_address="D4:F5:13:88:21:40",
            connection_mode="DEMO_SIMULATED",
            is_connected=True,
            battery_level=86,
            last_heart_rate=72,
            rssi=-64,
            firmware_version="v2.1.04-RTOS",
            connected_at=datetime.now(timezone.utc),
            last_synced_at=datetime.now(timezone.utc)
        )

    def get_current_device_state(self) -> ConnectedDeviceState:
        return self.active_session

    def connect_device(self, device_model_id: str, mode: str = "DEMO_SIMULATED", name: Optional[str] = None, mac: Optional[str] = None) -> ConnectedDeviceState:
        device = compatibility_service.get_device_by_id(device_model_id)
        dev_name = name or (f"{device.model_name} (Connected)" if mode != "DEMO_SIMULATED" else f"{device.model_name} (Demo)") if device else "Smartwatch"

        self.active_session = ConnectedDeviceState(
            id=f"session-{int(datetime.now(timezone.utc).timestamp())}",
            device_model_id=device_model_id,
            device_name=dev_name,
            mac_address=mac or "D4:F5:13:88:21:40",
            connection_mode=mode,
            is_connected=True,
            battery_level=88 if mode == "DEMO_SIMULATED" else 79,
            last_heart_rate=74 if mode == "DEMO_SIMULATED" else 68,
            rssi=-62 if mode == "DEMO_SIMULATED" else -58,
            firmware_version="v2.1.04-RTOS",
            connected_at=datetime.now(timezone.utc),
            last_synced_at=datetime.now(timezone.utc)
        )
        return self.active_session

    def disconnect_device(self) -> ConnectedDeviceState:
        self.active_session.is_connected = False
        return self.active_session

    def update_telemetry(self, battery: Optional[int] = None, heart_rate: Optional[int] = None, rssi: Optional[int] = None):
        if battery is not None:
            self.active_session.battery_level = battery
        if heart_rate is not None:
            self.active_session.last_heart_rate = heart_rate
        if rssi is not None:
            self.active_session.rssi = rssi
        self.active_session.last_synced_at = datetime.now(timezone.utc)

    def execute_find_watch(self, command: FindWatchCommand) -> FindWatchResponse:
        device = compatibility_service.get_device_by_id(command.device_id)
        has_buzzer = device.has_immediate_alert if device else False

        # Calculate estimated distance using Log-Distance Path Loss Model
        # d = 10 ^ ((MeasuredPower - RSSI) / (10 * n))
        # MeasuredPower = -59 dBm at 1m, n = 2.4 (indoor environment with slight obstacles)
        current_rssi = self.active_session.rssi or -65
        measured_power = -59.0
        n_exponent = 2.4

        try:
            ratio = (measured_power - float(current_rssi)) / (10.0 * n_exponent)
            distance_m = round(math.pow(10, ratio), 2)
            distance_m = max(0.2, min(distance_m, 15.0))
        except Exception:
            distance_m = 2.1

        if distance_m < 1.0:
            proximity = "Immediate (< 1 meter)"
        elif distance_m < 3.0:
            proximity = "Near (1 - 3 meters)"
        elif distance_m < 8.0:
            proximity = "Far (3 - 8 meters)"
        else:
            proximity = "Edge of Range (> 8 meters)"

        warning = (
            "PHYSICAL INTERFERENCE WARNING: Bluetooth Low Energy 2.4GHz signals are heavily attenuated by human "
            "tissue (10-15 dB drop when worn on wrist), concrete walls, metal appliances, and WiFi router interference. "
            "Proximity distance is an approximation based on RF path-loss models."
        )

        if has_buzzer:
            msg = (
                f"Immediate Alert Service (0x1802) triggered on {device.model_name}. "
                f"Hardware buzzer and vibration activated at level {command.alert_level}."
            )
        else:
            msg = (
                f"{device.model_name if device else 'This smartwatch'} does not expose standard GATT Immediate Alert (0x1802). "
                "Hardware buzzer unavailable via direct Web Bluetooth. Use the Proximity Radar to track signal strength."
            )

        return FindWatchResponse(
            device_id=command.device_id,
            action_executed=command.action,
            success=True,
            is_hardware_alert=has_buzzer,
            rssi=current_rssi,
            estimated_proximity_level=proximity,
            estimated_distance_meters=distance_m,
            radar_angle_deg=45,
            interference_warning=warning,
            message=msg,
            last_known_timestamp=self.active_session.last_synced_at
        )

ble_service = BleService()
