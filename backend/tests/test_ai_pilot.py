import unittest
from app.schemas.ai_schemas import WristPilotRequest
from app.services.ai_pilot_service import ai_pilot_service

class TestAIPilot(unittest.TestCase):
    def test_ai_watchface_intent(self):
        req = WristPilotRequest(
            message="Design a black and gold watch face",
            active_device_id="boat-wave-call-2"
        )
        res = ai_pilot_service.process_command(req)
        self.assertEqual(res.intent, "GENERATE_WATCHFACE_THEME")
        self.assertIsNotNone(res.action)
        self.assertEqual(res.action.tool_name, "configure_watchface_canvas")
        self.assertEqual(res.action.parameters["primary_color"], "#FFD700")
        self.assertEqual(res.action.parameters["theme"], "business")

    def test_ai_health_intent(self):
        req = WristPilotRequest(
            message="Show my steps from this week",
            active_device_id="noise-colorfit-pro-4"
        )
        res = ai_pilot_service.process_command(req)
        self.assertEqual(res.intent, "QUERY_HEALTH_ANALYTICS")
        self.assertIn("DEMO DATA", res.compatibility_note)
        self.assertEqual(res.action.target_page, "health")

    def test_ai_find_watch_intent(self):
        req = WristPilotRequest(
            message="Find my connected watch",
            active_device_id="fireboltt-ninja-calling-pro-plus"
        )
        res = ai_pilot_service.process_command(req)
        self.assertEqual(res.intent, "FIND_MY_WATCH")
        self.assertTrue(res.action.parameters["trigger_buzzer"])

    def test_ai_diagnostics_intent(self):
        req = WristPilotRequest(
            message="Why does my watch keep disconnecting?",
            active_device_id="boat-wave-call-2"
        )
        res = ai_pilot_service.process_command(req)
        self.assertEqual(res.intent, "DIAGNOSE_CONNECTION_ISSUES")
        self.assertIn("OEM Battery Optimization", res.reply_message)

    def test_ai_call_intent(self):
        req = WristPilotRequest(
            message="Simulate incoming call from Mom",
            active_device_id="boat-wave-call-2"
        )
        res = ai_pilot_service.process_command(req)
        self.assertEqual(res.intent, "RELAY_PHONE_CALL")
        self.assertEqual(res.action.tool_name, "trigger_incoming_call")
        self.assertEqual(res.action.parameters["caller_name"], "Mom")
        self.assertEqual(res.action.target_page, "calls")

if __name__ == "__main__":
    unittest.main()
