export type DeviceBrand = 'Noise' | 'boAt' | 'Fire-Boltt' | 'Generic';
export type ConnectionMode = 'DEMO_SIMULATED' | 'CONNECTED_BLE' | 'CONNECTED_COMPANION' | 'UNSUPPORTED_PROPRIETARY';

export interface DeviceModelInfo {
  id: string;
  brand: string;
  model_name: string;
  shape: 'square' | 'round' | 'rect';
  resolution_width: number;
  resolution_height: number;
  screen_type: string;
  screen_size: string;
  companion_app: string;
  companion_package: string;
  chipset: string;
  ble_name_prefix: string;
  supported_services: string[];
  has_standard_heart_rate: boolean;
  has_standard_battery: boolean;
  has_immediate_alert: boolean;
  custom_wallpaper_export: boolean;
  direct_ota_watchface: boolean;
  verification_level: 'VERIFIED_GATT' | 'PARTIAL_HYBRID' | 'UNSUPPORTED_PROPRIETARY';
  limitations_notes: string;
  app_guide_steps: string[];
}

export interface DeviceCompatibilityReport {
  device_id: string;
  brand: string;
  model_name: string;
  verification_level: string;
  is_fully_supported: boolean;
  supported_features: string[];
  unsupported_features: string[];
  companion_app: string;
  chipset_notes: string;
  wallpaper_resolution: string;
  wallpaper_workflow: string;
  ble_gatt_status: string;
  guide_steps: string[];
}

export interface ConnectedDeviceSession {
  id: string;
  device_model_id: string;
  device_name: string;
  mac_address: string;
  connection_mode: ConnectionMode;
  is_connected: boolean;
  battery_level: number;
  last_heart_rate: number;
  rssi: number;
  firmware_version: string;
  connected_at: string;
  last_synced_at: string;
}

export interface WatchFaceDesign {
  id: string;
  name: string;
  theme: 'college' | 'sports' | 'minimal' | 'gaming' | 'cyberpunk' | 'business' | 'neon';
  style: 'digital' | 'analog' | 'hybrid';
  target_model_id: string;
  resolution_width: number;
  resolution_height: number;
  clock_font: string;
  clock_position: 'top' | 'center' | 'bottom';
  time_format: '12h' | '24h';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_type: 'ai_art' | 'gradient' | 'pattern' | 'solid' | 'upload';
  background_prompt: string;
  background_image_data?: string | null;
  show_seconds: boolean;
  show_date: boolean;
  show_steps: boolean;
  show_heart_rate: boolean;
  show_battery: boolean;
  show_calories: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivitySummaryItem {
  date: string;
  steps: number;
  step_goal: number;
  distance_km: number;
  calories: number;
  active_minutes: number;
  avg_heart_rate: number;
  min_heart_rate: number;
  max_heart_rate: number;
  sleep_minutes: number;
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  source: string;
  device_id: string;
}

export interface HealthSampleItem {
  timestamp: string;
  sample_type: string;
  value: number;
  source: string;
  device_id: string;
}

export interface TodayHealthMetrics {
  date: string;
  steps: number;
  step_goal: number;
  step_percentage: number;
  distance_km: number;
  calories: number;
  calorie_goal: number;
  active_minutes: number;
  heart_rate_current: number;
  heart_rate_resting: number;
  heart_rate_max: number;
  sleep_total_hours: number;
  sleep_deep_hours: number;
  battery_level: number;
  data_source_badge: string;
  medical_disclaimer: string;
}

export interface AnalyticsOverview {
  period: string;
  total_steps: number;
  avg_daily_steps: number;
  total_calories: number;
  avg_sleep_hours: number;
  avg_heart_rate: number;
  daily_history: ActivitySummaryItem[];
  heart_rate_samples: HealthSampleItem[];
  data_source: string;
  medical_disclaimer: string;
}

export interface WristPilotAction {
  tool_name: string;
  target_page?: string;
  parameters: Record<string, any>;
  confirmation_required: boolean;
  is_supported: boolean;
  hardware_dependent: boolean;
}

export interface WristPilotResponse {
  query: string;
  intent: string;
  reply_message: string;
  action?: WristPilotAction | null;
  action_result?: Record<string, any> | null;
  compatibility_note?: string | null;
  suggested_quick_prompts: string[];
}

export interface AdaptiveThemePreset {
  id: string;
  context_name: string;
  display_title: string;
  description: string;
  recommended_theme: string;
  recommended_style: string;
  palette: Record<string, string>;
  recommended_complications: string[];
  routine_suggestion: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  trigger_time: string;
  context_name: string;
  is_enabled: boolean;
  actions: string[];
  notes?: string;
}
