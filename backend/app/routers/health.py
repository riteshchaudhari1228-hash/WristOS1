from datetime import datetime
from fastapi import APIRouter, Query, Response
from app.schemas.health_schemas import TodayHealthMetrics, AnalyticsOverview
from app.services.health_service import health_service
from app.services.ble_service import ble_service

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("/today", response_model=TodayHealthMetrics)
def get_today_health(device_id: str = "sample-device"):
    current_session = ble_service.get_current_device_state()
    metrics = health_service.get_today_metrics(
        device_id=device_id,
        live_battery=current_session.battery_level,
        live_hr=current_session.last_heart_rate
    )
    if current_session.connection_mode != "DEMO_SIMULATED":
        metrics.data_source_badge = "LIVE_GATT" if current_session.is_connected else "HISTORICAL_SYNC"
    return metrics

@router.get("/analytics", response_model=AnalyticsOverview)
def get_analytics(
    period: str = Query("7_DAYS", description="7_DAYS or 30_DAYS"),
    device_id: str = "sample-device"
):
    overview = health_service.get_analytics(period=period, device_id=device_id)
    current_session = ble_service.get_current_device_state()
    if current_session.connection_mode != "DEMO_SIMULATED":
        overview.data_source = "HEALTH_CONNECT_SYNC"
    return overview

@router.get("/export-csv")
def export_csv(period: str = Query("7_DAYS", description="7_DAYS or 30_DAYS")):
    csv_data = health_service.generate_csv_export(period=period)
    filename = f"wristos_activity_{period.lower()}_{datetime.now().strftime('%Y%m%d')}.csv"
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
