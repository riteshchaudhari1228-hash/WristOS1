import json
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text
from app.database import Base

class DeviceRegistryItem(Base):
    __tablename__ = "device_registry"

    id = Column(String, primary_key=True, index=True)
    brand = Column(String, index=True, nullable=False)
    model_name = Column(String, nullable=False)
    shape = Column(String, default="square")  # square, round, rect
    resolution_width = Column(Integer, default=240)
    resolution_height = Column(Integer, default=280)
    screen_type = Column(String, default="TFT / AMOLED")
    screen_size = Column(String, default="1.72\"")
    companion_app = Column(String, nullable=False)
    companion_package = Column(String, default="")
    chipset = Column(String, default="Realtek / Goodix / JL")
    ble_name_prefix = Column(String, default="")
    supported_services_json = Column(Text, default="[]")
    has_standard_heart_rate = Column(Boolean, default=False)
    has_standard_battery = Column(Boolean, default=True)
    has_immediate_alert = Column(Boolean, default=False)
    custom_wallpaper_export = Column(Boolean, default=True)
    direct_ota_watchface = Column(Boolean, default=False)
    verification_level = Column(String, default="PARTIAL_HYBRID")
    limitations_notes = Column(Text, default="")
    app_guide_steps_json = Column(Text, default="[]")

    def get_services(self) -> list[str]:
        try:
            return json.loads(self.supported_services_json or "[]")
        except Exception:
            return []

    def get_guide_steps(self) -> list[str]:
        try:
            return json.loads(self.app_guide_steps_json or "[]")
        except Exception:
            return []

class ConnectedDeviceSession(Base):
    __tablename__ = "connected_device_sessions"

    id = Column(String, primary_key=True, index=True)
    device_model_id = Column(String, nullable=False)
    device_name = Column(String, nullable=False)
    mac_address = Column(String, default="AA:BB:CC:DD:EE:FF")
    connection_mode = Column(String, default="DEMO_SIMULATED")  # DEMO_SIMULATED, CONNECTED_BLE, CONNECTED_COMPANION
    is_connected = Column(Boolean, default=True)
    battery_level = Column(Integer, default=82)
    last_heart_rate = Column(Integer, default=74)
    rssi = Column(Integer, default=-62)
    firmware_version = Column(String, default="v2.1.04-RTOS")
    connected_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_synced_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ConnectionLog(Base):
    __tablename__ = "connection_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String, index=True)
    event_type = Column(String)  # DISCOVERY, CONNECT, DISCONNECT, ALERT_TRIGGER, RSSI_SAMPLE, ERROR
    message = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
