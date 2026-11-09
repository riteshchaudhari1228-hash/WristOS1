import unittest
from app.services.health_service import health_service, MEDICAL_DISCLAIMER

class TestHealth(unittest.TestCase):
    def test_today_metrics(self):
        metrics = health_service.get_today_metrics()
        self.assertGreater(metrics.steps, 0)
        self.assertGreater(metrics.battery_level, 0)
        self.assertEqual(metrics.data_source_badge, "DEMO_SIMULATED")
        self.assertEqual(metrics.medical_disclaimer, MEDICAL_DISCLAIMER)

    def test_analytics_seven_days(self):
        overview = health_service.get_analytics(period="7_DAYS")
        self.assertEqual(overview.period, "7_DAYS")
        self.assertEqual(len(overview.daily_history), 7)
        self.assertGreater(overview.total_steps, 0)
        self.assertGreater(overview.avg_daily_steps, 0)

    def test_csv_export(self):
        csv_str = health_service.generate_csv_export(period="7_DAYS")
        self.assertIn("WRISTOS HEALTH EXPORT", csv_str)
        self.assertIn("Date,Steps,Step Goal", csv_str)
        self.assertIn("DEMO_SIMULATED", csv_str)

if __name__ == "__main__":
    unittest.main()
