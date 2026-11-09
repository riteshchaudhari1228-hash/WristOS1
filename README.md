# WRISTOS — Professional Smartwatch Connectivity & Companion Platform
### Full-Stack Web Application + Android Companion + Python FastAPI Backend

Engineered for Indian smartwatches: **Noise**, **boAt**, and **Fire-Boltt**.

---

## 🌟 Executive Summary

**WristOS** is a comprehensive, production-grade smartwatch companion platform built for the fragmented budget wearable ecosystem. In India, brands like Noise, boAt, and Fire-Boltt white-label hardware from various ODMs (Realtek, Goodix, Huntersun, JL) running proprietary RTOS platforms without public developer APIs.

WristOS introduces an **honest, multi-channel architecture**:
1. **Direct Web Bluetooth GATT:** Connects via browser to verified standard Bluetooth SIG services (Battery `0x180F`, Live Heart Rate `0x180D`, Immediate Alert `0x1802`).
2. **Android Health Connect Bridge:** A native Kotlin / Jetpack Compose companion app synchronizing daily steps, calories, and sleep records from Android 14+ Health Connect to the web dashboard.
3. **Interactive Watch Face Studio:** In-browser HTML5 canvas designer that exports pixel-perfect PNG wallpapers scaled to exact hardware resolutions (e.g. 356x400, 240x284, 466x466) with manufacturer companion app upload workflows.
4. **Three Strict Operational Modes:**
   - **Demo Mode:** Zero-hardware presentation with live interactive virtual watch, realistic metrics, and persistent DEMO labels.
   - **Connected Mode:** Real GATT telemetry access with hardware verification.
   - **Unsupported Mode:** Transparent reports explaining proprietary protocol restrictions without fake connection states.

---

## 🎨 Visual Design System

WristOS strictly follows the requested modern wearable design language:
- **Backgrounds:** Deep black (`#09090b`), graphite (`#121216`), and obsidian glass surfaces.
- **Accents:** Crimson and vivid red (`#ef4444`, `#e11d48`, `#dc2626`) with subtle ambient light gradients.
- **Smartwatch Renders:** High-resolution interactive product visuals (`SmartwatchProductImage`) featuring metallic chassis, rotary digital crown buttons with crimson accents, chamfered bevels, and OLED displays.
- **Typography & Components:** Rounded cards (`rounded-3xl`), glass panels (`backdrop-blur-xl`), smooth transitions, responsive desktop and mobile drawers.

---

## 🧭 Platform Navigation

The website features the 7 core navigation sections:
1. **Home (`/home`):** Hero section with large interactive smartwatch visual, real "Connect Your Watch" button, compatible device gallery, watch-face customization preview, daily health cards, and proximity radar teaser.
2. **Smartwatches (`/smartwatches`):** Catalog showroom for Noise, boAt, and Fire-Boltt with filters (brand, round/square shape), specs, chipset details, verified GATT profiles, and direct connection triggers.
3. **Connect (`/connect`):** Direct Web Bluetooth connection engine with native browser scanner prompt, live GATT service & characteristic tree enumeration, battery percentage readouts, live HR notification streams, and honest error handling.
4. **Watch Faces (`/watchfaces`):** Full-featured Watch Face Studio with custom wallpaper upload, analog & digital styles, complication toggles (time, date, steps, HR, battery, seconds), and 1-click PNG image export.
5. **Health (`/health`):** Daily summaries, 7-day and 30-day interactive Recharts, activity duration, sleep architecture, distinct data-source badges, and 1-click CSV export.
6. **Find My Watch (`/find`):** Proximity radar with dynamic RSSI distance calculation using the Log-Distance Path Loss Model, human body RF shielding warnings, and GATT 0x1802 buzzer trigger with Web Audio feedback.
7. **Support (`/support`):** In-browser subsystem compatibility audit, step-by-step Bluetooth troubleshooting, protocol transparency FAQ, and an interactive model verification tool.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.11+** (Tested on Python 3.14.7)
- **Node.js 18+** & **npm**
- Modern Web Browser (Google Chrome or Microsoft Edge recommended for Web Bluetooth)
- *(Optional for Android)* Android Studio Hedgehog/Iguana with Android SDK 34

---

### 2. Backend Setup & Launch (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
py -m pip install -r requirements.txt

# Run the backend test suite (17 comprehensive tests)
py -m pytest -v

# Launch FastAPI development server (starts on http://127.0.0.1:8000)
py -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

*Tip: You can also double-click `start-backend.bat` in the root folder.*

Interactive API documentation will be accessible at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

### 3. Frontend Setup & Launch (React + Vite + Tailwind CSS)

```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm.cmd install

# Verify production build
npm.cmd run build

# Start the Vite local development server
npm.cmd run dev
```

*Tip: You can also double-click `start-frontend.bat` in the root folder.*

Open your browser at **`http://localhost:5173`**.

---

### 4. Android Companion App (Kotlin + Jetpack Compose)

1. Open Android Studio.
2. Select **Open an Existing Project** and navigate to `wristos/android`.
3. Allow Gradle to sync dependencies (`androidx.health.connect`, `material3`, `retrofit2`).
4. Run on an Android 14+ physical device or emulator (Pixel 8 API 34).
5. In the app's **Bridge** tab:
   - If using Android Emulator, set host to `10.0.2.2` (default bridge to PC `127.0.0.1`).
   - If using a physical phone on Wi-Fi, enter your PC's local IP (e.g., `192.168.1.X`).
   - Enter Pairing Code: `WRIST-7824` and tap **Push Sync to Webpage**.

---

## 📱 Supported Device Registry

| Brand | Model | Resolution | Form Factor | Verified GATT Capabilities | Official App | Chipset Platform |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Noise** | ColorFit Pro 4 | 356 x 400 | Square | Battery (0x180F), HR (0x180D) | NoiseFit | Realtek RTL8762D |
| **Noise** | ColorFit Pro 5 | 390 x 450 | Square | Battery (0x180F), HR (0x180D), Buzzer (0x1802) | NoiseFit | Goodix GR5515 + JL |
| **Noise** | Noise Halo Plus | 466 x 466 | Round | Battery (0x180F), HR (0x180D) | NoiseFit | Realtek RTL8763E |
| **boAt** | Wave Call 2 | 240 x 284 | Square | Battery (0x180F), Cove Telemetry Stream | boAt Crest | Realtek (KaHa / Cove) |
| **boAt** | Storm Call 3 | 240 x 280 | Square | Battery (0x180F) | boAt Crest | Huntersun HS6621AG |
| **boAt** | Xtend Plus | 368 x 448 | Square | Battery (0x180F), HR (0x180D), Buzzer (0x1802) | boAt Wave | Goodix GR5515 |
| **boAt** | Lunar Orb | 466 x 466 | Round | Battery (0x180F), HR (0x180D) | boAt Crest | Realtek RTL8763E |
| **Fire-Boltt** | Ninja Calling Pro Plus | 240 x 284 | Square | Battery (0x180F), HR (0x180D), Buzzer (0x1802) | Da Fit | Goodix (CRREPA) |
| **Fire-Boltt** | Phoenix Ultra | 360 x 360 | Round | Battery (0x180F), HR (0x180D), Buzzer (0x1802) | Da Fit | Realtek RTL8762D |
| **Fire-Boltt** | Ring 3 | 240 x 286 | Square | Battery (0x180F), HR (0x180D), Buzzer (0x1802) | Da Fit | Realtek RTL8762D |

---

## 🧪 Testing & Verification

The project includes unit tests for the Python backend and a verified build pipeline for the frontend:

```bash
# Run backend pytest suite
cd backend
py -m pytest -v
# 17 passed in ~1.1s

# Run frontend build
cd ../frontend
npm.cmd run build
# Built cleanly in <900ms
```

---

## 📜 License
MIT License. Created for College Demonstration and Engineering Portfolio.
All product names, logos, and brands are property of their respective owners.
