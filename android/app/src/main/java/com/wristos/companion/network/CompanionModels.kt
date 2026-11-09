package com.wristos.companion.network

import com.google.gson.annotations.SerializedName

data class SyncPayload(
    @SerializedName("client_device_name")
    val clientDeviceName: String,
    @SerializedName("health_connect_package_version")
    val healthConnectVersion: String = "1.1.0-alpha07",
    @SerializedName("records_count")
    val recordsCount: Int,
    @SerializedName("steps_records")
    val stepsRecords: List<StepRecordDto> = emptyList(),
    @SerializedName("heart_rate_records")
    val heartRateRecords: List<HeartRateRecordDto> = emptyList()
)

data class StepRecordDto(
    @SerializedName("count")
    val count: Long,
    @SerializedName("timestamp")
    val timestamp: String
)

data class HeartRateRecordDto(
    @SerializedName("beats_per_minute")
    val beatsPerMinute: Long,
    @SerializedName("timestamp")
    val timestamp: String
)

data class SyncResponse(
    @SerializedName("status")
    val status: String,
    @SerializedName("records_processed")
    val recordsProcessed: Int,
    @SerializedName("updated_dates")
    val updatedDates: List<String>,
    @SerializedName("message")
    val message: String
)

data class PairRequest(
    @SerializedName("pairing_code")
    val pairingCode: String,
    @SerializedName("device_name")
    val deviceName: String
)

data class PairResponse(
    @SerializedName("status")
    val status: String,
    @SerializedName("access_token")
    val accessToken: String,
    @SerializedName("device_name")
    val deviceName: String
)
