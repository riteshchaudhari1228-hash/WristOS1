package com.wristos.companion.ble

import android.annotation.SuppressLint
import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

data class BleConnectionState(
    val isScanning: Boolean = false,
    val isConnected: Boolean = false,
    val connectedDeviceName: String = "",
    val connectedDeviceAddress: String = "",
    val batteryLevel: Int = -1,
    val currentHeartRate: Int = -1,
    val currentRssi: Int = 0,
    val lastAlertTriggered: Boolean = false,
    val statusMessage: String = "Ready to scan"
)

class BleManager(private val context: Context) {

    private val bluetoothManager: BluetoothManager? =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter

    private var bluetoothGatt: BluetoothGatt? = null
    private var bleScanner: BluetoothLeScanner? = null

    private val _discoveredDevices = MutableStateFlow<List<DiscoveredSmartwatch>>(emptyList())
    val discoveredDevices: StateFlow<List<DiscoveredSmartwatch>> = _discoveredDevices.asStateFlow()

    private val _connectionState = MutableStateFlow(BleConnectionState())
    val connectionState: StateFlow<BleConnectionState> = _connectionState.asStateFlow()

    private val mainHandler = Handler(Looper.getMainLooper())

    private val scanCallback = object : ScanCallback() {
        @SuppressLint("MissingPermission")
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result?.let { res ->
                val device = res.device
                val name = device.name ?: res.scanRecord?.deviceName
                val address = device.address
                val rssi = res.rssi

                val classified = SmartwatchBrandClassifier.classifyDevice(name, address, rssi)
                classified?.let { watch ->
                    val currentList = _discoveredDevices.value.toMutableList()
                    val existingIndex = currentList.indexOfFirst { it.address == watch.address }
                    if (existingIndex >= 0) {
                        currentList[existingIndex] = watch
                    } else {
                        currentList.add(watch)
                    }
                    _discoveredDevices.value = currentList
                }
            }
        }

        override fun onScanFailed(errorCode: Int) {
            _connectionState.value = _connectionState.value.copy(
                isScanning = false,
                statusMessage = "BLE Scan failed with error code: $errorCode"
            )
        }
    }

    @SuppressLint("MissingPermission")
    fun startScan() {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            _connectionState.value = _connectionState.value.copy(statusMessage = "Bluetooth is disabled.")
            return
        }

        bleScanner = bluetoothAdapter.bluetoothLeScanner
        _discoveredDevices.value = emptyList()
        _connectionState.value = _connectionState.value.copy(isScanning = true, statusMessage = "Scanning for smartwatches...")

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .build()

        bleScanner?.startScan(null, settings, scanCallback)

        // Automatically stop scan after 12 seconds to conserve phone battery
        mainHandler.postDelayed({
            if (_connectionState.value.isScanning) {
                stopScan()
            }
        }, 12000)
    }

    @SuppressLint("MissingPermission")
    fun stopScan() {
        try {
            bleScanner?.stopScan(scanCallback)
        } catch (e: Exception) {
            Log.e("BleManager", "Error stopping scan", e)
        }
        _connectionState.value = _connectionState.value.copy(isScanning = false, statusMessage = "Scan completed.")
    }

    @SuppressLint("MissingPermission")
    fun connectToDevice(address: String, name: String) {
        stopScan()
        bluetoothGatt?.close()

        val device = bluetoothAdapter?.getRemoteDevice(address) ?: return
        _connectionState.value = _connectionState.value.copy(
            statusMessage = "Connecting to $name ($address)..."
        )

        bluetoothGatt = device.connectGatt(context, false, gattCallback, BluetoothDevice.TRANSPORT_LE)
    }

    @SuppressLint("MissingPermission")
    fun disconnect() {
        bluetoothGatt?.disconnect()
        bluetoothGatt?.close()
        bluetoothGatt = null
        _connectionState.value = BleConnectionState(statusMessage = "Disconnected from device.")
    }

    @SuppressLint("MissingPermission")
    fun triggerImmediateAlert(highAlert: Boolean = true) {
        val gatt = bluetoothGatt ?: return
        val alertService = gatt.getService(SmartwatchGattUuids.IMMEDIATE_ALERT_SERVICE)
        if (alertService == null) {
            _connectionState.value = _connectionState.value.copy(
                statusMessage = "Immediate Alert Service (0x1802) not exposed by watch."
            )
            return
        }

        val alertChar = alertService.getCharacteristic(SmartwatchGattUuids.ALERT_LEVEL_CHAR) ?: return
        alertChar.value = byteArrayOf(if (highAlert) 0x02.toByte() else 0x00.toByte())
        gatt.writeCharacteristic(alertChar)

        _connectionState.value = _connectionState.value.copy(
            lastAlertTriggered = true,
            statusMessage = "Buzzer Alert sent to smartwatch!"
        )
    }

    private val gattCallback = object : BluetoothGattCallback() {
        @SuppressLint("MissingPermission")
        override fun onConnectionStateChange(gatt: BluetoothGatt?, status: Int, newState: Int) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                _connectionState.value = _connectionState.value.copy(
                    isConnected = true,
                    connectedDeviceName = gatt?.device?.name ?: "Smartwatch",
                    connectedDeviceAddress = gatt?.device?.address ?: "",
                    statusMessage = "Connected. Discovering GATT services..."
                )
                gatt?.discoverServices()
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                _connectionState.value = _connectionState.value.copy(
                    isConnected = false,
                    statusMessage = "Device disconnected."
                )
            }
        }

        @SuppressLint("MissingPermission")
        override fun onServicesDiscovered(gatt: BluetoothGatt?, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS && gatt != null) {
                _connectionState.value = _connectionState.value.copy(
                    statusMessage = "GATT Services discovered. Reading sensors..."
                )

                // Read Battery Level if available
                val batteryService = gatt.getService(SmartwatchGattUuids.BATTERY_SERVICE)
                val batteryChar = batteryService?.getCharacteristic(SmartwatchGattUuids.BATTERY_LEVEL_CHAR)
                if (batteryChar != null) {
                    gatt.readCharacteristic(batteryChar)
                }

                // Enable Heart Rate Notifications if available
                val hrService = gatt.getService(SmartwatchGattUuids.HEART_RATE_SERVICE)
                val hrChar = hrService?.getCharacteristic(SmartwatchGattUuids.HEART_RATE_MEASUREMENT_CHAR)
                if (hrChar != null) {
                    gatt.setCharacteristicNotification(hrChar, true)
                    val descriptor = hrChar.getDescriptor(SmartwatchGattUuids.CCCD)
                    if (descriptor != null) {
                        descriptor.value = BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE
                        gatt.writeDescriptor(descriptor)
                    }
                }
            }
        }

        override fun onCharacteristicRead(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS && characteristic != null) {
                if (characteristic.uuid == SmartwatchGattUuids.BATTERY_LEVEL_CHAR) {
                    val battery = characteristic.value.firstOrNull()?.toInt() ?: -1
                    _connectionState.value = _connectionState.value.copy(
                        batteryLevel = battery,
                        statusMessage = "Battery level: $battery%"
                    )
                }
            }
        }

        override fun onCharacteristicChanged(gatt: BluetoothGatt?, characteristic: BluetoothGattCharacteristic?) {
            characteristic?.let { ch ->
                if (ch.uuid == SmartwatchGattUuids.HEART_RATE_MEASUREMENT_CHAR) {
                    val flag = ch.value[0].toInt()
                    val hrValue = if ((flag and 0x01) != 0) {
                        (ch.value[1].toInt() and 0xFF) or ((ch.value[2].toInt() and 0xFF) shl 8)
                    } else {
                        ch.value[1].toInt() and 0xFF
                    }

                    _connectionState.value = _connectionState.value.copy(
                        currentHeartRate = hrValue,
                        statusMessage = "Live Heart Rate: $hrValue BPM"
                    )
                }
            }
        }

        override fun onReadRemoteRssi(gatt: BluetoothGatt?, rssi: Int, status: Int) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                _connectionState.value = _connectionState.value.copy(currentRssi = rssi)
            }
        }
    }
}
