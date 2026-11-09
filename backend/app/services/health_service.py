import io
import csv
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from app.schemas.health_schemas import (
    TodayHealthMetrics, AnalyticsOverview, ActivitySummaryItem,
    HealthSampleItem, HealthConnectSyncPayload, HealthConnectSyncResponse
)

MEDICAL_DISCLAIMER = (
    "NOTICE: WristOS telemetry and activity analytics are designed for personal fitness awareness and "
    "engineering demonstration only. WristOS does not provide medical advice, diagnosis, or clinical monitoring. "
    "Consult a certified healthcare provider for medical concerns."
)

class HealthService:
    @staticmethod
    def get_today_metrics(device_id: str = "sample-device", live_battery: int = 84, live_hr: int = 72) -> TodayHealthMetrics:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return TodayHealthMetrics(
            date=today_str,
            steps=8420,
            step_goal=10000,
            step_percentage=84.2,
            distance_km=6.12,
            calories=485,
            calorie_goal=600,
            active_minutes=52,
            heart_rate_current=live_hr,
            heart_rate_resting=62,
            heart_rate_max=134,
            sleep_total_hours=7.4,
            sleep_deep_hours=2.1,
            battery_level=live_battery,
            data_source_badge="DEMO_SIMULATED",
            medical_disclaimer=MEDICAL_DISCLAIMER
        )

    @staticmethod
    def get_analytics(period: str = "7_DAYS", device_id: str = "sample-device") -> AnalyticsOverview:
        num_days = 30 if period == "30_DAYS" else 7
        now = datetime.now(timezone.utc)
        history: List[ActivitySummaryItem] = []
        samples: List[HealthSampleItem] = []

        # Generate realistic trend data
        base_steps = [8420, 10250, 9300, 7150, 11400, 8900, 10450, 9800, 7600, 8900, 12100, 9500, 8300, 10800]
        base_calories = [485, 620, 540, 410, 680, 510, 630, 590, 440, 520, 720, 560, 490, 650]
        base_sleep = [444, 460, 430, 410, 480, 450, 470, 435, 420, 465, 490, 440, 430, 475]
        base_hr = [72, 74, 69, 71, 75, 70, 73, 68, 72, 76, 73, 70, 69, 74]

        total_steps = 0
        total_calories = 0
        total_sleep_minutes = 0
        total_hr = 0

        for i in range(num_days):
            day_date = (now - timedelta(days=num_days - 1 - i)).strftime("%Y-%m-%d")
            idx = i % len(base_steps)
            steps = base_steps[idx]
            cals = base_calories[idx]
            sleep = base_sleep[idx]
            hr = base_hr[idx]

            total_steps += steps
            total_calories += cals
            total_sleep_minutes += sleep
            total_hr += hr

            deep_sleep = int(sleep * 0.28)
            light_sleep = int(sleep * 0.52)
            rem_sleep = sleep - deep_sleep - light_sleep

            history.append(
                ActivitySummaryItem(
                    date=day_date,
                    steps=steps,
                    step_goal=10000,
                    distance_km=round(steps * 0.00078, 2),
                    calories=cals,
                    active_minutes=int(steps / 150),
                    avg_heart_rate=hr,
                    min_heart_rate=58 + (i % 5),
                    max_heart_rate=132 + (i % 15),
                    sleep_minutes=sleep,
                    deep_sleep_minutes=deep_sleep,
                    light_sleep_minutes=light_sleep,
                    rem_sleep_minutes=rem_sleep,
                    source="DEMO_SIMULATED",
                    device_id=device_id
                )
            )

        # 24-hour sample points for intraday Heart Rate curve
        for hour in range(0, 24, 2):
            sample_time = now.replace(hour=hour, minute=0, second=0, microsecond=0)
            val = 60 + (hour * 2.5) if hour < 14 else 95 - ((hour - 14) * 3)
            samples.append(
                HealthSampleItem(
                    timestamp=sample_time,
                    sample_type="heart_rate",
                    value=round(val, 1),
                    source="DEMO_SIMULATED",
                    device_id=device_id
                )
            )

        return AnalyticsOverview(
            period=period,
            total_steps=total_steps,
            avg_daily_steps=int(total_steps / num_days),
            total_calories=total_calories,
            avg_sleep_hours=round((total_sleep_minutes / num_days) / 60, 1),
            avg_heart_rate=int(total_hr / num_days),
            daily_history=history,
            heart_rate_samples=samples,
            data_source="DEMO_SIMULATED",
            medical_disclaimer=MEDICAL_DISCLAIMER
        )

    @staticmethod
    def generate_csv_export(period: str = "7_DAYS") -> str:
        overview = HealthService.get_analytics(period=period)
        output = io.StringIO()
        writer = csv.writer(output)

        # Header metadata
        writer.writerow(["# WRISTOS HEALTH EXPORT"])
        writer.writerow(["# Generated At", datetime.now(timezone.utc).isoformat()])
        writer.writerow(["# Disclaimer", MEDICAL_DISCLAIMER])
        writer.writerow([])

        # Table Header
        writer.writerow([
            "Date", "Steps", "Step Goal", "Distance (km)", "Calories Burned (kcal)",
            "Active Minutes", "Avg Heart Rate (BPM)", "Min HR", "Max HR",
            "Total Sleep (mins)", "Deep Sleep (mins)", "Light Sleep (mins)", "REM Sleep (mins)", "Data Source"
        ])

        for item in overview.daily_history:
            writer.writerow([
                item.date,
                item.steps,
                item.step_goal,
                item.distance_km,
                item.calories,
                item.active_minutes,
                item.avg_heart_rate,
                item.min_heart_rate,
                item.max_heart_rate,
                item.sleep_minutes,
                item.deep_sleep_minutes,
                item.light_sleep_minutes,
                item.rem_sleep_minutes,
                item.source
            ])

        return output.getvalue()

    @staticmethod
    def process_companion_sync(payload: HealthConnectSyncPayload) -> HealthConnectSyncResponse:
        processed_count = len(payload.steps_records) + len(payload.heart_rate_records) + len(payload.sleep_sessions)
        updated_dates = list({datetime.now(timezone.utc).strftime("%Y-%m-%d")})
        return HealthConnectSyncResponse(
            status="SUCCESS",
            records_processed=processed_count,
            updated_dates=updated_dates,
            message=f"Successfully ingested {processed_count} Health Connect metrics from {payload.client_device_name}."
        )

health_service = HealthService()
