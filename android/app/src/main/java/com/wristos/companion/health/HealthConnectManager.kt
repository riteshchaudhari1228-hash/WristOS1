package com.wristos.companion.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.Instant
import java.time.temporal.ChronoUnit

data class HealthConnectSummary(
    val isAvailable: Boolean = false,
    val hasPermissions: Boolean = false,
    val todaySteps: Long = 0,
    val todayCalories: Double = 0.0,
    val latestHeartRate: Long = 0,
    val sleepDurationMinutes: Long = 0,
    val lastSyncStatus: String = "Not synchronized"
)

class HealthConnectManager(private val context: Context) {

    private val healthConnectClient: HealthConnectClient? by lazy {
        if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) {
            HealthConnectClient.getOrCreate(context)
        } else {
            null
        }
    }

    val permissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class)
    )

    private val _summaryState = MutableStateFlow(
        HealthConnectSummary(isAvailable = HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE)
    )
    val summaryState: StateFlow<HealthConnectSummary> = _summaryState.asStateFlow()

    suspend fun checkPermissions(): Boolean {
        val client = healthConnectClient ?: return false
        val granted = client.permissionController.getGrantedPermissions()
        val allGranted = granted.containsAll(permissions)
        _summaryState.value = _summaryState.value.copy(hasPermissions = allGranted)
        return allGranted
    }

    suspend fun readTodayMetrics(): HealthConnectSummary {
        val client = healthConnectClient ?: return _summaryState.value
        val now = Instant.now()
        val startOfDay = now.truncatedTo(ChronoUnit.DAYS)

        var totalSteps = 0L
        var totalCals = 0.0
        var latestBpm = 0L

        try {
            // Read Steps
            val stepsResponse = client.readRecords(
                ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startOfDay, now)
                )
            )
            totalSteps = stepsResponse.records.sumOf { it.count }

            // Read Calories
            val calsResponse = client.readRecords(
                ReadRecordsRequest(
                    recordType = TotalCaloriesBurnedRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startOfDay, now)
                )
            )
            totalCals = calsResponse.records.sumOf { it.energy.inKilocalories }

            // Read Heart Rate
            val hrResponse = client.readRecords(
                ReadRecordsRequest(
                    recordType = HeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startOfDay, now)
                )
            )
            latestBpm = hrResponse.records.lastOrNull()?.samples?.lastOrNull()?.beatsPerMinute ?: 72L

            val updated = _summaryState.value.copy(
                todaySteps = totalSteps,
                todayCalories = totalCals,
                latestHeartRate = latestBpm,
                lastSyncStatus = "Live Health Connect data read successfully"
            )
            _summaryState.value = updated
            return updated
        } catch (e: Exception) {
            val errorSummary = _summaryState.value.copy(
                lastSyncStatus = "Error reading Health Connect: ${e.message}"
            )
            _summaryState.value = errorSummary
            return errorSummary
        }
    }
}
