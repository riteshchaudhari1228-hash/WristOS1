import React from 'react';
import {
  Watch, Battery, Wifi, Activity, Footprints, Flame, Heart, Moon,
  Radio, Palette, Bot, Sparkles, RefreshCw, AlertCircle, ArrowUpRight, Zap
} from 'lucide-react';
import { VirtualWatchPreview } from '../components/VirtualWatchPreview';
import { DeviceModelInfo, WatchFaceDesign, ConnectionMode, TodayHealthMetrics } from '../types';

interface Props {
  onNavigate: (page: string) => void;
  activeDevice: DeviceModelInfo | null;
  activeDesign: WatchFaceDesign;
  connectionMode: ConnectionMode;
  todayHealth: TodayHealthMetrics;
  onRefreshHealth: () => void;
}

export const DashboardPage: React.FC<Props> = ({
  onNavigate,
  activeDevice,
  activeDesign,
  connectionMode,
  todayHealth,
  onRefreshHealth
}) => {
  const isDemo = connectionMode === 'DEMO_SIMULATED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER: DEVICE TELEMETRY BANNER */}
      <div className="p-6 rounded-3xl glass-panel border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Watch Identity */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/80 p-1 flex items-center justify-center shadow-xl">
              <Watch className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">
                  {activeDevice?.model_name || 'boAt Wave Call 2'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-bold">
                  {activeDevice?.brand || 'boAt'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                CHIPSET: {activeDevice?.chipset || 'Realtek RTL8762D'} • RES: {activeDevice?.resolution_width || 240}x{activeDevice?.resolution_height || 284} px ({activeDevice?.shape || 'square'})
              </p>
            </div>
          </div>

          {/* Connection & Telemetry Stats */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Pill */}
            <div className="p-3 px-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isDemo ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <div>
                <p className="text-[10px] font-mono uppercase text-zinc-500">Connection Mode</p>
                <p className={`text-xs font-bold ${isDemo ? 'text-amber-300' : 'text-emerald-300'}`}>
                  {isDemo ? 'DEMO SIMULATED' : 'BLE GATT CONNECTED'}
                </p>
              </div>
            </div>

            {/* Battery Pill */}
            <div className="p-3 px-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Battery className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-zinc-500">Battery Level</p>
                <p className="text-xs font-bold text-white font-mono">{todayHealth.battery_level}% (4.2 Days)</p>
              </div>
            </div>

            {/* Signal RSSI */}
            <div className="p-3 px-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-zinc-500">Signal RSSI</p>
                <p className="text-xs font-bold text-white font-mono">-64 dBm (Near)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigate('find')}
          className="p-4 rounded-2xl glass-panel-subtle border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Find My Watch</p>
              <p className="text-[10px] text-zinc-400">RSSI Radar & Buzzer</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('studio')}
          className="p-4 rounded-2xl glass-panel-subtle border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Watch Face Studio</p>
              <p className="text-[10px] text-zinc-400">Canvas & AI Wallpaper</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('ai')}
          className="p-4 rounded-2xl glass-panel-subtle border border-zinc-800 hover:border-sky-500/50 hover:bg-zinc-900 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">WristPilot AI</p>
              <p className="text-[10px] text-zinc-400">Natural Voice Assistant</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-sky-400 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('automations')}
          className="p-4 rounded-2xl glass-panel-subtle border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900 transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Adaptive Contexts</p>
              <p className="text-[10px] text-zinc-400">College • Work • Gym</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 transition-colors" />
        </button>
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Virtual Smartwatch Telemetry Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full p-6 rounded-3xl glass-panel border border-zinc-800 shadow-xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-zinc-300">LIVE VIRTUAL MIRROR</span>
              </div>
              <button
                onClick={() => onNavigate('studio')}
                className="text-[11px] font-semibold text-cyan-400 hover:underline"
              >
                Change Face
              </button>
            </div>

            <VirtualWatchPreview
              design={activeDesign}
              device={activeDevice}
              batteryLevel={todayHealth.battery_level}
              heartRate={todayHealth.heart_rate_current}
              steps={todayHealth.steps}
              modeLabel={isDemo ? 'DEMO SIMULATED' : 'LIVE GATT'}
              scale={1}
            />

            <div className="w-full mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono">Face: {activeDesign.name}</span>
              <span className="font-mono">{activeDesign.style.toUpperCase()} • {activeDesign.resolution_width}x{activeDesign.resolution_height}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Health Telemetry & Diagnostics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Health Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Steps Card */}
            <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Today's Steps</span>
                <Footprints className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{todayHealth.steps.toLocaleString()}</span>
                <span className="text-xs text-zinc-500 font-mono">/ {todayHealth.step_goal.toLocaleString()}</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(todayHealth.step_percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                <span>{todayHealth.step_percentage}% Goal</span>
                <span>{todayHealth.distance_km} km</span>
              </div>
            </div>

            {/* Heart Rate Card */}
            <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Heart Rate (BPM)</span>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{todayHealth.heart_rate_current}</span>
                <span className="text-xs text-rose-400 font-mono">BPM LIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
                <span>Resting: {todayHealth.heart_rate_resting} BPM</span>
                <span>Peak: {todayHealth.heart_rate_max} BPM</span>
              </div>
            </div>

            {/* Calories Burned */}
            <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Calories</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{todayHealth.calories}</span>
                <span className="text-xs text-zinc-500 font-mono">/ {todayHealth.calorie_goal} kcal</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full"
                  style={{ width: `${(todayHealth.calories / todayHealth.calorie_goal) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 font-mono">{todayHealth.active_minutes} Active Minutes</p>
            </div>

            {/* Sleep Summary */}
            <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sleep Recovery</span>
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">{todayHealth.sleep_total_hours}</span>
                <span className="text-xs text-indigo-400 font-mono">Hours Total</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
                <span>Deep Sleep: {todayHealth.sleep_deep_hours}h</span>
                <span>Quality: Optimal (88%)</span>
              </div>
            </div>
          </div>

          {/* Connection Event Logs */}
          <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-zinc-300">SYSTEM EVENT LOG & PROVENANCE</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
                {todayHealth.data_source_badge}
              </span>
            </div>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span>[08:14:02] BLE GATT Handshake Service (0x180F Battery)</span>
                <span className="text-emerald-400">SUCCESS</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>[08:14:05] Heart Rate Notifications (0x2902 CCCD registered)</span>
                <span className="text-emerald-400">STREAMING</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>[08:20:11] Health Connect Background Sync Bridge</span>
                <span className="text-cyan-400">COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <p className="text-[11px] text-zinc-400 leading-normal italic px-2">
            {todayHealth.medical_disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
