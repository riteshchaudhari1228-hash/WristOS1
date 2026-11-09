from typing import List, Optional
from app.schemas.automation_schemas import (
    AdaptiveThemePresetSchema, RoutineItemSchema, RoutineCreateRequest
)

ADAPTIVE_PRESETS: List[AdaptiveThemePresetSchema] = [
    AdaptiveThemePresetSchema(
        id="ctx-college",
        context_name="College",
        display_title="Academic & Campus Lecture",
        description="High-contrast crisp typography designed for lecture halls, timetable awareness, and subtle silent vibration alerts.",
        recommended_theme="college",
        recommended_style="digital",
        palette={"primary": "#38BDF8", "secondary": "#0F172A", "accent": "#FBBF24"},
        recommended_complications=["Date & Day", "Silent Battery Indicator", "Class Schedule Timer"],
        routine_suggestion="Set silent vibration alerts; mute audio chime during lecture slots (09:00 - 16:00)."
    ),
    AdaptiveThemePresetSchema(
        id="ctx-work",
        context_name="Work",
        display_title="Corporate & Focus Work",
        description="Refined executive analog aesthetic with unobtrusive date and calendar complications.",
        recommended_theme="business",
        recommended_style="analog",
        palette={"primary": "#FFD700", "secondary": "#18181B", "accent": "#E2E8F0"},
        recommended_complications=["Calendar Next Meeting", "Battery %", "Resting Heart Rate"],
        routine_suggestion="Desk stretch reminders every 50 minutes; filter phone notifications to VIP only."
    ),
    AdaptiveThemePresetSchema(
        id="ctx-workout",
        context_name="Workout",
        display_title="High-Intensity Sports & Gym",
        description="High-visibility neon green and amber dials with real-time Heart Rate zone alerts and active calories.",
        recommended_theme="sports",
        recommended_style="digital",
        palette={"primary": "#22C55E", "secondary": "#111827", "accent": "#EF4444"},
        recommended_complications=["Live BPM Zone", "Step Cadence", "Active Calories", "Lap Timer"],
        routine_suggestion="High-cadence interval pacing timer; elevate screen backlight to 100% outdoors."
    ),
    AdaptiveThemePresetSchema(
        id="ctx-travel",
        context_name="Travel",
        display_title="Transit & Outdoor Commute",
        description="Dual time-zone support, weather outlook, and battery conservation mode.",
        recommended_theme="minimal",
        recommended_style="digital",
        palette={"primary": "#00F2FE", "secondary": "#1E293B", "accent": "#38BDF8"},
        recommended_complications=["Battery Saver Mode", "Step Count", "Weather Forecast", "Compass"],
        routine_suggestion="Toggle Bluetooth sleep intervals to maximize multi-day watch battery endurance."
    ),
    AdaptiveThemePresetSchema(
        id="ctx-night",
        context_name="Night",
        display_title="Wind-Down & Sleep Recovery",
        description="Ultra-dim monochromatic red/deep-amber night shift dial preventing blue-light melatonin suppression.",
        recommended_theme="minimal",
        recommended_style="minimal",
        palette={"primary": "#EF4444", "secondary": "#050505", "accent": "#7F1D1D"},
        recommended_complications=["Sleep Schedule", "Alarm Clock", "Do Not Disturb Indicator"],
        routine_suggestion="Turn off tilt-to-wake gesture; enable Sleep Stage telemetry tracking."
    )
]

ROUTINES_STORE: List[RoutineItemSchema] = [
    RoutineItemSchema(
        id="rt-01",
        title="Campus Lecture Day",
        trigger_time="08:30",
        context_name="College",
        is_enabled=True,
        actions=[
            "Switch virtual preview to Campus Horizon theme",
            "Mute loud watch notifications until 16:30",
            "Schedule hydration reminders every 90 minutes"
        ],
        notes="Active on weekdays (Monday to Friday)"
    ),
    RoutineItemSchema(
        id="rt-02",
        title="Evening Gym Session",
        trigger_time="18:00",
        context_name="Workout",
        is_enabled=True,
        actions=[
            "Switch to Aero Dynamic Sports watch face",
            "Activate Heart Rate Zone continuous monitoring",
            "Log calorie burn targets (Goal: 500 kcal)"
        ],
        notes="Mon, Wed, Fri workout regimen"
    ),
    RoutineItemSchema(
        id="rt-03",
        title="Deep Sleep Wind Down",
        trigger_time="22:30",
        context_name="Night",
        is_enabled=True,
        actions=[
            "Disable watch wrist-raise display wake gesture",
            "Enable Health Connect Sleep Stage recording",
            "Dim ambient screen brightness to lowest level"
        ],
        notes="Daily night routine"
    )
]

class AutomationService:
    @staticmethod
    def get_adaptive_presets() -> List[AdaptiveThemePresetSchema]:
        return ADAPTIVE_PRESETS

    @staticmethod
    def get_preset_by_context(context_name: str) -> Optional[AdaptiveThemePresetSchema]:
        for p in ADAPTIVE_PRESETS:
            if p.context_name.lower() == context_name.lower():
                return p
        return None

    @staticmethod
    def get_routines() -> List[RoutineItemSchema]:
        return ROUTINES_STORE

    @staticmethod
    def create_routine(data: RoutineCreateRequest) -> RoutineItemSchema:
        new_rt = RoutineItemSchema(
            id=f"rt-{len(ROUTINES_STORE) + 1:02d}",
            title=data.title,
            trigger_time=data.trigger_time,
            context_name=data.context_name,
            is_enabled=True,
            actions=data.actions,
            notes=data.notes or ""
        )
        ROUTINES_STORE.append(new_rt)
        return new_rt

    @staticmethod
    def toggle_routine(routine_id: str) -> Optional[RoutineItemSchema]:
        for r in ROUTINES_STORE:
            if r.id == routine_id:
                r.is_enabled = not r.is_enabled
                return r
        return None

automation_service = AutomationService()
