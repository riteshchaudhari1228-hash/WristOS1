from typing import List, Optional
from app.schemas.device_schemas import DeviceModelInfo, DeviceCompatibilityReport

# Master Verified Database for Indian Smartwatch Brands: Noise, boAt, Fire-Boltt
SMARTWATCH_REGISTRY: list[DeviceModelInfo] = [
    # --- NOISE DEVICES ---
    DeviceModelInfo(
        id="noise-colorfit-pro-4",
        brand="Noise",
        model_name="ColorFit Pro 4",
        shape="square",
        resolution_width=356,
        resolution_height=400,
        screen_type="TFT LCD (60Hz)",
        screen_size="1.72-inch",
        companion_app="NoiseFit: Health & Fitness",
        companion_package="com.mediatek.wwtv.wearable.noise",
        chipset="Realtek RTL8762D (RTOS)",
        ble_name_prefix="ColorFit_Pro4",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery Service
            "0000180d-0000-1000-8000-00805f9b34fb", # Heart Rate Service
            "0000180a-0000-1000-8000-00805f9b34fb", # Device Info
            "0000fee7-0000-1000-8000-00805f9b34fb"  # Tencent/WeChat Sports custom profile
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=False,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="PARTIAL_HYBRID",
        limitations_notes="Direct OTA firmware watchface flashing is locked behind NoiseFit proprietary encryption. Custom watch faces must be exported as 356x400 PNG and uploaded via NoiseFit Cloud Studio.",
        app_guide_steps=[
            "1. In WristOS Watch Face Studio, export your customized wallpaper at 356x400.",
            "2. Open the official NoiseFit app on your Android/iOS smartphone.",
            "3. Navigate to 'Watch Faces' > 'Custom Face' / 'DIY Face'.",
            "4. Choose 'Upload from Gallery' and select the WristOS exported image.",
            "5. Align time complication position and tap 'Sync to Device'."
        ]
    ),
    DeviceModelInfo(
        id="noise-colorfit-pro-5",
        brand="Noise",
        model_name="ColorFit Pro 5",
        shape="square",
        resolution_width=390,
        resolution_height=450,
        screen_type="AMOLED",
        screen_size="1.85-inch",
        companion_app="NoiseFit: Health & Fitness",
        companion_package="com.mediatek.wwtv.wearable.noise",
        chipset="Goodix GR5515 + JL DSP",
        ble_name_prefix="ColorFit_Pro5",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery
            "0000180d-0000-1000-8000-00805f9b34fb", # Heart Rate
            "00001802-0000-1000-8000-00805f9b34fb", # Immediate Alert
            "0000180a-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=True,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="VERIFIED_GATT",
        limitations_notes="Supports standard GATT Heart Rate notifications and Immediate Alert buzzer commands over Web Bluetooth / Android BLE. Direct file-system watch face flashing restricted.",
        app_guide_steps=[
            "1. Export wallpaper image at 390x450 from WristOS.",
            "2. Open NoiseFit app > Device Settings > Watch Faces.",
            "3. Select 'Custom Wallpaper' and choose the exported graphic.",
            "4. Match typography color to your WristOS design and press 'Install'."
        ]
    ),
    DeviceModelInfo(
        id="noise-halo-plus",
        brand="Noise",
        model_name="Noise Halo Plus",
        shape="round",
        resolution_width=466,
        resolution_height=466,
        screen_type="AMOLED Round",
        screen_size="1.46-inch",
        companion_app="NoiseFit: Health & Fitness",
        companion_package="com.mediatek.wwtv.wearable.noise",
        chipset="Realtek RTL8763E Single-chip Dual-mode BLE 5.3",
        ble_name_prefix="Noise_HaloPlus",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery
            "0000180d-0000-1000-8000-00805f9b34fb", # Heart Rate
            "0000180a-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=False,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="PARTIAL_HYBRID",
        limitations_notes="Circular display requires centered radial watch face compositions. Export canvas as 466x466 circular bounding box.",
        app_guide_steps=[
            "1. In WristOS, select Circular Bezel and export at 466x466.",
            "2. Open NoiseFit > My Watch > Watch Faces > Photo Face.",
            "3. Crop circle accurately in NoiseFit preview and sync."
        ]
    ),
    # --- BOAT DEVICES ---
    DeviceModelInfo(
        id="boat-wave-call-2",
        brand="boAt",
        model_name="Wave Call 2",
        shape="square",
        resolution_width=240,
        resolution_height=284,
        screen_type="HD TFT",
        screen_size="1.83-inch",
        companion_app="boAt Crest App",
        companion_package="com.coveiot.boat.crest",
        chipset="Realtek RTL8762D (KaHa / CoveIoT RTOS Platform)",
        ble_name_prefix="WaveCall2_",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery
            "0000180a-0000-1000-8000-00805f9b34fb", # Device Info
            "0000fee7-0000-1000-8000-00805f9b34fb"  # CoveIoT custom step stream
        ],
        has_standard_heart_rate=False, # boAt Crest uses Cove proprietary characteristic for HR
        has_standard_battery=True,
        has_immediate_alert=False,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="PARTIAL_HYBRID",
        limitations_notes="boAt Wave Call 2 relies on KaHa/CoveIoT proprietary framing for historical telemetry and watch face flashing. Battery percentage readable over standard GATT. Live steps sync via Android Companion Health Connect bridge.",
        app_guide_steps=[
            "1. Use WristOS to generate a 240x284 wallpaper design.",
            "2. Open the boAt Crest App > More > Watch Faces.",
            "3. Tap on the Cloud / Custom Face icon > 'Create Custom Face'.",
            "4. Choose your image from gallery and apply with 1-click."
        ]
    ),
    DeviceModelInfo(
        id="boat-storm-call-3",
        brand="boAt",
        model_name="Storm Call 3",
        shape="square",
        resolution_width=240,
        resolution_height=280,
        screen_type="HD Display",
        screen_size="1.83-inch",
        companion_app="boAt Crest App",
        companion_package="com.coveiot.boat.crest",
        chipset="Huntersun HS6621AG",
        ble_name_prefix="StormCall3",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery
            "0000180a-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=False,
        has_standard_battery=True,
        has_immediate_alert=False,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="PARTIAL_HYBRID",
        limitations_notes="Standard battery level service exposed. Activity data requires boAt Crest to Android Health Connect sync.",
        app_guide_steps=[
            "1. Export wallpaper from WristOS at 240x280 resolution.",
            "2. Launch boAt Crest App > Watch Settings > Watch Face Studio.",
            "3. Select Custom Photo and apply the exported file."
        ]
    ),
    DeviceModelInfo(
        id="boat-xtend-plus",
        brand="boAt",
        model_name="Xtend Plus",
        shape="square",
        resolution_width=368,
        resolution_height=448,
        screen_type="AMOLED",
        screen_size="1.78-inch",
        companion_app="boAt Wave App",
        companion_package="com.boat.wave",
        chipset="Goodix GR5515",
        ble_name_prefix="XtendPlus_",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery
            "0000180d-0000-1000-8000-00805f9b34fb", # Heart Rate
            "00001802-0000-1000-8000-00805f9b34fb", # Immediate Alert
            "0000180a-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=True,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="VERIFIED_GATT",
        limitations_notes="Excellent standard GATT compliance for Battery, Heart Rate stream, and Immediate Alert buzzer. Watch face wallpaper is 368x448 high density.",
        app_guide_steps=[
            "1. Create or generate AMOLED watch face in WristOS at 368x448.",
            "2. Open boAt Wave App > Device > Dial Market > DIY Watch Face.",
            "3. Select WristOS wallpaper, select digital clock style, and flash."
        ]
    ),
    DeviceModelInfo(
        id="boat-lunar-orb",
        brand="boAt",
        model_name="Lunar Orb",
        shape="round",
        resolution_width=466,
        resolution_height=466,
        screen_type="Round AMOLED",
        screen_size="1.45-inch",
        companion_app="boAt Crest App",
        companion_package="com.coveiot.boat.crest",
        chipset="Realtek RTL8763E",
        ble_name_prefix="LunarOrb_",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb",
            "0000180d-0000-1000-8000-00805f9b34fb",
            "0000180a-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=False,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="PARTIAL_HYBRID",
        limitations_notes="Round AMOLED display. Standard Heart Rate & Battery GATT verified.",
        app_guide_steps=[
            "1. Select Round 466x466 layout in WristOS Studio and export.",
            "2. Launch boAt Crest > Device Settings > Watch Faces.",
            "3. Tap 'Custom Circular Face' and load the exported graphic."
        ]
    ),
    # --- FIRE-BOLTT DEVICES ---
    DeviceModelInfo(
        id="fireboltt-ninja-calling-pro-plus",
        brand="Fire-Boltt",
        model_name="Ninja Calling Pro Plus",
        shape="square",
        resolution_width=240,
        resolution_height=284,
        screen_type="HD Display",
        screen_size="1.83-inch",
        companion_app="Da Fit",
        companion_package="com.crrepa.band.dafit",
        chipset="Goodix GR5515 (MOYING / CRREPA platform)",
        ble_name_prefix="FB_NinjaPro",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery
            "0000180d-0000-1000-8000-00805f9b34fb", # Heart Rate
            "00001802-0000-1000-8000-00805f9b34fb", # Immediate Alert
            "0000fee7-0000-1000-8000-00805f9b34fb"  # CRREPA custom OTA & sports
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=True,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="VERIFIED_GATT",
        limitations_notes="Uses the popular CRREPA Da Fit firmware stack. Standard BLE GATT Battery, HR, and Immediate Alert (Find Watch Buzz) are verified and function directly over Web Bluetooth and Android BLE! OTA watch face file format is CRREPA .bin; wallpaper custom image is synced via Da Fit.",
        app_guide_steps=[
            "1. Design your wallpaper and export 240x284 image from WristOS.",
            "2. Open the Da Fit app on your smartphone.",
            "3. Go to Middle Tab (Watch icon) > Watch Faces > Edit (Face 4 / Custom).",
            "4. Tap 'Select Picture' and choose the exported WristOS file.",
            "5. Customize time position and click Save."
        ]
    ),
    DeviceModelInfo(
        id="fireboltt-phoenix-ultra",
        brand="Fire-Boltt",
        model_name="Phoenix Ultra",
        shape="round",
        resolution_width=360,
        resolution_height=360,
        screen_type="Round TFT / IPS",
        screen_size="1.39-inch",
        companion_app="Da Fit",
        companion_package="com.crrepa.band.dafit",
        chipset="Realtek RTL8762D (CRREPA RTOS)",
        ble_name_prefix="FB_Phoenix",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb", # Battery
            "0000180d-0000-1000-8000-00805f9b34fb", # Heart Rate
            "00001802-0000-1000-8000-00805f9b34fb", # Immediate Alert
            "0000180a-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=True,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="VERIFIED_GATT",
        limitations_notes="Round 360x360 dial. CRREPA Bluetooth stack responds to standard Immediate Alert 0x1802 trigger for the Find My Watch buzzer.",
        app_guide_steps=[
            "1. Export round 360x360 wallpaper from WristOS Studio.",
            "2. Launch Da Fit > Device Settings > Watch Faces.",
            "3. Tap Custom Dial > Select Picture > Apply."
        ]
    ),
    DeviceModelInfo(
        id="fireboltt-ring-3",
        brand="Fire-Boltt",
        model_name="Ring 3",
        shape="square",
        resolution_width=240,
        resolution_height=286,
        screen_type="HD Display",
        screen_size="1.80-inch",
        companion_app="Da Fit",
        companion_package="com.crrepa.band.dafit",
        chipset="Realtek RTL8762D",
        ble_name_prefix="FB_Ring3",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb",
            "0000180d-0000-1000-8000-00805f9b34fb",
            "00001802-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=True,
        has_standard_battery=True,
        has_immediate_alert=True,
        custom_wallpaper_export=True,
        direct_ota_watchface=False,
        verification_level="VERIFIED_GATT",
        limitations_notes="Standard GATT compliance across all basic sensors. Full step history requires Da Fit sync.",
        app_guide_steps=[
            "1. Export customized wallpaper at 240x286 from WristOS.",
            "2. In Da Fit app, navigate to Watch Faces > Edit Custom Face.",
            "3. Select exported image and sync."
        ]
    ),
    DeviceModelInfo(
        id="fireboltt-dream-android-wristphone",
        brand="Fire-Boltt",
        model_name="Dream 4G Android Wristphone",
        shape="square",
        resolution_width=320,
        resolution_height=386,
        screen_type="IPS Screen",
        screen_size="2.02-inch",
        companion_app="Standalone Android 8.1 OS / Google Play Store",
        companion_package="android.standalone",
        chipset="Spreadtrum SL8541E Quad-core 1.4GHz",
        ble_name_prefix="FB_Dream",
        supported_services=[
            "0000180f-0000-1000-8000-00805f9b34fb",
            "0000180a-0000-1000-8000-00805f9b34fb"
        ],
        has_standard_heart_rate=False,
        has_standard_battery=True,
        has_immediate_alert=False,
        custom_wallpaper_export=True,
        direct_ota_watchface=True,
        verification_level="PARTIAL_HYBRID",
        limitations_notes="This is a full Android wristphone rather than a typical RTOS micro-controller. Custom APKs or launcher wallpapers can be set directly via standard Android ADB or gallery.",
        app_guide_steps=[
            "1. Export wallpaper from WristOS at 320x386.",
            "2. Transfer directly via Bluetooth, WiFi, or USB file transfer.",
            "3. In Dream settings: Display > Wallpaper > Gallery > Set as Home & Lock Screen."
        ]
    )
]

class CompatibilityService:
    @staticmethod
    def get_all_devices(brand: Optional[str] = None) -> List[DeviceModelInfo]:
        if brand:
            return [d for d in SMARTWATCH_REGISTRY if d.brand.lower() == brand.lower()]
        return SMARTWATCH_REGISTRY

    @staticmethod
    def get_device_by_id(device_id: str) -> Optional[DeviceModelInfo]:
        for d in SMARTWATCH_REGISTRY:
            if d.id == device_id:
                return d
        return None

    @staticmethod
    def evaluate_compatibility(device_id: str) -> DeviceCompatibilityReport:
        device = CompatibilityService.get_device_by_id(device_id)
        if not device:
            # Fallback unsupported report
            return DeviceCompatibilityReport(
                device_id=device_id,
                brand="Unknown",
                model_name="Unregistered Smartwatch",
                verification_level="UNSUPPORTED_PROPRIETARY",
                is_fully_supported=False,
                supported_features=["Generic Web Bluetooth Scanning", "Generic Demo Mode"],
                unsupported_features=[
                    "Live Heart Rate (GATT unverified)",
                    "Battery Read (GATT unverified)",
                    "Direct Watch Face Flashing (Proprietary protocol)",
                    "Immediate Alert Buzzer"
                ],
                companion_app="Manufacturer Official App",
                chipset_notes="Unknown microcontroller architecture.",
                wallpaper_resolution="Standard 240x280 (Estimated)",
                wallpaper_workflow="Export PNG and upload through official brand app.",
                ble_gatt_status="No verified GATT services recorded in registry.",
                guide_steps=[
                    "1. Check if device is paired to official brand app.",
                    "2. Verify whether Web Bluetooth browser exposes peripheral GATT services.",
                    "3. Use WristOS Export function to generate custom wallpaper for official app."
                ]
            )

        supported: list[str] = [
            f"Custom Canvas Wallpaper Export ({device.resolution_width}x{device.resolution_height})",
            "Device Discovery & BLE Advertisement Inspection"
        ]
        unsupported: list[str] = []

        if device.has_standard_battery:
            supported.append("Real-time Battery Level (GATT 0x180F)")
        else:
            unsupported.append("Real-time Battery Level (Requires proprietary app)")

        if device.has_standard_heart_rate:
            supported.append("Live Heart Rate Streaming (GATT 0x180D)")
        else:
            unsupported.append("Live Heart Rate Streaming (Requires proprietary companion app protocol)")

        if device.has_immediate_alert:
            supported.append("Find My Watch Hardware Buzzer (GATT 0x1802 Immediate Alert)")
        else:
            unsupported.append("Hardware Buzzer via Web BLE (Watch model does not expose 0x1802 service)")

        if device.direct_ota_watchface:
            supported.append("Direct File/OTA Watch Face Transfer")
        else:
            unsupported.append("Direct Watch Face OTA Firmware Flash (Locked by vendor signature - use Official App Wallpaper Workflow)")

        ble_status_msg = (
            "GATT Services Verified. Web Bluetooth & Android BLE compatible."
            if device.verification_level == "VERIFIED_GATT"
            else "Hybrid Integration: Basic GATT exposed; activity sync handled via Android Companion Bridge."
        )

        return DeviceCompatibilityReport(
            device_id=device.id,
            brand=device.brand,
            model_name=device.model_name,
            verification_level=device.verification_level,
            is_fully_supported=(device.verification_level == "VERIFIED_GATT"),
            supported_features=supported,
            unsupported_features=unsupported,
            companion_app=device.companion_app,
            chipset_notes=device.chipset,
            wallpaper_resolution=f"{device.resolution_width}x{device.resolution_height} ({device.shape.title()})",
            wallpaper_workflow=f"Export {device.resolution_width}x{device.resolution_height} image from WristOS -> Apply via {device.companion_app}",
            ble_gatt_status=ble_status_msg,
            guide_steps=device.app_guide_steps
        )

compatibility_service = CompatibilityService()
