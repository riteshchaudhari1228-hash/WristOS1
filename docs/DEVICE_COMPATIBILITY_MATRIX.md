# WRISTOS — DEVICE COMPATIBILITY MATRIX & HARDWARE SPECIFICATIONS

This document details the verified hardware platforms, chipsets, display configurations, companion applications, and Bluetooth GATT services for the primary target brands in the Indian budget wearable ecosystem: **Noise**, **boAt**, and **Fire-Boltt**.

---

## 1. MASTER DEVICE MATRIX

| Brand | Model Name | Form Factor | Display Resolution | Panel Type | Chipset Architecture | Official Companion App | Standard Battery (0x180F) | Standard HR (0x180D) | Immediate Alert (0x1802) | Custom Wallpaper Support |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Noise** | ColorFit Pro 4 | Square | 356 x 400 | 1.72" TFT 60Hz | Realtek RTL8762D | NoiseFit | Yes | Yes | No | Yes (356x400) |
| **Noise** | ColorFit Pro 5 | Square | 390 x 450 | 1.85" AMOLED | Goodix GR5515 + JL DSP | NoiseFit | Yes | Yes | Yes | Yes (390x450) |
| **Noise** | ColorFit Pulse 2 Max | Rectangular | 240 x 284 | 1.85" TFT LCD | Huntersun HS6621 | NoiseFit | Yes | Partial | No | Yes (240x284) |
| **Noise** | Noise Halo Plus | Round | 466 x 466 | 1.46" AMOLED | Realtek RTL8763E | NoiseFit | Yes | Yes | No | Yes (466x466) |
| **boAt** | Wave Call 2 | Square | 240 x 284 | 1.83" HD Display | Realtek RTL8762D (Cove) | boAt Crest App | Yes | Cove Proprietary | No | Yes (240x284) |
| **boAt** | Storm Call 3 | Square | 240 x 280 | 1.83" HD Display | Huntersun HS6621AG | boAt Crest App | Yes | Cove Proprietary | No | Yes (240x280) |
| **boAt** | Xtend Plus | Square | 368 x 448 | 1.78" AMOLED | Goodix GR5515 | boAt Wave App | Yes | Yes | Yes | Yes (368x448) |
| **boAt** | Lunar Orb | Round | 466 x 466 | 1.45" Round AMOLED | Realtek RTL8763E | boAt Crest App | Yes | Yes | No | Yes (466x466) |
| **Fire-Boltt**| Ninja Calling Pro Plus| Square | 240 x 284 | 1.83" HD Display | Goodix GR5515 (CRREPA) | Da Fit | Yes | Yes | Yes | Yes (240x284) |
| **Fire-Boltt**| Phoenix Ultra | Round | 360 x 360 | 1.39" Round IPS | Realtek RTL8762D (CRREPA)| Da Fit | Yes | Yes | Yes | Yes (360x360) |
| **Fire-Boltt**| Ring 3 | Square | 240 x 286 | 1.80" HD Display | Realtek RTL8762D (CRREPA)| Da Fit | Yes | Yes | Yes | Yes (240x286) |
| **Fire-Boltt**| Dream Wristphone | Square | 320 x 386 | 2.02" IPS Display | Spreadtrum SL8541E | Android 8.1 Standalone | Yes | Android Sensor | N/A | Full Android Wallpaper |

---

## 2. BLUETOOTH SIG STANDARD GATT SERVICES IN BUDGET WEARABLES

### Battery Service (`0x180F`)
- **Characteristic:** Battery Level (`0x2A19`)
- **Permissions:** Read, Notify
- **Format:** 1-byte unsigned integer (0 to 100 percentage).
- **Compliance:** 95%+ of budget Indian smartwatches expose this service standardly to support battery widget displays in Android and iOS status bars.

### Heart Rate Service (`0x180D`)
- **Characteristic:** Heart Rate Measurement (`0x2A37`)
- **Permissions:** Notify (Client Characteristic Configuration Descriptor `0x2902` must be enabled).
- **Format:** Byte 0 contains flags. Bit 0 indicates 8-bit vs 16-bit BPM format.
- **Compliance:** Verified on Goodix GR5515 models (Noise ColorFit Pro 5, boAt Xtend Plus, Fire-Boltt Ninja). Models using KaHa / CoveIoT RTOS (boAt Wave Call 2) encapsulate heart rate inside a proprietary characteristic.

### Immediate Alert Service (`0x1802`)
- **Characteristic:** Alert Level (`0x2A06`)
- **Permissions:** Write Without Response
- **Format:** 1-byte integer:
  - `0x00` = No Alert
  - `0x01` = Mild Alert
  - `0x02` = High Alert (continuous buzzer & haptic motor trigger for 10 seconds).
- **Compliance:** Verified on CRREPA platform (Fire-Boltt Phoenix, Ninja Pro) and Goodix platform.

---

## 3. PROPRIETARY VENDOR FRAMEWORKS & LIMITATIONS

### 1. KaHa / CoveIoT Platform (boAt Crest App)
- Used by boAt Wave Call, Wave Sigma, Storm Call series.
- Encapsulates step counts and historical calorie buffers in proprietary service `0xFEE7`.
- Requires cryptographic handshake token generated during official boAt user registration.
- **WristOS Strategy:** Standard Battery read via GATT; historical activity synchronized via Android Companion Health Connect bridge.

### 2. CRREPA MOYING Platform (Da Fit App)
- Used extensively by Fire-Boltt (Ninja, Phoenix, Ring, Gladiator) and Noise ColorFit Pro 5.
- Exposes standard GATT Battery, Heart Rate, and Immediate Alert!
- Dial installation format uses `.bin` packaging with CRC-32 checksums.
- **WristOS Strategy:** Direct Web Bluetooth support for Live HR, Battery, and Find Watch Buzzer; Watch Face Studio exports exact resolution images for Da Fit custom dial application.

### 3. NoiseFit Platform
- Realtek RTOS custom firmware compiled with Noise signature.
- Custom watch face creation handled via cloud rendering in NoiseFit Studio.
- **WristOS Strategy:** Precision resolution canvas export matching 356x400 (ColorFit Pro 4) or 466x466 (Halo Plus) with 1-click companion upload guide.
