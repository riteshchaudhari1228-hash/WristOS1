from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime
from app.database import Base

class ActivityDailySummary(Base):
    __tablename__ = "activity_daily_summaries"

    date = Column(String, primary_key=True, index=True) # YYYY-MM-DD
    steps = Column(Integer, default=0)
    step_goal = Column(Integer, default=10000)
    distance_km = Column(Float, default=0.0)
    calories = Column(Integer, default=0)
    active_minutes = Column(Integer, default=0)
    avg_heart_rate = Column(Integer, default=72)
    min_heart_rate = Column(Integer, default=58)
    max_heart_rate = Column(Integer, default=138)
    sleep_minutes = Column(Integer, default=450)
    deep_sleep_minutes = Column(Integer, default=120)
    light_sleep_minutes = Column(Integer, default=240)
    rem_sleep_minutes = Column(Integer, default=90)
    source = Column(String, default="DEMO_SIMULATED")  # DEMO_SIMULATED, HEALTH_CONNECT_SYNC, LIVE_GATT
    device_id = Column(String, default="sample-device")
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class HealthSample(Base):
    __tablename__ = "health_samples"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    sample_type = Column(String, index=True) # heart_rate, steps, battery, spo2
    value = Column(Float, nullable=False)
    source = Column(String, default="DEMO_SIMULATED")
    device_id = Column(String, default="sample-device")
