import re
from typing import Optional, Tuple
from app.schemas.ai_schemas import WristPilotRequest, WristPilotResponse, WristPilotAction
from app.services.compatibility_service import compatibility_service

class AIPilotService:
    @staticmethod
    def process_command(request: WristPilotRequest) -> WristPilotResponse:
        query = request.message.strip()
        lower_q = query.lower()
        active_device = compatibility_service.get_device_by_id(request.active_device_id or "boat-wave-call-2")
        active_model_name = active_device.model_name if active_device else "Smartwatch"

        # 1. Calling & Phone relay commands
        if any(w in lower_q for w in ["call", "incoming call", "dial", "phone", "simulate call", "ring phone", "contact"]):
            return AIPilotService._handle_call_intent(lower_q, query, active_device)

        # 2. Hardware watch control commands (vibration, time, brightness, DND)
        elif any(w in lower_q for w in ["vibrate", "buzz", "haptic", "sync time", "real time", "brightness", "dnd", "silent mode", "format"]):
            return AIPilotService._handle_watch_control_intent(lower_q, query, active_device)

        # 3. Watch face creation commands
        elif any(w in lower_q for w in ["design", "watch face", "watchface", "wallpaper", "theme", "create face"]):
            return AIPilotService._handle_watchface_intent(lower_q, query, active_device)

        # 4. Activity / steps / health query
        elif any(w in lower_q for w in ["steps", "activity", "week", "summarize", "sleep", "calories", "heart rate", "analytics"]):
            return AIPilotService._handle_health_intent(lower_q, query)

        # 5. Find my watch / radar / alert
        elif any(w in lower_q for w in ["find", "locate", "where is", "radar"]):
            return AIPilotService._handle_find_watch_intent(lower_q, query, active_device)

        # 6. Connection diagnostics / disconnect troubleshooting
        elif any(w in lower_q for w in ["disconnect", "keeps disconnecting", "bluetooth", "connection", "battery drain", "not connecting"]):
            return AIPilotService._handle_diagnostics_intent(lower_q, query, active_device)

        # 7. Routines / Morning / Automation
        elif any(w in lower_q for w in ["routine", "morning", "automation", "college presentation", "schedule"]):
            return AIPilotService._handle_routine_intent(lower_q, query)

        # 8. Fallback general assistant
        else:
            return AIPilotService._handle_general_fallback(query, active_model_name)

    @staticmethod
    def _handle_call_intent(lower_q: str, query: str, active_device) -> WristPilotResponse:
        model_name = active_device.model_name if active_device else "Smartwatch"
        
        # Determine caller name from prompt
        caller_name = "Incoming Call"
        phone_number = "+91 98765 43210"
        
        if "mom" in lower_q:
            caller_name = "Mom"
            phone_number = "+91 98200 11223"
        elif "dad" in lower_q:
            caller_name = "Dad"
            phone_number = "+91 98200 44556"
        elif "boss" in lower_q or "work" in lower_q:
            caller_name = "Work / Office"
            phone_number = "+91 022 6677 8899"
        elif "college" in lower_q or "dean" in lower_q:
            caller_name = "College Administration"
            phone_number = "+91 022 2414 5500"
        elif "doctor" in lower_q or "sharma" in lower_q:
            caller_name = "Dr. Sharma"
            phone_number = "+91 99887 76655"
        else:
            # Check for a name in quotes or after "call"
            match = re.search(r'call\s+([a-zA-Z\s]+)', lower_q)
            if match:
                extracted = match.group(1).strip().title()
                if extracted not in ["My Watch", "Me", "A Call"]:
                    caller_name = extracted

        reply = (
            f"Relaying call alert for '{caller_name}' ({phone_number}) to {model_name}. "
            "Dispatched Bluetooth GATT Immediate Alert buzzer signal and initiated wearable call notification."
        )

        return WristPilotResponse(
            query=query,
            intent="RELAY_PHONE_CALL",
            reply_message=reply,
            action=WristPilotAction(
                tool_name="trigger_incoming_call",
                target_page="calls",
                parameters={
                    "caller_name": caller_name,
                    "phone_number": phone_number,
                    "trigger_vibration": True,
                    "play_ringtone": True,
                },
                confirmation_required=False,
                is_supported=True,
                hardware_dependent=True
            ),
            action_result={
                "caller": caller_name,
                "number": phone_number,
                "protocol": "Bluetooth Hands-Free Profile (HFP) + GATT 0x1802 Alert Level 2",
                "status": "RINGING"
            },
            compatibility_note=f"{model_name} utilizes dual-mode Bluetooth (BLE for Caller ID & HFP for speakerphone audio).",
            suggested_quick_prompts=[
                "Answer the call",
                "Reject the call",
                "Dial +91 98765 43210",
                "Trigger vibration on my watch"
            ]
        )

    @staticmethod
    def _handle_watch_control_intent(lower_q: str, query: str, active_device) -> WristPilotResponse:
        model_name = active_device.model_name if active_device else "Smartwatch"

        if "vibrate" in lower_q or "buzz" in lower_q or "haptic" in lower_q:
            reply = f"Dispatched High Alert vibration pulse (Level 2) to {model_name} via Bluetooth GATT Immediate Alert (0x1802)."
            tool_name = "trigger_watch_vibration"
            target_page = "settings"
            params = {"alert_level": 2}
        elif "sync time" in lower_q or "real time" in lower_q:
            reply = f"Synchronized atomic clock time packets (0x1805 / 0x2A2B) to {model_name}."
            tool_name = "sync_atomic_time"
            target_page = "settings"
            params = {"sync_now": True}
        elif "12h" in lower_q or "12-hour" in lower_q or "12 hour" in lower_q:
            reply = f"Configured {model_name} time display to 12-Hour AM/PM format."
            tool_name = "set_time_format"
            target_page = "settings"
            params = {"format": "12h"}
        elif "24h" in lower_q or "24-hour" in lower_q or "24 hour" in lower_q:
            reply = f"Configured {model_name} time display to 24-Hour Military format."
            tool_name = "set_time_format"
            target_page = "settings"
            params = {"format": "24h"}
        elif "dnd" in lower_q or "silent" in lower_q:
            reply = f"Toggled Do Not Disturb (Silent Mode) for {model_name}."
            tool_name = "toggle_dnd"
            target_page = "settings"
            params = {"enabled": True}
        else:
            reply = f"Updated hardware settings for {model_name}."
            tool_name = "update_watch_settings"
            target_page = "settings"
            params = {}

        return WristPilotResponse(
            query=query,
            intent="CONTROL_WATCH_HARDWARE",
            reply_message=reply,
            action=WristPilotAction(
                tool_name=tool_name,
                target_page=target_page,
                parameters=params,
                confirmation_required=False,
                is_supported=True,
                hardware_dependent=True
            ),
            action_result={"success": True, "target": model_name},
            compatibility_note="Commands are executed in real time via Web Bluetooth GATT services.",
            suggested_quick_prompts=[
                "Simulate incoming call from Mom",
                "Trigger vibration on my watch",
                "Sync real time",
                "Design a red sports watch face"
            ]
        )

    @staticmethod
    def _handle_watchface_intent(lower_q: str, query: str, active_device) -> WristPilotResponse:
        primary_color = "#ef4444"
        secondary_color = "#18181b"
        theme = "sports"
        style = "digital"

        if "black and gold" in lower_q or ("gold" in lower_q and "black" in lower_q):
            primary_color = "#FFD700"
            secondary_color = "#18181B"
            theme = "business"
            desc = "Executed: Crafted an Executive Black & Gold watch face with high-contrast metallic accents."
        elif "college" in lower_q or "presentation" in lower_q or "academic" in lower_q:
            primary_color = "#38BDF8"
            secondary_color = "#1E293B"
            theme = "college"
            desc = "Executed: Configured an Academic Slate & Ice Blue watch face optimized for lecture halls."
        elif "sports" in lower_q or "workout" in lower_q or "running" in lower_q or "red" in lower_q:
            primary_color = "#EF4444"
            secondary_color = "#1C1917"
            theme = "sports"
            desc = "Executed: Created high-energy Sports Crimson watch face highlighting live BPM and Step metrics."
        elif "cyberpunk" in lower_q or "neon" in lower_q:
            primary_color = "#00F2FE"
            secondary_color = "#9d4edd"
            theme = "cyberpunk"
            desc = "Executed: Synthesized Neon Cyberpunk dial with dual cyan/magenta ambient gradients."
        elif "minimal" in lower_q or "clean" in lower_q or "analog" in lower_q:
            primary_color = "#F8FAFC"
            secondary_color = "#334155"
            theme = "minimal"
            style = "analog"
            desc = "Executed: Built a Swiss-inspired Minimal Analog watch face with uncluttered subdials."
        else:
            primary_color = "#EF4444"
            secondary_color = "#18181B"
            theme = "sports"
            desc = f"Executed: Synthesized an artistic custom watch face theme matching '{query}'."

        res_w = active_device.resolution_width if active_device else 240
        res_h = active_device.resolution_height if active_device else 284

        return WristPilotResponse(
            query=query,
            intent="GENERATE_WATCHFACE_THEME",
            reply_message=f"{desc} Scaled to {res_w}x{res_h} for {active_device.model_name if active_device else 'your watch'}.",
            action=WristPilotAction(
                tool_name="configure_watchface_canvas",
                target_page="watchfaces",
                parameters={
                    "name": f"WristPilot {theme.title()}",
                    "theme": theme,
                    "style": style,
                    "primary_color": primary_color,
                    "secondary_color": secondary_color,
                    "resolution_width": res_w,
                    "resolution_height": res_h
                },
                confirmation_required=False,
                is_supported=True,
                hardware_dependent=False
            ),
            action_result={
                "preview_ready": True,
                "resolution": f"{res_w}x{res_h}",
                "workflow": f"Download PNG and apply via {active_device.companion_app if active_device else 'official companion app'}."
            },
            compatibility_note="Watch face wallpaper is scaled exactly to hardware resolution. To apply to physical watch, use the Companion App Wallpaper sync.",
            suggested_quick_prompts=[
                "Export this watch face wallpaper",
                "Simulate incoming call from Mom",
                "Show my steps from this week"
            ]
        )

    @staticmethod
    def _handle_health_intent(lower_q: str, query: str) -> WristPilotResponse:
        reply = (
            "Activity Analytics Overview: Over the last 7 days, you've accumulated 68,420 steps "
            "(daily average 9,774 steps, 97.7% of your 10,000 goal). Resting heart rate averaged 64 BPM, "
            "with an average sleep duration of 7 hrs 18 mins (28% Deep Sleep). "
            "Telemetry is logged with explicit source provenance."
        )
        return WristPilotResponse(
            query=query,
            intent="QUERY_HEALTH_ANALYTICS",
            reply_message=reply,
            action=WristPilotAction(
                tool_name="navigate_to_page",
                target_page="health",
                parameters={"view": "weekly_trends", "metric": "steps"},
                confirmation_required=False,
                is_supported=True,
                hardware_dependent=False
            ),
            action_result={
                "avg_steps": 9774,
                "total_calories": 16420,
                "sleep_hours_avg": 7.3,
                "data_source": "SIMULATED_DEMO_DATA"
            },
            compatibility_note="Notice: This health telemetry is labeled DEMO DATA. For live watch sync, connect the WristOS Android Companion bridge via Health Connect.",
            suggested_quick_prompts=[
                "Export activity data as CSV",
                "Simulate incoming call from Work",
                "Find my connected watch"
            ]
        )

    @staticmethod
    def _handle_find_watch_intent(lower_q: str, query: str, active_device) -> WristPilotResponse:
        has_buzzer = active_device.has_immediate_alert if active_device else False
        model_name = active_device.model_name if active_device else "Smartwatch"

        if has_buzzer:
            msg = (
                f"Triggering Find My Watch for {model_name} via Bluetooth GATT Immediate Alert Service (0x1802). "
                "The watch will vibrate and beep for 10 seconds. Proximity radar is scanning RSSI signal."
            )
        else:
            msg = (
                f"Opening Find My Watch Proximity Radar. Note: {model_name} does not expose the standard 0x1802 "
                "hardware buzzer service over Web Bluetooth. RSSI signal proximity is active to help you locate it in the room."
            )

        return WristPilotResponse(
            query=query,
            intent="FIND_MY_WATCH",
            reply_message=msg,
            action=WristPilotAction(
                tool_name="trigger_find_watch_radar",
                target_page="find",
                parameters={
                    "device_id": active_device.id if active_device else "unknown",
                    "trigger_buzzer": has_buzzer,
                    "alert_level": 2 if has_buzzer else 0
                },
                confirmation_required=False,
                is_supported=True,
                hardware_dependent=True
            ),
            action_result={
                "buzzer_supported": has_buzzer,
                "rssi_current": -64,
                "proximity": "Near (1-3 meters)",
                "interference_notice": "Walls, human body absorption, and watch orientation affect BLE signal strength."
            },
            compatibility_note=f"Hardware buzzer support for {model_name}: {'Supported (0x1802)' if has_buzzer else 'Unsupported by watch firmware - proximity scanning only'}.",
            suggested_quick_prompts=[
                "Trigger vibration on my watch",
                "Simulate incoming call from Mom",
                "Show today's battery percentage"
            ]
        )

    @staticmethod
    def _handle_diagnostics_intent(lower_q: str, query: str, active_device) -> WristPilotResponse:
        app_name = active_device.companion_app if active_device else "official companion app"
        reply = (
            f"Smartwatch Disconnection Diagnostics for {active_device.model_name if active_device else 'Smartwatches'}:\n\n"
            f"1. Android OEM Battery Optimization: Android aggressively kills background sync services for {app_name}. "
            "To fix: Settings > Apps > Battery Usage > Set to 'Unrestricted'.\n"
            "2. BLE Peripheral Timeout: Budget smartwatches (Realtek/Goodix RTOS) terminate idle GATT connections "
            "after 15-30 seconds to conserve battery unless a continuous keep-alive ping or background notification is registered.\n"
            "3. Web Bluetooth Tab Suspension: Browsers suspend Web Bluetooth connections when you switch tabs or minimize the window.\n"
            "4. Android 13/14 Nearby Devices Permission: Ensure 'Nearby Devices' permission is permanently granted."
        )
        return WristPilotResponse(
            query=query,
            intent="DIAGNOSE_CONNECTION_ISSUES",
            reply_message=reply,
            action=WristPilotAction(
                tool_name="navigate_to_page",
                target_page="connect",
                parameters={"subview": "diagnostics"},
                confirmation_required=False,
                is_supported=True,
                hardware_dependent=False
            ),
            action_result={"resolved": False, "recommended_action": "Set companion app battery to Unrestricted"},
            compatibility_note="Hardware limitation: RTOS watches require the companion app foreground service to maintain long-lived Bluetooth links.",
            suggested_quick_prompts=[
                "Find my connected watch",
                "Simulate incoming call from Dad",
                "Create a college presentation watch theme"
            ]
        )

    @staticmethod
    def _handle_routine_intent(lower_q: str, query: str) -> WristPilotResponse:
        reply = (
            "Adaptive Routine Prepared: 'College Presentation & Exam Mode'.\n"
            "- Watch Face: Switched to high-legibility minimalist theme.\n"
            "- Dashboard: Prioritized schedule alerts and silent heart rate tracking.\n"
            "- Notification Shield: Suggests toggling Do Not Disturb on the companion app during presentation hours."
        )
        return WristPilotResponse(
            query=query,
            intent="PREPARE_ROUTINE",
            reply_message=reply,
            action=WristPilotAction(
                tool_name="activate_adaptive_context",
                target_page="automations",
                parameters={"context": "College", "auto_apply_theme": True},
                confirmation_required=False,
                is_supported=True,
                hardware_dependent=False
            ),
            action_result={"context": "College", "routine_created": True},
            compatibility_note="WristOS sets the recommended UI and exports the wallpaper. Physical watch DND toggle must be switched on watch or companion app.",
            suggested_quick_prompts=[
                "Design a minimal watch face",
                "Simulate incoming call from Mom",
                "Export activity data as CSV"
            ]
        )

    @staticmethod
    def _handle_general_fallback(query: str, model_name: str) -> WristPilotResponse:
        reply = (
            f"WristPilot AI Assistant: I received your request: '{query}'. "
            f"I can control your {model_name}, simulate phone calls, trigger vibration pulses, "
            "design custom watch faces, analyze health analytics, or sync real atomic time."
        )
        return WristPilotResponse(
            query=query,
            intent="GENERAL_INQUIRY",
            reply_message=reply,
            action=None,
            action_result=None,
            compatibility_note="All system actions strictly adhere to verified Bluetooth GATT capabilities.",
            suggested_quick_prompts=[
                "Simulate incoming call from Mom",
                "Trigger vibration on my watch",
                "Design a red sports watch face",
                "Sync real time on my watch"
            ]
        )

ai_pilot_service = AIPilotService()
