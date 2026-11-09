package com.wristos.companion.ble

import java.util.UUID

object SmartwatchGattUuids {
    // Bluetooth SIG Standard Services
    val BATTERY_SERVICE: UUID = UUID.fromString("0000180f-0000-1000-8000-00805f9b34fb")
    val BATTERY_LEVEL_CHAR: UUID = UUID.fromString("00002a19-0000-1000-8000-00805f9b34fb")

    val HEART_RATE_SERVICE: UUID = UUID.fromString("0000180d-0000-1000-8000-00805f9b34fb")
    val HEART_RATE_MEASUREMENT_CHAR: UUID = UUID.fromString("00002a37-0000-1000-8000-00805f9b34fb")

    val IMMEDIATE_ALERT_SERVICE: UUID = UUID.fromString("00001802-0000-1000-8000-00805f9b34fb")
    val ALERT_LEVEL_CHAR: UUID = UUID.fromString("00002a06-0000-1000-8000-00805f9b34fb")

    val DEVICE_INFO_SERVICE: UUID = UUID.fromString("0000180a-0000-1000-8000-00805f9b34fb")
    val MODEL_NUMBER_CHAR: UUID = UUID.fromString("00002a24-0000-1000-8000-00805f9b34fb")
    val FIRMWARE_REVISION_CHAR: UUID = UUID.fromString("00002a26-0000-1000-8000-00805f9b34fb")

    // Standard CCCD for enabling notifications
    val CCCD: UUID = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb")

    // Common proprietary base UUIDs for Indian smartwatches
    val CRREPA_DAFIT_SERVICE: UUID = UUID.fromString("0000fee7-0000-1000-8000-00805f9b34fb")
    val KAHA_COVE_SERVICE: UUID = UUID.fromString("0000fee7-0000-1000-8000-00805f9b34fb")
}

data class DiscoveredSmartwatch(
    val address: String,
    val name: String,
    val brand: String,
    val rssi: Int,
    val hasStandardBattery: Boolean = true,
    val hasStandardHeartRate: Boolean = false,
    val hasImmediateAlert: Boolean = false
)

object SmartwatchBrandClassifier {
    fun classifyDevice(name: String?, address: String, rssi: Int): DiscoveredSmartwatch? {
        val safeName = name?.trim() ?: "Unknown BLE Device"
        val lower = safeName.lowercase()

        return when {
            lower.contains("colorfit") || lower.contains("noise") -> {
                DiscoveredSmartwatch(
                    address = address,
                    name = safeName,
                    brand = "Noise",
                    rssi = rssi,
                    hasStandardBattery = true,
                    hasStandardHeartRate = true,
                    hasImmediateAlert = lower.contains("pro 5")
                )
            }
            lower.contains("wave") || lower.contains("storm") || lower.contains("xtend") || lower.contains("boat") || lower.contains("lunar") -> {
                DiscoveredSmartwatch(
                    address = address,
                    name = safeName,
                    brand = "boAt",
                    rssi = rssi,
                    hasStandardBattery = true,
                    hasStandardHeartRate = lower.contains("xtend") || lower.contains("lunar"),
                    hasImmediateAlert = lower.contains("xtend")
                )
            }
            lower.contains("ninja") || lower.contains("phoenix") || lower.contains("ring") || lower.contains("fireboltt") || lower.contains("fb_") -> {
                DiscoveredSmartwatch(
                    address = address,
                    name = safeName,
                    brand = "Fire-Boltt",
                    rssi = rssi,
                    hasStandardBattery = true,
                    hasStandardHeartRate = true,
                    hasImmediateAlert = true
                )
            }
            else -> null
        }
    }
}
