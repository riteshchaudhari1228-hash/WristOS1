package com.wristos.companion

import android.app.Application
import com.wristos.companion.ble.BleManager
import com.wristos.companion.health.HealthConnectManager
import com.wristos.companion.network.WristOsBridgeClient

class WristOsApplication : Application() {

    lateinit var bleManager: BleManager
        private set

    lateinit var healthConnectManager: HealthConnectManager
        private set

    lateinit var bridgeClient: WristOsBridgeClient
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        bleManager = BleManager(this)
        healthConnectManager = HealthConnectManager(this)
        bridgeClient = WristOsBridgeClient()
    }

    companion object {
        lateinit var instance: WristOsApplication
            private set
    }
}
