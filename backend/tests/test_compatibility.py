import unittest
from app.services.compatibility_service import compatibility_service

class TestCompatibility(unittest.TestCase):
    def test_device_registry_brands(self):
        all_devices = compatibility_service.get_all_devices()
        self.assertGreaterEqual(len(all_devices), 10)

        noise_devices = compatibility_service.get_all_devices(brand="Noise")
        boat_devices = compatibility_service.get_all_devices(brand="boAt")
        fireboltt_devices = compatibility_service.get_all_devices(brand="Fire-Boltt")

        self.assertGreaterEqual(len(noise_devices), 3)
        self.assertGreaterEqual(len(boat_devices), 3)
        self.assertGreaterEqual(len(fireboltt_devices), 3)

    def test_verified_gatt_model(self):
        # Fire-Boltt Ninja Calling Pro Plus exposes standard GATT 0x1802 buzzer and 0x180D HR
        report = compatibility_service.evaluate_compatibility("fireboltt-ninja-calling-pro-plus")
        self.assertEqual(report.device_id, "fireboltt-ninja-calling-pro-plus")
        self.assertTrue(report.is_fully_supported)
        self.assertEqual(report.verification_level, "VERIFIED_GATT")
        self.assertTrue(any("Immediate Alert" in f for f in report.supported_features))
        self.assertTrue(any("Da Fit" in s for s in report.guide_steps))

    def test_boat_wave_call_cove_limitations(self):
        # boAt Wave Call 2 uses CoveIoT proprietary stream for HR
        report = compatibility_service.evaluate_compatibility("boat-wave-call-2")
        self.assertEqual(report.verification_level, "PARTIAL_HYBRID")
        self.assertFalse(report.is_fully_supported)
        self.assertTrue(any("proprietary" in u.lower() for u in report.unsupported_features))
        self.assertEqual(report.companion_app, "boAt Crest App")

    def test_unregistered_model_unsupported_mode(self):
        report = compatibility_service.evaluate_compatibility("fake-smartwatch-999")
        self.assertEqual(report.verification_level, "UNSUPPORTED_PROPRIETARY")
        self.assertFalse(report.is_fully_supported)
        self.assertIn("No verified GATT services", report.ble_gatt_status)

if __name__ == "__main__":
    unittest.main()
