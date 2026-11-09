# WRISTOS — SYSTEM ARCHITECTURE & DATA FLOW SPECIFICATION

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WRISTOS SYSTEM TOPOLOGY                         │
└────────────────────────────────────────────────────────────────────────┘

  [ Smartwatch Hardware ]
    - Noise ColorFit
    - boAt Wave / Storm
    - Fire-Boltt Ninja / Phoenix
         │
         ├─── (A) Standard BLE GATT (0x180F, 0x180D, 0x1802) ───────────┐
         │                                                               │
         └─── (B) Vendor Companion Protocol (NoiseFit, boAt Crest, DaFit)│
                     │                                                   │
                     ▼                                                   │
              [ Android Smartphone ]                                     │
                 - Official Vendor App (writes daily records)            │
                 - Android Health Connect Datastore (Android 14+)        │
                     │                                                   │
                     ▼ (Permission-granted queries)                      │
              [ WristOS Android Companion App ]                          │
                 - Jetpack Compose UI                                    │
                 - BluetoothLeScanner + GATT Client                      │
                 - HealthConnectManager                                  │
                 - WristOsBridgeClient                                   │
                     │                                                   │
                     ▼ (Encrypted HTTP REST Bridge)                      │
                     │                                                   │
         ┌───────────┴───────────────────────────────────────────────────┤
         ▼                                                               ▼
  [ Python FastAPI Backend ]                                   [ Web Bluetooth Client ]
    - Device Registry & Compatibility Engine                     - Chrome / Edge Web BLE
    - Watch Face Canvas & AI Synthesis Engine                    - Direct GATT Notifications
    - Health Aggregation & CSV Generation                        - Canvas Watch Face Studio
    - WristPilot Action Registry Engine                                  │
    - SQLite Relational Storage (wristos.db)                             │
         │                                                               │
         └───────────────────────┬───────────────────────────────────────┘
                                 ▼
                     [ React 19 Frontend Webapp ]
                       - Dark Graphite / Cyan UI
                       - Virtual Watch Mirror (Analog & Digital)
                       - Find My Watch Proximity Radar (RSSI)
                       - Health Analytics (Recharts 7d/30d)
                       - WristPilot Natural Language Assistant
                       - Adaptive Watch Studio (College / Work / Gym)
```

---

## Component Responsibilities

### 1. Web Frontend (`wristos/frontend`)
- **Technology:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts.
- **Port:** `http://localhost:5173`
- **Key Modules:**
  - `VirtualWatchPreview.tsx`: Renders real-time ticking watch bezels (square & circular) with live analog and digital complications.
  - `WatchFaceStudioPage.tsx`: Visual canvas editor with AI theme generator, image uploader, and resolution-matched PNG exporter.
  - `FindMyWatchPage.tsx`: Concentric radar visualizer running the Log-Distance Path Loss equation with Web Audio synthetic buzzer.
  - `HealthActivityPage.tsx`: Daily biometrics with stacked sleep architecture and step progression charts.
  - `AIPilotPage.tsx`: Natural language conversation with action registry dispatch.

### 2. Backend API (`wristos/backend`)
- **Technology:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite, Pytest.
- **Port:** `http://127.0.0.1:8000`
- **Key Services:**
  - `compatibility_service.py`: Registry of Indian smartwatches and verified GATT parameters.
  - `ai_pilot_service.py`: Deterministic intent parser with fallback rule-based reasoning engine.
  - `health_service.py`: Calculates rolling metrics and formats exportable CSV dumps.
  - `watch_face_service.py`: AI theme synthesizer and wallpaper asset builder.
  - `ble_service.py`: Hardware state manager and RF path loss calculator.

### 3. Android Companion App (`wristos/android`)
- **Technology:** Kotlin, Jetpack Compose, Android BLE APIs, Android Health Connect.
- **Key Classes:**
  - `BleManager.kt`: Controls scanning, connects GATT client, listens for 0x2A37 Heart Rate notifications, reads 0x2A19 Battery, and triggers 0x2A06 Immediate Alert.
  - `HealthConnectManager.kt`: Reads Steps, Calories, and Sleep records from Android 14+ Health Connect.
  - `WristOsBridgeClient.kt`: Pushes telemetry to `/api/companion/sync`.
