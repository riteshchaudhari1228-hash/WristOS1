import unittest
from app.routers import devices, watchfaces, health, ai
from app.schemas.ai_schemas import WristPilotRequest

class TestAPIRoutersDirect(unittest.TestCase):
    def test_devices_router(self):
        devs = devices.list_devices(brand=None)
        self.assertGreater(len(devs), 0)
        self.assertTrue(any(d.brand == "boAt" for d in devs))

    def test_device_compatibility_router(self):
        report = devices.get_compatibility_report("noise-colorfit-pro-4")
        self.assertEqual(report.brand, "Noise")
        self.assertEqual(report.wallpaper_resolution, "356x400 (Square)")

    def test_watchfaces_router(self):
        wfs = watchfaces.get_watchfaces()
        self.assertGreaterEqual(len(wfs), 5)

    def test_ai_command_router(self):
        req = WristPilotRequest(message="Show my steps from this week")
        res = ai.execute_wristpilot_command(req)
        self.assertEqual(res.intent, "QUERY_HEALTH_ANALYTICS")

    def test_health_today_router(self):
        today = health.get_today_health()
        self.assertEqual(today.data_source_badge, "DEMO_SIMULATED")
        self.assertGreater(today.steps, 0)

if __name__ == "__main__":
    unittest.main()
