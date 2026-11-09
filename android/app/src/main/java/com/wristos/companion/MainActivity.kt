package com.wristos.companion

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.wristos.companion.ble.DiscoveredSmartwatch
import com.wristos.companion.network.StepRecordDto
import com.wristos.companion.network.SyncPayload
import com.wristos.companion.ui.theme.*
import kotlinx.coroutines.launch
import java.time.Instant

class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { perms ->
        val allGranted = perms.values.all { it }
        if (!allGranted) {
            Toast.makeText(this, "Bluetooth permissions are required to discover smartwatches.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestBlePermissions()

        setContent {
            WristOsTheme {
                MainAppScaffold()
            }
        }
    }

    private fun requestBlePermissions() {
        val requiredPerms = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            requiredPerms.add(Manifest.permission.BLUETOOTH_SCAN)
            requiredPerms.add(Manifest.permission.BLUETOOTH_CONNECT)
        }

        val missing = requiredPerms.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
        }
    }
}

@Composable
fun MainAppScaffold() {
    val app = WristOsApplication.instance
    var selectedTab by remember { mutableStateOf(0) }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = CardSurface,
                contentColor = TextPrimary
            ) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.Watch, contentDescription = "Dashboard") },
                    label = { Text("Device") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.BluetoothSearching, contentDescription = "Scan") },
                    label = { Text("BLE Scan") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Favorite, contentDescription = "Health") },
                    label = { Text("Health") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.CloudSync, contentDescription = "Bridge") },
                    label = { Text("Bridge") }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBg)
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                0 -> DashboardTab(app)
                1 -> ScannerTab(app)
                2 -> HealthConnectTab(app)
                3 -> BridgeTab(app)
            }
        }
    }
}

@Composable
fun DashboardTab(app: WristOsApplication) {
    val state by app.bleManager.connectionState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "WRISTOS COMPANION",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = CyberCyan
        )
        Text(
            text = "Hardware GATT Bridge for Indian Smartwatches",
            fontSize = 13.sp,
            color = TextMuted
        )

        // Connection Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, if (state.isConnected) EmeraldGreen else CardBorder, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = CardSurface)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = if (state.isConnected) state.connectedDeviceName else "No Smartwatch Connected",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = if (state.isConnected) state.connectedDeviceAddress else "Scan to discover verified models",
                            fontSize = 12.sp,
                            color = TextMuted
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(if (state.isConnected) EmeraldGreen else AmberAlert)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    MetricMiniBox(label = "BATTERY", value = if (state.batteryLevel >= 0) "${state.batteryLevel}%" else "--", color = CyberCyan)
                    MetricMiniBox(label = "HEART RATE", value = if (state.currentHeartRate >= 0) "${state.currentHeartRate} BPM" else "--", color = CrimsonRed)
                    MetricMiniBox(label = "RSSI", value = if (state.currentRssi != 0) "${state.currentRssi} dBm" else "--", color = NeonViolet)
                }
            }
        }

        // Status banner
        Text(
            text = "Status: ${state.statusMessage}",
            fontSize = 12.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.weight(1f))

        // Hardware Buzzer Trigger Button
        Button(
            onClick = { app.bleManager.triggerImmediateAlert(true) },
            enabled = state.isConnected,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = AmberAlert, contentColor = Color.Black),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.NotificationsActive, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("TRIGGER FIND WATCH BUZZER (0x1802)", fontWeight = FontWeight.Bold)
        }

        if (state.isConnected) {
            OutlinedButton(
                onClick = { app.bleManager.disconnect() },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = CrimsonRed)
            ) {
                Text("DISCONNECT DEVICE")
            }
        }
    }
}

@Composable
fun MetricMiniBox(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, fontSize = 10.sp, color = TextMuted, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(4.dp))
        Text(text = value, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = color)
    }
}

@Composable
fun ScannerTab(app: WristOsApplication) {
    val state by app.bleManager.connectionState.collectAsState()
    val devices by app.bleManager.discoveredDevices.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("BLE RADAR SCANNER", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = CyberCyan)
                Text("Noise • boAt • Fire-Boltt Discovered Peripherals", fontSize = 12.sp, color = TextMuted)
            }
            Button(
                onClick = {
                    if (state.isScanning) app.bleManager.stopScan() else app.bleManager.startScan()
                },
                colors = ButtonDefaults.buttonColors(containerColor = if (state.isScanning) CrimsonRed else CyberCyan),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(if (state.isScanning) "STOP" else "SCAN", color = Color.Black, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (devices.isEmpty()) {
            Box(modifier = Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text(
                    text = if (state.isScanning) "Listening for BLE advertising packets..." else "Tap SCAN to discover compatible watches.",
                    color = TextMuted,
                    fontSize = 14.sp
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(devices) { watch ->
                    DeviceRowCard(watch = watch, onConnect = {
                        app.bleManager.connectToDevice(watch.address, watch.name)
                    })
                }
            }
        }
    }
}

@Composable
fun DeviceRowCard(watch: DiscoveredSmartwatch, onConnect: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorder, RoundedCornerShape(12.dp))
            .clickable { onConnect() },
        colors = CardDefaults.cardColors(containerColor = CardSurface)
    ) {
        Row(
            modifier = Modifier.padding(14.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = watch.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Surface(
                        color = NeonViolet.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(text = watch.brand, fontSize = 10.sp, color = NeonViolet, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = watch.address, fontSize = 12.sp, color = TextMuted)
                Text(
                    text = "GATT: ${if (watch.hasStandardHeartRate) "HR(0x180D) " else ""}${if (watch.hasImmediateAlert) "Alert(0x1802) " else ""}Battery(0x180F)",
                    fontSize = 10.sp,
                    color = EmeraldGreen
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(text = "${watch.rssi} dBm", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = CyberCyan)
                Spacer(modifier = Modifier.height(6.dp))
                Button(
                    onClick = onConnect,
                    colors = ButtonDefaults.buttonColors(containerColor = CyberCyan),
                    shape = RoundedCornerShape(6.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text("PAIR", fontSize = 11.sp, color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun HealthConnectTab(app: WristOsApplication) {
    val coroutineScope = rememberCoroutineScope()
    val summary by app.healthConnectManager.summaryState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("HEALTH CONNECT SYNC", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = CyberCyan)
        Text("Official Android 14+ Centralized Fitness Repository", fontSize = 12.sp, color = TextMuted)

        Card(
            modifier = Modifier.fillMaxWidth().border(1.dp, CardBorder, RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = CardSurface)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Health Connect SDK", color = TextSecondary)
                    Text(if (summary.isAvailable) "AVAILABLE" else "UNAVAILABLE", color = if (summary.isAvailable) EmeraldGreen else CrimsonRed, fontWeight = FontWeight.Bold)
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Permissions Granted", color = TextSecondary)
                    Text(if (summary.hasPermissions) "YES" else "PENDING", color = if (summary.hasPermissions) EmeraldGreen else AmberAlert, fontWeight = FontWeight.Bold)
                }
            }
        }

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            MetricCard(label = "TODAY'S STEPS", value = "${summary.todaySteps}", unit = "steps", modifier = Modifier.weight(1f), color = CyberCyan)
            MetricCard(label = "ACTIVE CALORIES", value = "${summary.todayCalories.toInt()}", unit = "kcal", modifier = Modifier.weight(1f), color = AmberAlert)
        }

        MetricCard(label = "RESTING / LATEST HEART RATE", value = "${summary.latestHeartRate}", unit = "BPM", modifier = Modifier.fillMaxWidth(), color = CrimsonRed)

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = {
                coroutineScope.launch {
                    app.healthConnectManager.checkPermissions()
                    app.healthConnectManager.readTodayMetrics()
                }
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = CyberCyan),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.Black)
            Spacer(modifier = Modifier.width(8.dp))
            Text("READ HEALTH CONNECT METRICS", color = Color.Black, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun MetricCard(label: String, value: String, unit: String, modifier: Modifier = Modifier, color: Color) {
    Card(
        modifier = modifier.border(1.dp, CardBorder, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = CardSurface)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = label, fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.Bottom) {
                Text(text = value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = color)
                Spacer(modifier = Modifier.width(4.dp))
                Text(text = unit, fontSize = 12.sp, color = TextSecondary)
            }
        }
    }
}

@Composable
fun BridgeTab(app: WristOsApplication) {
    val coroutineScope = rememberCoroutineScope()
    var serverHost by remember { mutableStateOf("10.0.2.2") }
    var pairingCode by remember { mutableStateOf("WRIST-7824") }
    var syncResult by remember { mutableStateOf("Awaiting sync command.") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Text("FASTAPI BRIDGE CLIENT", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = CyberCyan)
        Text("Synchronizes native BLE telemetry & Health Connect with the Web Dashboard", fontSize = 12.sp, color = TextMuted)

        OutlinedTextField(
            value = serverHost,
            onValueChange = {
                serverHost = it
                app.bridgeClient.updateServerAddress(it)
            },
            label = { Text("FastAPI Host (e.g. 10.0.2.2 or 192.168.1.X)") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CyberCyan,
                unfocusedBorderColor = CardBorder,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            )
        )

        OutlinedTextField(
            value = pairingCode,
            onValueChange = { pairingCode = it },
            label = { Text("Web Dashboard Pairing Code") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = CyberCyan,
                unfocusedBorderColor = CardBorder,
                focusedTextColor = TextPrimary,
                unfocusedTextColor = TextPrimary
            )
        )

        Card(
            modifier = Modifier.fillMaxWidth().border(1.dp, CardBorder, RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = CardSurface)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("Sync Log & Bridge Status", fontSize = 12.sp, color = TextMuted)
                Spacer(modifier = Modifier.height(4.dp))
                Text(syncResult, fontSize = 13.sp, color = EmeraldGreen)
            }
        }

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = {
                coroutineScope.launch {
                    val summary = app.healthConnectManager.readTodayMetrics()
                    val payload = SyncPayload(
                        clientDeviceName = "Pixel 8 Pro (WristOS Companion)",
                        recordsCount = 1,
                        stepsRecords = listOf(
                            StepRecordDto(count = summary.todaySteps, timestamp = Instant.now().toString())
                        )
                    )
                    val res = app.bridgeClient.syncTelemetry(payload)
                    res.onSuccess {
                        syncResult = "Successfully uploaded ${it.recordsProcessed} records to WristOS Web Dashboard!"
                    }.onFailure {
                        syncResult = "Sync Error: ${it.localizedMessage}"
                    }
                }
            },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = CyberCyan),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.CloudUpload, contentDescription = null, tint = Color.Black)
            Spacer(modifier = Modifier.width(8.dp))
            Text("PUSH SYNC TO WEBPAGE", color = Color.Black, fontWeight = FontWeight.Bold)
        }
    }
}
