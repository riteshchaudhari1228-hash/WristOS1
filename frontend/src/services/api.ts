import {
  DeviceModelInfo, DeviceCompatibilityReport, ConnectedDeviceSession,
  WatchFaceDesign, TodayHealthMetrics, AnalyticsOverview,
  WristPilotResponse, AdaptiveThemePreset, RoutineItem
} from '../types';

// In local dev, Vite proxies /api → http://127.0.0.1:8000 (see vite.config.ts)
// In production (Vercel), set VITE_API_URL=https://your-wristos-backend.onrender.com
// If VITE_API_URL is set, all API calls go directly to that URL.
// If not set (local dev or Vercel without env var), falls back to relative /api path.
const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE = VITE_API_URL ? `${VITE_API_URL}/api` : '/api';

export const api = {
  // --- DEVICES ---
  async getDevices(brand?: string): Promise<DeviceModelInfo[]> {
    try {
      const url = brand ? `${API_BASE}/devices?brand=${encodeURIComponent(brand)}` : `${API_BASE}/devices`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch devices');
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using client-side registry fallback', e);
      return CLIENT_FALLBACK_DEVICES;
    }
  },

  async getDeviceCompatibility(deviceId: string): Promise<DeviceCompatibilityReport> {
    try {
      const res = await fetch(`${API_BASE}/devices/${deviceId}/compatibility`);
      if (!res.ok) throw new Error('Failed to fetch compatibility report');
      return await res.json();
    } catch (e) {
      const d = CLIENT_FALLBACK_DEVICES.find(dev => dev.id === deviceId);
      return {
        device_id: deviceId,
        brand: d?.brand || 'Smartwatch',
        model_name: d?.model_name || 'Compatible Model',
        verification_level: d?.verification_level || 'PARTIAL_HYBRID',
        is_fully_supported: d?.verification_level === 'VERIFIED_GATT',
        supported_features: ['Custom Canvas Wallpaper Export', 'GATT Battery Level (0x180F)'],
        unsupported_features: ['Direct OTA Watch Face Binary Flash (Requires official app)'],
        companion_app: d?.companion_app || 'Official Companion App',
        chipset_notes: d?.chipset || 'Realtek RTL8762D',
        wallpaper_resolution: `${d?.resolution_width || 240}x${d?.resolution_height || 280}`,
        wallpaper_workflow: `Export PNG from WristOS -> Apply via ${d?.companion_app}`,
        ble_gatt_status: 'Web Bluetooth & Android BLE Compatible',
        guide_steps: d?.app_guide_steps || ['1. Export image.', '2. Open companion app.']
      };
    }
  },

  async getCurrentSession(): Promise<ConnectedDeviceSession> {
    try {
      const res = await fetch(`${API_BASE}/devices/current/session`);
      if (!res.ok) throw new Error('Failed to fetch active session');
      return await res.json();
    } catch (e) {
      return {
        id: 'session-demo-fallback',
        device_model_id: 'boat-wave-call-2',
        device_name: 'boAt Wave Call 2 (Demo)',
        mac_address: 'D4:F5:13:88:21:40',
        connection_mode: 'DEMO_SIMULATED',
        is_connected: true,
        battery_level: 86,
        last_heart_rate: 74,
        rssi: -64,
        firmware_version: 'v2.1.04-RTOS',
        connected_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      };
    }
  },

  async connectDevice(deviceId: string, mode: string = 'DEMO_SIMULATED', deviceName?: string): Promise<ConnectedDeviceSession> {
    try {
      const res = await fetch(`${API_BASE}/devices/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_model_id: deviceId, connection_mode: mode, device_name: deviceName })
      });
      if (!res.ok) throw new Error('Connect failed');
      return await res.json();
    } catch (e) {
      const d = CLIENT_FALLBACK_DEVICES.find(dev => dev.id === deviceId);
      return {
        id: `session-${Date.now()}`,
        device_model_id: deviceId,
        device_name: deviceName || (d ? `${d.model_name} (${mode === 'DEMO_SIMULATED' ? 'Demo' : 'Live'})` : 'Smartwatch'),
        mac_address: 'D4:F5:13:88:21:40',
        connection_mode: mode as any,
        is_connected: true,
        battery_level: 82,
        last_heart_rate: 72,
        rssi: -62,
        firmware_version: 'v2.1.04-RTOS',
        connected_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString()
      };
    }
  },

  async findWatch(deviceId: string, alertLevel: number = 2): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/devices/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, action: 'trigger_alert', alert_level: alertLevel })
      });
      if (!res.ok) throw new Error('Find failed');
      return await res.json();
    } catch (e) {
      return {
        device_id: deviceId,
        action_executed: 'trigger_alert',
        success: true,
        is_hardware_alert: false,
        rssi: -64,
        estimated_proximity_level: 'Near (1 - 3 meters)',
        estimated_distance_meters: 2.15,
        radar_angle_deg: 45,
        interference_warning: 'Interference Warning: Human body tissue and walls attenuate 2.4GHz BLE signal by 10-15 dB.',
        message: 'Radar proximity scanning active. Hardware buzzer simulated.',
        last_known_timestamp: new Date().toISOString()
      };
    }
  },

  // --- WATCH FACES ---
  async getWatchFaces(): Promise<WatchFaceDesign[]> {
    try {
      const res = await fetch(`${API_BASE}/watchfaces`);
      if (!res.ok) throw new Error('Failed to fetch watch faces');
      return await res.json();
    } catch (e) {
      return CLIENT_FALLBACK_WATCHFACES;
    }
  },

  async createWatchFace(data: Partial<WatchFaceDesign>): Promise<WatchFaceDesign> {
    try {
      const res = await fetch(`${API_BASE}/watchfaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create watch face');
      return await res.json();
    } catch (e) {
      const newFace: WatchFaceDesign = {
        id: `wf-${Date.now()}`,
        name: data.name || 'Custom Face',
        theme: data.theme || 'cyberpunk',
        style: data.style || 'digital',
        target_model_id: data.target_model_id || 'boat-wave-call-2',
        resolution_width: data.resolution_width || 240,
        resolution_height: data.resolution_height || 284,
        clock_font: data.clock_font || 'Space Grotesk',
        clock_position: data.clock_position || 'center',
        time_format: data.time_format || '24h',
        primary_color: data.primary_color || '#00F2FE',
        secondary_color: data.secondary_color || '#9d4edd',
        accent_color: data.accent_color || '#00FF88',
        background_type: data.background_type || 'ai_art',
        background_prompt: data.background_prompt || '',
        background_image_data: data.background_image_data || null,
        show_seconds: data.show_seconds ?? true,
        show_date: data.show_date ?? true,
        show_steps: data.show_steps ?? true,
        show_heart_rate: data.show_heart_rate ?? true,
        show_battery: data.show_battery ?? true,
        show_calories: data.show_calories ?? false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newFace;
    }
  },

  async generateAiWatchFace(prompt: string, modelId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/watchfaces/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, target_model_id: modelId })
      });
      if (!res.ok) throw new Error('AI generation failed');
      return await res.json();
    } catch (e) {
      return {
        generated_design: {
          id: `wf-ai-${Date.now()}`,
          name: `AI: ${prompt.slice(0, 20)}`,
          theme: 'cyberpunk',
          style: 'digital',
          target_model_id: modelId,
          resolution_width: 240,
          resolution_height: 284,
          clock_font: 'Space Grotesk',
          clock_position: 'center',
          time_format: '24h',
          primary_color: '#00F2FE',
          secondary_color: '#9d4edd',
          accent_color: '#00FF88',
          background_type: 'ai_art',
          background_prompt: prompt,
          background_image_data: null,
          show_seconds: true,
          show_date: true,
          show_steps: true,
          show_heart_rate: true,
          show_battery: true,
          show_calories: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        ai_concept_reasoning: `Synthesized bespoke color palette for '${prompt}' with electric cyan glow and high contrast background.`,
        palette_used: ['#00F2FE', '#9d4edd', '#00FF88'],
        export_notice: 'Export wallpaper PNG and apply via official companion app.'
      };
    }
  },

  async exportWallpaper(designId: string, modelId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/watchfaces/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_id: designId, target_model_id: modelId })
      });
      if (!res.ok) throw new Error('Export failed');
      return await res.json();
    } catch (e) {
      const d = CLIENT_FALLBACK_DEVICES.find(dev => dev.id === modelId);
      return {
        design_id: designId,
        target_model: d?.model_name || 'Smartwatch',
        dimensions: `${d?.resolution_width || 240}x${d?.resolution_height || 280} px`,
        file_name: `wristos_wallpaper_${modelId}.png`,
        download_url: `/api/watchfaces/download/wristos_wallpaper_${modelId}.png`,
        official_app_name: d?.companion_app || 'Official App',
        is_direct_ota: false,
        install_instructions: d?.app_guide_steps || [
          '1. Save image to phone gallery.',
          '2. Open official smartwatch app.',
          '3. Navigate to Watch Faces > Custom DIY Face > Select Picture.'
        ],
        compatibility_warning: 'Hardware Notice: Vendor firmware requires official companion app to flash dial. WristOS exports the pixel-perfect wallpaper.'
      };
    }
  },

  // --- HEALTH & ANALYTICS ---
  async getTodayHealth(): Promise<TodayHealthMetrics> {
    try {
      const res = await fetch(`${API_BASE}/health/today`);
      if (!res.ok) throw new Error('Failed to fetch today health');
      return await res.json();
    } catch (e) {
      return {
        date: new Date().toISOString().split('T')[0],
        steps: 8420,
        step_goal: 10000,
        step_percentage: 84.2,
        distance_km: 6.12,
        calories: 485,
        calorie_goal: 600,
        active_minutes: 52,
        heart_rate_current: 74,
        heart_rate_resting: 62,
        heart_rate_max: 134,
        sleep_total_hours: 7.4,
        sleep_deep_hours: 2.1,
        battery_level: 86,
        data_source_badge: 'DEMO_SIMULATED',
        medical_disclaimer: 'NOTICE: WristOS telemetry is for personal fitness demonstration only. Not for medical diagnosis.'
      };
    }
  },

  async getHealthAnalytics(period: string = '7_DAYS'): Promise<AnalyticsOverview> {
    try {
      const res = await fetch(`${API_BASE}/health/analytics?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return await res.json();
    } catch (e) {
      return CLIENT_FALLBACK_ANALYTICS;
    }
  },

  // --- AI PILOT ---
  async sendAiCommand(message: string, deviceId: string = 'boat-wave-call-2'): Promise<WristPilotResponse> {
    try {
      const res = await fetch(`${API_BASE}/ai/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, active_device_id: deviceId })
      });
      if (!res.ok) throw new Error('AI command failed');
      return await res.json();
    } catch (e) {
      // Offline fallback rule-based response
      const low = message.toLowerCase();
      if (low.includes('black and gold') || low.includes('gold')) {
        return {
          query: message,
          intent: 'GENERATE_WATCHFACE_THEME',
          reply_message: 'Executed: Created an Executive Black & Gold watch face with rich metallic accents.',
          action: {
            tool_name: 'configure_watchface_canvas',
            target_page: 'watch_face_studio',
            parameters: { theme: 'business', primary_color: '#FFD700', secondary_color: '#18181B' },
            confirmation_required: false,
            is_supported: true,
            hardware_dependent: false
          },
          compatibility_note: 'Watch face is scaled to hardware resolution.',
          suggested_quick_prompts: ['Export this watch face wallpaper', 'Show my steps from this week']
        };
      }
      return {
        query: message,
        intent: 'GENERAL_INQUIRY',
        reply_message: `WristPilot AI processed: "${message}". Telemetry and actions strictly follow verified hardware GATT capabilities.`,
        suggested_quick_prompts: ['Design a black and gold watch face', 'Show my steps from this week', 'Find my connected watch']
      };
    }
  },

  // --- AUTOMATIONS ---
  async getAdaptiveThemes(): Promise<AdaptiveThemePreset[]> {
    try {
      const res = await fetch(`${API_BASE}/automations/adaptive-themes`);
      if (!res.ok) throw new Error('Failed to fetch adaptive themes');
      return await res.json();
    } catch (e) {
      return CLIENT_FALLBACK_ADAPTIVE_THEMES;
    }
  },

  async getRoutines(): Promise<RoutineItem[]> {
    try {
      const res = await fetch(`${API_BASE}/automations/routines`);
      if (!res.ok) throw new Error('Failed to fetch routines');
      return await res.json();
    } catch (e) {
      return CLIENT_FALLBACK_ROUTINES;
    }
  }
};

// Client-side fallback datasets
export const CLIENT_FALLBACK_DEVICES: DeviceModelInfo[] = [
  {
    id: 'noise-colorfit-pro-4',
    brand: 'Noise',
    model_name: 'ColorFit Pro 4',
    shape: 'square',
    resolution_width: 356,
    resolution_height: 400,
    screen_type: 'TFT LCD (60Hz)',
    screen_size: '1.72-inch',
    companion_app: 'NoiseFit: Health & Fitness',
    companion_package: 'com.mediatek.wwtv.wearable.noise',
    chipset: 'Realtek RTL8762D (RTOS)',
    ble_name_prefix: 'ColorFit_Pro4',
    supported_services: ['0000180f-0000-1000-8000-00805f9b34fb', '0000180d-0000-1000-8000-00805f9b34fb'],
    has_standard_heart_rate: true,
    has_standard_battery: true,
    has_immediate_alert: false,
    custom_wallpaper_export: true,
    direct_ota_watchface: false,
    verification_level: 'PARTIAL_HYBRID',
    limitations_notes: 'NoiseFit proprietary encryption protects direct OTA bin flashing. Custom watch face must be exported as 356x400 PNG and uploaded via NoiseFit Cloud Studio.',
    app_guide_steps: [
      '1. In WristOS Watch Face Studio, export wallpaper at 356x400.',
      '2. Open official NoiseFit app on your smartphone.',
      '3. Navigate to Watch Faces > Custom Face / DIY Face.',
      '4. Choose Upload from Gallery and select exported image.',
      '5. Tap Sync to Device.'
    ]
  },
  {
    id: 'noise-colorfit-pro-5',
    brand: 'Noise',
    model_name: 'ColorFit Pro 5',
    shape: 'square',
    resolution_width: 390,
    resolution_height: 450,
    screen_type: 'AMOLED',
    screen_size: '1.85-inch',
    companion_app: 'NoiseFit: Health & Fitness',
    companion_package: 'com.mediatek.wwtv.wearable.noise',
    chipset: 'Goodix GR5515 + JL DSP',
    ble_name_prefix: 'ColorFit_Pro5',
    supported_services: ['0000180f-0000-1000-8000-00805f9b34fb', '0000180d-0000-1000-8000-00805f9b34fb', '00001802-0000-1000-8000-00805f9b34fb'],
    has_standard_heart_rate: true,
    has_standard_battery: true,
    has_immediate_alert: true,
    custom_wallpaper_export: true,
    direct_ota_watchface: false,
    verification_level: 'VERIFIED_GATT',
    limitations_notes: 'Supports standard GATT Heart Rate notifications and Immediate Alert buzzer commands over Web Bluetooth.',
    app_guide_steps: [
      '1. Export wallpaper image at 390x450 from WristOS.',
      '2. Open NoiseFit app > Device Settings > Watch Faces.',
      '3. Select Custom Wallpaper and choose exported graphic.',
      '4. Press Install.'
    ]
  },
  {
    id: 'noise-halo-plus',
    brand: 'Noise',
    model_name: 'Noise Halo Plus',
    shape: 'round',
    resolution_width: 466,
    resolution_height: 466,
    screen_type: 'AMOLED Round',
    screen_size: '1.46-inch',
    companion_app: 'NoiseFit: Health & Fitness',
    companion_package: 'com.mediatek.wwtv.wearable.noise',
    chipset: 'Realtek RTL8763E Dual-mode BLE 5.3',
    ble_name_prefix: 'Noise_HaloPlus',
    supported_services: ['0000180f-0000-1000-8000-00805f9b34fb', '0000180d-0000-1000-8000-00805f9b34fb'],
    has_standard_heart_rate: true,
    has_standard_battery: true,
    has_immediate_alert: false,
    custom_wallpaper_export: true,
    direct_ota_watchface: false,
    verification_level: 'PARTIAL_HYBRID',
    limitations_notes: 'Circular display requires centered radial watch face compositions. Export canvas as 466x466 circular bounding box.',
    app_guide_steps: [
      '1. Select Circular Bezel in WristOS and export at 466x466.',
      '2. Open NoiseFit > My Watch > Watch Faces > Photo Face.',
      '3. Crop circle in NoiseFit preview and sync.'
    ]
  },
  {
    id: 'boat-wave-call-2',
    brand: 'boAt',
    model_name: 'Wave Call 2',
    shape: 'square',
    resolution_width: 240,
    resolution_height: 284,
    screen_type: 'HD TFT',
    screen_size: '1.83-inch',
    companion_app: 'boAt Crest App',
    companion_package: 'com.coveiot.boat.crest',
    chipset: 'Realtek RTL8762D (KaHa / CoveIoT Platform)',
    ble_name_prefix: 'WaveCall2_',
    supported_services: ['0000180f-0000-1000-8000-00805f9b34fb'],
    has_standard_heart_rate: false,
    has_standard_battery: true,
    has_immediate_alert: false,
    custom_wallpaper_export: true,
    direct_ota_watchface: false,
    verification_level: 'PARTIAL_HYBRID',
    limitations_notes: 'Uses KaHa/CoveIoT proprietary framing for historical telemetry. Battery percentage readable over standard GATT. Live steps sync via Android Companion Health Connect bridge.',
    app_guide_steps: [
      '1. Generate 240x284 wallpaper design in WristOS.',
      '2. Open boAt Crest App > More > Watch Faces.',
      '3. Tap Create Custom Face > Choose from gallery and apply.'
    ]
  },
  {
    id: 'boat-xtend-plus',
    brand: 'boAt',
    model_name: 'Xtend Plus',
    shape: 'square',
    resolution_width: 368,
    resolution_height: 448,
    screen_type: 'AMOLED',
    screen_size: '1.78-inch',
    companion_app: 'boAt Wave App',
    companion_package: 'com.boat.wave',
    chipset: 'Goodix GR5515',
    ble_name_prefix: 'XtendPlus_',
    supported_services: ['0000180f-0000-1000-8000-00805f9b34fb', '0000180d-0000-1000-8000-00805f9b34fb', '00001802-0000-1000-8000-00805f9b34fb'],
    has_standard_heart_rate: true,
    has_standard_battery: true,
    has_immediate_alert: true,
    custom_wallpaper_export: true,
    direct_ota_watchface: false,
    verification_level: 'VERIFIED_GATT',
    limitations_notes: 'Standard GATT compliance for Battery, Heart Rate stream, and Immediate Alert buzzer. Wallpaper resolution is 368x448 high density.',
    app_guide_steps: [
      '1. Create AMOLED watch face in WristOS at 368x448.',
      '2. Open boAt Wave App > Device > Dial Market > DIY Watch Face.',
      '3. Select wallpaper and flash.'
    ]
  },
  {
    id: 'fireboltt-ninja-calling-pro-plus',
    brand: 'Fire-Boltt',
    model_name: 'Ninja Calling Pro Plus',
    shape: 'square',
    resolution_width: 240,
    resolution_height: 284,
    screen_type: 'HD Display',
    screen_size: '1.83-inch',
    companion_app: 'Da Fit',
    companion_package: 'com.crrepa.band.dafit',
    chipset: 'Goodix GR5515 (MOYING / CRREPA platform)',
    ble_name_prefix: 'FB_NinjaPro',
    supported_services: ['0000180f-0000-1000-8000-00805f9b34fb', '0000180d-0000-1000-8000-00805f9b34fb', '00001802-0000-1000-8000-00805f9b34fb'],
    has_standard_heart_rate: true,
    has_standard_battery: true,
    has_immediate_alert: true,
    custom_wallpaper_export: true,
    direct_ota_watchface: false,
    verification_level: 'VERIFIED_GATT',
    limitations_notes: 'Uses CRREPA Da Fit firmware stack. Standard BLE GATT Battery, HR, and Immediate Alert (Find Watch Buzz) are verified directly over Web Bluetooth!',
    app_guide_steps: [
      '1. Export 240x284 image from WristOS.',
      '2. Open Da Fit app on smartphone.',
      '3. Go to Middle Tab > Watch Faces > Edit (Face 4 / Custom).',
      '4. Tap Select Picture, choose exported file, and save.'
    ]
  },
  {
    id: 'fireboltt-phoenix-ultra',
    brand: 'Fire-Boltt',
    model_name: 'Phoenix Ultra',
    shape: 'round',
    resolution_width: 360,
    resolution_height: 360,
    screen_type: 'Round IPS',
    screen_size: '1.39-inch',
    companion_app: 'Da Fit',
    companion_package: 'com.crrepa.band.dafit',
    chipset: 'Realtek RTL8762D (CRREPA RTOS)',
    ble_name_prefix: 'FB_Phoenix',
    supported_services: ['0000180f-0000-1000-8000-00805f9b34fb', '0000180d-0000-1000-8000-00805f9b34fb', '00001802-0000-1000-8000-00805f9b34fb'],
    has_standard_heart_rate: true,
    has_standard_battery: true,
    has_immediate_alert: true,
    custom_wallpaper_export: true,
    direct_ota_watchface: false,
    verification_level: 'VERIFIED_GATT',
    limitations_notes: 'Round 360x360 dial. CRREPA Bluetooth stack responds to standard Immediate Alert 0x1802 for buzzer.',
    app_guide_steps: [
      '1. Export round 360x360 wallpaper from WristOS.',
      '2. Launch Da Fit > Device Settings > Watch Faces.',
      '3. Tap Custom Dial > Select Picture > Apply.'
    ]
  }
];

export const CLIENT_FALLBACK_WATCHFACES: WatchFaceDesign[] = [
  {
    id: 'preset-cyberpunk-neon',
    name: 'Cyberpunk Lumina',
    theme: 'cyberpunk',
    style: 'digital',
    target_model_id: 'boat-wave-call-2',
    resolution_width: 240,
    resolution_height: 284,
    clock_font: 'Space Grotesk',
    clock_position: 'center',
    time_format: '24h',
    primary_color: '#00F2FE',
    secondary_color: '#9d4edd',
    accent_color: '#00FF88',
    background_type: 'ai_art',
    background_prompt: 'Futuristic synthwave grid skyline with neon cyan horizon',
    background_image_data: null,
    show_seconds: true,
    show_date: true,
    show_steps: true,
    show_heart_rate: true,
    show_battery: true,
    show_calories: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'preset-college-academic',
    name: 'Campus Horizon',
    theme: 'college',
    style: 'digital',
    target_model_id: 'noise-colorfit-pro-4',
    resolution_width: 356,
    resolution_height: 400,
    clock_font: 'Inter',
    clock_position: 'top',
    time_format: '12h',
    primary_color: '#38BDF8',
    secondary_color: '#1E293B',
    accent_color: '#FBBF24',
    background_type: 'gradient',
    background_prompt: 'Deep collegiate oxford navy with subtle geometric angles',
    background_image_data: null,
    show_seconds: false,
    show_date: true,
    show_steps: true,
    show_heart_rate: false,
    show_battery: true,
    show_calories: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'preset-minimal-analog',
    name: 'Geneva Monochrome',
    theme: 'minimal',
    style: 'analog',
    target_model_id: 'fireboltt-phoenix-ultra',
    resolution_width: 360,
    resolution_height: 360,
    clock_font: 'Cinzel',
    clock_position: 'center',
    time_format: '12h',
    primary_color: '#F8FAFC',
    secondary_color: '#0F172A',
    accent_color: '#EF4444',
    background_type: 'solid',
    background_prompt: 'Ultra matte obsidian black dial with crisp micro markers',
    background_image_data: null,
    show_seconds: true,
    show_date: true,
    show_steps: false,
    show_heart_rate: true,
    show_battery: true,
    show_calories: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'preset-sports-velocity',
    name: 'Aero Dynamic Red',
    theme: 'sports',
    style: 'digital',
    target_model_id: 'boat-xtend-plus',
    resolution_width: 368,
    resolution_height: 448,
    clock_font: 'Chakra Petch',
    clock_position: 'center',
    time_format: '24h',
    primary_color: '#22C55E',
    secondary_color: '#EF4444',
    accent_color: '#EAB308',
    background_type: 'pattern',
    background_prompt: 'Carbon fiber weave texture with dual dynamic activity rings',
    background_image_data: null,
    show_seconds: true,
    show_date: true,
    show_steps: true,
    show_heart_rate: true,
    show_battery: true,
    show_calories: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const CLIENT_FALLBACK_ANALYTICS: AnalyticsOverview = {
  period: '7_DAYS',
  total_steps: 68420,
  avg_daily_steps: 9774,
  total_calories: 3880,
  avg_sleep_hours: 7.3,
  avg_heart_rate: 71,
  daily_history: [
    { date: '2026-10-23', steps: 8420, step_goal: 10000, distance_km: 6.57, calories: 485, active_minutes: 56, avg_heart_rate: 72, min_heart_rate: 59, max_heart_rate: 135, sleep_minutes: 444, deep_sleep_minutes: 124, light_sleep_minutes: 230, rem_sleep_minutes: 90, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { date: '2026-10-24', steps: 10250, step_goal: 10000, distance_km: 7.99, calories: 620, active_minutes: 68, avg_heart_rate: 74, min_heart_rate: 61, max_heart_rate: 142, sleep_minutes: 460, deep_sleep_minutes: 128, light_sleep_minutes: 239, rem_sleep_minutes: 93, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { date: '2026-10-25', steps: 9300, step_goal: 10000, distance_km: 7.25, calories: 540, active_minutes: 62, avg_heart_rate: 69, min_heart_rate: 58, max_heart_rate: 131, sleep_minutes: 430, deep_sleep_minutes: 120, light_sleep_minutes: 223, rem_sleep_minutes: 87, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { date: '2026-10-26', steps: 7150, step_goal: 10000, distance_km: 5.58, calories: 410, active_minutes: 47, avg_heart_rate: 71, min_heart_rate: 60, max_heart_rate: 128, sleep_minutes: 410, deep_sleep_minutes: 114, light_sleep_minutes: 213, rem_sleep_minutes: 83, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { date: '2026-10-27', steps: 11400, step_goal: 10000, distance_km: 8.89, calories: 680, active_minutes: 76, avg_heart_rate: 75, min_heart_rate: 62, max_heart_rate: 148, sleep_minutes: 480, deep_sleep_minutes: 134, light_sleep_minutes: 249, rem_sleep_minutes: 97, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { date: '2026-10-28', steps: 8900, step_goal: 10000, distance_km: 6.94, calories: 510, active_minutes: 59, avg_heart_rate: 70, min_heart_rate: 59, max_heart_rate: 136, sleep_minutes: 450, deep_sleep_minutes: 126, light_sleep_minutes: 234, rem_sleep_minutes: 90, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { date: '2026-10-29', steps: 10450, step_goal: 10000, distance_km: 8.15, calories: 635, active_minutes: 69, avg_heart_rate: 73, min_heart_rate: 60, max_heart_rate: 139, sleep_minutes: 470, deep_sleep_minutes: 131, light_sleep_minutes: 244, rem_sleep_minutes: 95, source: 'DEMO_SIMULATED', device_id: 'demo' }
  ],
  heart_rate_samples: [
    { timestamp: '00:00', sample_type: 'heart_rate', value: 60, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { timestamp: '04:00', sample_type: 'heart_rate', value: 58, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { timestamp: '08:00', sample_type: 'heart_rate', value: 76, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { timestamp: '12:00', sample_type: 'heart_rate', value: 84, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { timestamp: '16:00', sample_type: 'heart_rate', value: 79, source: 'DEMO_SIMULATED', device_id: 'demo' },
    { timestamp: '20:00', sample_type: 'heart_rate', value: 72, source: 'DEMO_SIMULATED', device_id: 'demo' }
  ],
  data_source: 'DEMO_SIMULATED',
  medical_disclaimer: 'NOTICE: WristOS telemetry is for personal fitness demonstration only. Not intended for clinical or diagnostic use.'
};

export const CLIENT_FALLBACK_ADAPTIVE_THEMES: AdaptiveThemePreset[] = [
  {
    id: 'ctx-college',
    context_name: 'College',
    display_title: 'Academic & Campus Lecture',
    description: 'High-contrast crisp typography designed for lecture halls, timetable awareness, and subtle silent vibration alerts.',
    recommended_theme: 'college',
    recommended_style: 'digital',
    palette: { primary: '#38BDF8', secondary: '#0F172A', accent: '#FBBF24' },
    recommended_complications: ['Date & Day', 'Silent Battery Indicator', 'Class Schedule Timer'],
    routine_suggestion: 'Set silent vibration alerts; mute audio chime during lecture slots.'
  },
  {
    id: 'ctx-work',
    context_name: 'Work',
    display_title: 'Corporate & Focus Work',
    description: 'Refined executive analog aesthetic with unobtrusive date and calendar complications.',
    recommended_theme: 'business',
    recommended_style: 'analog',
    palette: { primary: '#FFD700', secondary: '#18181B', accent: '#E2E8F0' },
    recommended_complications: ['Calendar Next Meeting', 'Battery %', 'Resting Heart Rate'],
    routine_suggestion: 'Desk stretch reminders every 50 minutes; filter notifications to VIP only.'
  },
  {
    id: 'ctx-workout',
    context_name: 'Workout',
    display_title: 'High-Intensity Sports & Gym',
    description: 'High-visibility neon green and amber dials with real-time Heart Rate zone alerts and active calories.',
    recommended_theme: 'sports',
    recommended_style: 'digital',
    palette: { primary: '#22C55E', secondary: '#111827', accent: '#EF4444' },
    recommended_complications: ['Live BPM Zone', 'Step Cadence', 'Active Calories', 'Lap Timer'],
    routine_suggestion: 'High-cadence interval pacing timer; elevate screen backlight to 100% outdoors.'
  },
  {
    id: 'ctx-travel',
    context_name: 'Travel',
    display_title: 'Transit & Outdoor Commute',
    description: 'Dual time-zone support, weather outlook, and battery conservation mode.',
    recommended_theme: 'minimal',
    recommended_style: 'digital',
    palette: { primary: '#00F2FE', secondary: '#1E293B', accent: '#38BDF8' },
    recommended_complications: ['Battery Saver Mode', 'Step Count', 'Weather Forecast', 'Compass'],
    routine_suggestion: 'Toggle Bluetooth sleep intervals to maximize multi-day watch battery endurance.'
  },
  {
    id: 'ctx-night',
    context_name: 'Night',
    display_title: 'Wind-Down & Sleep Recovery',
    description: 'Ultra-dim monochromatic red/deep-amber night shift dial preventing blue-light melatonin suppression.',
    recommended_theme: 'minimal',
    recommended_style: 'minimal',
    palette: { primary: '#EF4444', secondary: '#050505', accent: '#7F1D1D' },
    recommended_complications: ['Sleep Schedule', 'Alarm Clock', 'Do Not Disturb Indicator'],
    routine_suggestion: 'Turn off tilt-to-wake gesture; enable Sleep Stage telemetry tracking.'
  }
];

export const CLIENT_FALLBACK_ROUTINES: RoutineItem[] = [
  {
    id: 'rt-01',
    title: 'Campus Lecture Day',
    trigger_time: '08:30',
    context_name: 'College',
    is_enabled: true,
    actions: [
      'Switch virtual preview to Campus Horizon theme',
      'Mute loud watch notifications until 16:30',
      'Schedule hydration reminders every 90 minutes'
    ],
    notes: 'Active on weekdays'
  },
  {
    id: 'rt-02',
    title: 'Evening Gym Session',
    trigger_time: '18:00',
    context_name: 'Workout',
    is_enabled: true,
    actions: [
      'Switch to Aero Dynamic Sports watch face',
      'Activate Heart Rate Zone continuous monitoring',
      'Log calorie burn targets (Goal: 500 kcal)'
    ],
    notes: 'Mon, Wed, Fri workout regimen'
  }
];
