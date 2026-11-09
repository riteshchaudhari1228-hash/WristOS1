package com.wristos.companion.network

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

interface WristOsApiService {
    @POST("/api/companion/sync")
    suspend fun syncData(
        @Body payload: SyncPayload,
        @Header("x-bridge-token") token: String
    ): Response<SyncResponse>

    @POST("/api/companion/pair")
    suspend fun pairDevice(
        @Body request: PairRequest
    ): Response<PairResponse>
}

class WristOsBridgeClient(
    private var baseUrl: String = "http://10.0.2.2:8000" // Default Android Emulator host bridge to PC localhost
) {
    private var token: String = "wristos-companion-key-secret-2026"
    private var apiService: WristOsApiService

    init {
        apiService = buildApiService()
    }

    fun updateServerAddress(hostIp: String, port: Int = 8000) {
        baseUrl = "http://$hostIp:$port"
        apiService = buildApiService()
    }

    private fun buildApiService(): WristOsApiService {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(WristOsApiService::class.java)
    }

    suspend fun syncTelemetry(payload: SyncPayload): Result<SyncResponse> {
        return try {
            val response = apiService.syncData(payload, token)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Sync failed: HTTP ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun pairWithWebsite(code: String, deviceName: String): Result<PairResponse> {
        return try {
            val response = apiService.pairDevice(PairRequest(code, deviceName))
            if (response.isSuccessful && response.body() != null) {
                token = response.body()!!.accessToken
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Pairing rejected: HTTP ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
