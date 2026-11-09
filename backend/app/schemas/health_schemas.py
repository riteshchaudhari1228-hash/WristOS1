from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ActivitySummaryItem(BaseModel):
    date: str
    steps: int
    step_goal: int
    distance_km: float
    calories: int
    active_minutes: int
    avg_heart_rate: int
    min_heart_rate: int
    max_heart_rate: int
    sleep_minutes: int
    deep_sleep_minutes: int
    light_sleep_minutes: int
    rem_sleep_minutes: int
    source: str
    device_id: str

class HealthSampleItem(BaseModel):
    timestamp: datetime
    sample_type: str  # heart_rate, steps, battery, spo2
    value: float
    source: str
    device_id: str

class TodayHealthMetrics(BaseModel):
    date: str
    steps: int
    step_goal: int
    step_percentage: float
    distance_km: float
    calories: int
    calorie_goal: int
    active_minutes: int
    heart_rate_current: int
    heart_rate_resting: int
    heart_rate_max: int
    sleep_total_hours: float
    sleep_deep_hours: float
    battery_level: int
    data_source_badge: str  # LIVE_GATT, HEALTH_CONNECT_SYNC, DEMO_SIMULATED
    medical_disclaimer: str

class AnalyticsOverview(BaseModel):
    period: str  # "7_DAYS", "30_DAYS"
    total_steps: int
    avg_daily_steps: int
    total_calories: int
    avg_sleep_hours: float
    avg_heart_rate: int
    daily_history: List[ActivitySummaryItem]
    heart_rate_samples: List[HealthSampleItem]
    data_source: str
    medical_disclaimer: str

class HealthConnectSyncPayload(BaseModel):
    client_device_name: str
    health_connect_package_version: Optional[str] = "1.0.0-alpha11"
    records_count: int
    steps_records: List[dict] = []
    heart_rate_records: List[dict] = []
    sleep_sessions: List[dict] = []
    calories_records: List[dict] = []
    sync_timestamp: datetime = Field(default_factory=datetime.utcnow)

class HealthConnectSyncResponse(BaseModel):
    status: str
    records_processed: int
    updated_dates: List[str]
    message: str
