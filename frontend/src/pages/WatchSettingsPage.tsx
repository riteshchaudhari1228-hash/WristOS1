import React, { useState, useEffect } from 'react';
import {
  Sliders, Sun, Clock, Vibrate, Bell, Heart, Footprints, ShieldCheck,
  RefreshCw, CheckCircle2, AlertTriangle, Smartphone, Volume2, Moon,
  Eye, Droplets, Battery, Sparkles, Save, RotateCcw, Flame, Terminal,
  Bluetooth, ArrowRight, Info, Radio
} from 'lucide-react';
import { DeviceModelInfo, ConnectionMode } from '../types';
import { webBleManager, BlePacketLog, BleConnectionState } from '../services/webBleService';

interface Props {
  activeDevice: DeviceModelInfo | null;
  connectionMode: ConnectionMode;
  batteryLevel?: number;
}

export interface WatchSettingsState {
  brightness: number; // 20 - 100
  screenTimeout: number; // 5, 10, 15, 30, 0 (always on)
  wristWake: boolean;
  timeFormat: '12h' | '24h';
  dndMode: boolean;
  vibrationStrength: 'off' | 'low' | 'medium' | 'strong';
  heartRateInterval: 'realtime' | '5min' | '10min' | 'manual';
  stepGoal: number;
  sedentaryReminder: boolean;
  waterReminder: boolean;
  callAlerts: boolean;
  appNotifications: boolean;
  tempUnit: 'celsius' | 'fahrenheit';
}

const DEFAULT_SETTINGS: WatchSettingsState = {
  brightness: 80,
  screenTimeout: 15,
  wristWake: true,
  timeFormat: '24h',
  dndMode: false,
  vibrationStrength: 'strong',
  heartRateInterval: '5min',
  stepGoal: 10000,
  sedentaryReminder: true,
  waterReminder: true,
  callAlerts: true,
  appNotifications: true,
  tempUnit: 'celsius',
};

export const WatchSettingsPage: React.FC<Props> = ({
  activeDevice,
  connectionMode,
  batteryLevel = 86
}) => {
  const [bleState, setBleState] = useState<BleConnectionState>(webBleManager.getState());

  useEffect(() => {
    const unsub = webBleManager.subscribe(setBleState);
    return unsub;
  }, []);

  const [settings, setSettings] = useState<WatchSettingsState>(() => {
    try {
      const saved = localStorage.getItem(`wristos_settings_${activeDevice?.id || 'default'}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<'display' | 'time' | 'haptics' | 'health' | 'notifications' | 'packets'>('display');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);
  const [isVibrating, setIsVibrating] = useState(false);
  const [isSyncingTime, setIsSyncingTime] = useState(false);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // Real-time ticking clock (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const updateSetting = <K extends keyof WatchSettingsState>(key: K, value: WatchSettingsState[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(`wristos_settings_${activeDevice?.id || 'default'}`, JSON.stringify(updated));
      } catch {
        // Fallback
      }
      return updated;
    });

    // Attempt BLE write and log hardware protocol behavior
    webBleManager.writeVendorSetting(key, value);
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    if (settings.timeFormat === '12h') {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return {
        formatted: `${hours}:${minutes}`,
        seconds,
        period: ampm,
      };
    }

    return {
      formatted: `${String(hours).padStart(2, '0')}:${minutes}`,
      seconds,
      period: '24H',
    };
  };

  const timeData = formatTime(currentTime);

  const handleSyncTime = async () => {
    setIsSyncingTime(true);
    const result = await webBleManager.writeCurrentTime(new Date());
    setIsSyncingTime(false);

    if (result.success) {
      setSyncFeedback({ type: 'success', message: result.message });
    } else {
      setSyncFeedback({ type: 'warn', message: result.message });
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handleTestVibration = async () => {
    setIsVibrating(true);

    // Play Web Audio buzzer tone
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio fallback
    }

    const res = await webBleManager.triggerImmediateAlert(2);
    setTimeout(() => setIsVibrating(false), 1200);

    if (res.success) {
      setSyncFeedback({ type: 'success', message: res.message });
    } else {
      setSyncFeedback({ type: 'warn', message: res.message });
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const isRound = activeDevice?.shape === 'round';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Hardware Management & Real-Time Mirror</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Watch Settings & Live Display</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Control screen brightness, haptics, clock format, and health tracking intervals with an interactive,
            real-time ticking display mirroring your smartwatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncTime}
            disabled={isSyncingTime}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Clock className={`w-3.5 h-3.5 text-red-400 ${isSyncingTime ? 'animate-spin' : ''}`} />
            <span>Sync Real Time</span>
          </button>

          <button
            onClick={() => setShowExplanationModal(true)}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-red-400 text-xs font-semibold border border-red-500/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Why Don't Settings Change On My Watch?</span>
          </button>
        </div>
      </div>

      {/* HARDWARE CONNECTION STATUS & TRANSPARENCY BANNER */}
      {bleState.isConnected ? (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong>HARDWARE CONNECTED:</strong> Linked to physical device <strong>{bleState.deviceName}</strong>.
              GATT battery readouts and Immediate Alert buzzers are communicating across the Bluetooth radio.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-900/50 px-2 py-0.5 rounded border border-emerald-500/20">
            BLE ACTIVE
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <strong className="text-white block sm:inline">Operating in Virtual Demo Mirror Mode: </strong>
              <span>
                Your physical watch is not currently connected to this browser. The watch mirror below responds to your changes on screen, but to send commands across the air to the watch on your wrist, connect via Web Bluetooth.
              </span>
            </div>
          </div>
          <button
            onClick={() => webBleManager.connect({ targetBrand: activeDevice?.brand })}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-amber-500/20 self-start sm:self-auto"
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>Connect boAt Watch</span>
          </button>
        </div>
      )}

      {/* SYNC FEEDBACK BANNER */}
      {syncFeedback && (
        <div className={`p-4 rounded-2xl text-xs font-mono flex items-center gap-2.5 animate-fadeIn ${
          syncFeedback.type === 'success'
            ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
            : 'bg-zinc-900 border border-amber-500/40 text-amber-200'
        }`}>
          {syncFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{syncFeedback.message}</span>
        </div>
      )}

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LIVE DISPLAY OF THE WATCH (REAL-TIME MIRROR) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full p-8 rounded-3xl bg-zinc-900/70 border border-zinc-800 shadow-2xl flex flex-col items-center sticky top-24">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${bleState.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {bleState.isConnected ? 'Hardware Live Stream' : 'Live Virtual Display'}
              </span>
              <span className="text-xs font-mono text-red-400 font-bold">
                {activeDevice?.resolution_width || 240} × {activeDevice?.resolution_height || 284} px
              </span>
            </div>

            {/* Smartwatch Bezel Housing */}
            <div
              className={`p-5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-4 border-zinc-700 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative transition-all duration-300 ${
                isRound ? 'rounded-full' : 'rounded-[44px]'
              } ${isVibrating ? 'animate-bounce' : ''}`}
              style={{
                boxShadow: `0 0 35px rgba(239, 68, 68, ${settings.brightness / 300})`,
              }}
            >
              {/* Rotary Digital Crown Button on Right */}
              <div
                onClick={handleTestVibration}
                title="Click crown to test haptics / buzzer"
                className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-12 rounded-r-lg bg-zinc-700 border border-zinc-600 border-l-2 border-l-red-500 cursor-pointer hover:brightness-125 transition-all flex items-center justify-center shadow-md"
              >
                <div className="w-1 h-6 rounded bg-zinc-500" />
              </div>

              {/* LIVE OLED SCREEN DISPLAY */}
              <div
                className={`overflow-hidden relative flex flex-col justify-between p-5 transition-opacity duration-300 ${
                  isRound ? 'rounded-full' : 'rounded-[34px]'
                }`}
                style={{
                  width: 270,
                  height: 310,
                  backgroundColor: '#050507',
                  opacity: Math.max(0.35, settings.brightness / 100),
                }}
              >
                {/* Screen Top Status Bar */}
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1">
                  <span className="text-red-400 font-bold tracking-wider">
                    {activeDevice?.brand.toUpperCase() || 'WRISTOS'}
                  </span>
                  <div className="flex items-center gap-2">
                    {settings.dndMode && (
                      <Moon className="w-3 h-3 text-indigo-400" />
                    )}
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Battery className="w-3 h-3" />
                      {bleState.batteryLevel !== null ? `${bleState.batteryLevel}%` : `${batteryLevel}%`}
                    </span>
                  </div>
                </div>

                {/* Central Real-Time Clock Display */}
                <div className="text-center my-auto py-2">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-5xl font-black text-white font-sans tracking-tight">
                      {timeData.formatted}
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">
                      :{timeData.seconds}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 mt-1">
                    <span>
                      {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono">
                      {timeData.period}
                    </span>
                  </div>
                </div>

                {/* Bottom Complications Pod */}
                <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                  {/* Steps */}
                  <div className="p-1 rounded bg-zinc-900/80">
                    <span className="text-zinc-500 block text-[8px]">STEPS</span>
                    <span className="text-white font-bold">8.4k</span>
                  </div>
                  {/* Heart Rate */}
                  <div className="p-1 rounded bg-zinc-900/80 border border-red-500/30">
                    <span className="text-red-400 block text-[8px]">♥ BPM</span>
                    <span className="text-white font-bold">
                      {bleState.liveHeartRate ? bleState.liveHeartRate : 74}
                    </span>
                  </div>
                  {/* Energy */}
                  <div className="p-1 rounded bg-zinc-900/80">
                    <span className="text-amber-400 block text-[8px]">KCAL</span>
                    <span className="text-white font-bold">485</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Indicator Details */}
            <div className="w-full mt-6 pt-4 border-t border-zinc-800/80 space-y-2 text-xs font-mono text-zinc-400">
              <div className="flex justify-between">
                <span>Display Brightness:</span>
                <strong className="text-white">{settings.brightness}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Time Format:</span>
                <strong className="text-white">{settings.timeFormat === '12h' ? '12-Hour AM/PM' : '24-Hour Military'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Silent Mode (DND):</span>
                <strong className={settings.dndMode ? 'text-indigo-400' : 'text-zinc-400'}>
                  {settings.dndMode ? 'ACTIVE' : 'OFF'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Hardware Link:</span>
                <strong className={bleState.isConnected ? 'text-emerald-400' : 'text-amber-400'}>
                  {bleState.isConnected ? 'GATT PERIPHERAL ACTIVE' : 'VIRTUAL DEMO ENGINE'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ALL HARDWARE SETTINGS CONTROLS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Settings Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-semibold overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'display', label: 'Screen & Brightness', icon: Sun },
              { id: 'time', label: 'Time & Format', icon: Clock },
              { id: 'haptics', label: 'Sound & Vibration', icon: Vibrate },
              { id: 'health', label: 'Health Goals', icon: Heart },
              { id: 'notifications', label: 'Alerts', icon: Bell },
              { id: 'packets', label: 'BLE Packet Console', icon: Terminal },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 1. SCREEN & BRIGHTNESS SETTINGS */}
          {activeTab === 'display' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-semibold">Display Controls</span>
                <h3 className="text-xl font-bold text-white mt-1">Screen & Visual Brightness</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Adjust panel luminance. Changes reflect live on the virtual watch mirror.
                </p>
              </div>

              {/* Brightness Slider */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex justify-between text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Display Brightness</span>
                  </span>
                  <span className="font-mono text-red-400 font-bold">{settings.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={settings.brightness}
                  onChange={e => updateSetting('brightness', Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>20% (Dim)</span>
                  <span>60% (Balanced)</span>
                  <span>100% (High Sunburst)</span>
                </div>
              </div>

              {/* Screen Timeout */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <label className="text-xs font-semibold text-zinc-300 block">Screen Timeout Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 30].map(sec => (
                    <button
                      key={sec}
                      onClick={() => updateSetting('screenTimeout', sec)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        settings.screenTimeout === sec
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      {sec} Seconds
                    </button>
                  ))}
                </div>
              </div>

              {/* Wrist Wake Toggle */}
              <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:bg-zinc-900/60 transition-colors">
                <div>
                  <strong className="text-xs font-bold text-white block">Raise to Wake (Wrist Wake)</strong>
                  <span className="text-[11px] text-zinc-500">Automatically turns screen on when wrist rotates upward</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wristWake}
                  onChange={e => updateSetting('wristWake', e.target.checked)}
                  className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4"
                />
              </label>

              {/* Why physical watch doesn't dim note */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <strong className="text-zinc-200 block">Hardware Limitation Note:</strong>
                <p>
                  boAt / Realtek RTOS does not expose display backlight PWM registers over standard Bluetooth SIG GATT.
                  Brightness changes are mirrored live on the virtual display above. To adjust the physical hardware backlight, swipe down on the watch face and tap the Brightness icon.
                </p>
              </div>
            </div>
          )}

          {/* 2. TIME & FORMAT SETTINGS */}
          {activeTab === 'time' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-semibold">Clock Synchronization</span>
                <h3 className="text-xl font-bold text-white mt-1">Real-Time Time Settings</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Synchronize watch time and toggle 12-hour AM/PM vs 24-hour display format.
                </p>
              </div>

              {/* 12h vs 24h Switcher */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">Time Format Representation</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSetting('timeFormat', '12h')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      settings.timeFormat === '12h'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    12-Hour Format (01:23 PM)
                  </button>
                  <button
                    onClick={() => updateSetting('timeFormat', '24h')}
                    className={`py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      settings.timeFormat === '24h'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    24-Hour Military Format (13:23)
                  </button>
                </div>
              </div>

              {/* Atomic Clock Sync */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <strong className="text-xs font-bold text-white block">Atomic PC Time Synchronization</strong>
                  <span className="text-[11px] text-zinc-500">
                    Current time: {timeData.formatted}:{timeData.seconds} {timeData.period} (GATT 0x1805)
                  </span>
                </div>
                <button
                  onClick={handleSyncTime}
                  disabled={isSyncingTime}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTime ? 'animate-spin' : ''}`} />
                  <span>Transmit Time Packet</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. SOUND & VIBRATION (HAPTICS) */}
          {activeTab === 'haptics' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-semibold">Haptics & Audio</span>
                <h3 className="text-xl font-bold text-white mt-1">Vibration Strength & Alerts</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Adjust tactile motor response and trigger immediate alert ringers.
                </p>
              </div>

              {/* Vibration Strength Buttons */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">Vibration Motor Intensity</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['off', 'low', 'medium', 'strong'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => updateSetting('vibrationStrength', level)}
                      className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                        settings.vibrationStrength === level
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Do Not Disturb (DND) */}
              <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer hover:bg-zinc-900/60 transition-colors">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <div>
                    <strong className="text-xs font-bold text-white block">Do Not Disturb (Silent Mode)</strong>
                    <span className="text-[11px] text-zinc-500">Mutes all vibrations and screen-on alerts</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dndMode}
                  onChange={e => updateSetting('dndMode', e.target.checked)}
                  className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4"
                />
              </label>

              {/* Test Vibration Button */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-white block">Test Physical Vibration Motor</strong>
                  <span className="text-[11px] text-zinc-500">Sends Bluetooth GATT Immediate Alert (0x1802)</span>
                </div>
                <button
                  onClick={handleTestVibration}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Vibrate className="w-4 h-4 text-red-400" />
                  <span>Test Vibration</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. HEALTH GOALS & INTERVALS */}
          {activeTab === 'health' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-semibold">Fitness Targets</span>
                <h3 className="text-xl font-bold text-white mt-1">Health & Sensor Frequencies</h3>
                <p className="text-xs text-zinc-400 mt-1">Configure continuous heart rate monitoring and hydration reminders.</p>
              </div>

              {/* Step Goal Selection */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">Daily Step Goal</span>
                <div className="grid grid-cols-4 gap-2">
                  {[6000, 8000, 10000, 12000].map(goal => (
                    <button
                      key={goal}
                      onClick={() => updateSetting('stepGoal', goal)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        settings.stepGoal === goal
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {goal.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Heart Rate Interval */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <span className="text-xs font-semibold text-zinc-300 block">Heart Rate Sensor Frequency</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'realtime', label: 'Continuous' },
                    { id: '5min', label: 'Every 5m' },
                    { id: '10min', label: 'Every 10m' },
                    { id: 'manual', label: 'Manual' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => updateSetting('heartRateInterval', item.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        settings.heartRateInterval === item.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sedentary Reminder */}
              <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <div>
                  <strong className="text-xs font-bold text-white block">Sedentary / Inactivity Warning</strong>
                  <span className="text-[11px] text-zinc-500">Vibrates watch if seated continuously for 60 minutes</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sedentaryReminder}
                  onChange={e => updateSetting('sedentaryReminder', e.target.checked)}
                  className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4"
                />
              </label>

              {/* Hydration Reminder */}
              <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <div>
                  <strong className="text-xs font-bold text-white block">Water Drinking Reminder</strong>
                  <span className="text-[11px] text-zinc-500">Periodic chime nudging you to drink water</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.waterReminder}
                  onChange={e => updateSetting('waterReminder', e.target.checked)}
                  className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4"
                />
              </label>
            </div>
          )}

          {/* 5. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-semibold">Push Telemetry</span>
                <h3 className="text-xl font-bold text-white mt-1">Notification Relays</h3>
              </div>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <div>
                  <strong className="text-xs font-bold text-white block">Incoming Phone Calls</strong>
                  <span className="text-[11px] text-zinc-500">Show caller name and vibrate on wrist</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.callAlerts}
                  onChange={e => updateSetting('callAlerts', e.target.checked)}
                  className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                <div>
                  <strong className="text-xs font-bold text-white block">App & SMS Messages</strong>
                  <span className="text-[11px] text-zinc-500">Display instant preview text on smartwatch display</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.appNotifications}
                  onChange={e => updateSetting('appNotifications', e.target.checked)}
                  className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4"
                />
              </label>
            </div>
          )}

          {/* 6. BLE PACKET CONSOLE (TRANSPARENCY LOGGER) */}
          {activeTab === 'packets' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-red-400 uppercase font-semibold">Radio Traffic Inspector</span>
                  <h3 className="text-xl font-bold text-white mt-1">Live Bluetooth GATT Packet Log</h3>
                </div>
                <Terminal className="w-5 h-5 text-zinc-400" />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900/80 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Service / Char</th>
                      <th className="p-3">Raw Payload</th>
                      <th className="p-3">Hardware Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {bleState.packetLogs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-900/40">
                        <td className="p-3 text-zinc-500">{log.timestamp}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.type === 'TX'
                              ? 'bg-red-950 text-red-400 border border-red-500/30'
                              : log.type === 'RX'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : log.type === 'WARN'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-zinc-200 block">{log.serviceName}</span>
                          <span className="text-[10px] text-zinc-500">{log.characteristicUuid}</span>
                        </td>
                        <td className="p-3 text-red-300 max-w-xs truncate">{log.payloadHex}</td>
                        <td className="p-3 text-[11px] text-zinc-400">{log.hardwareResponse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EXPLANATION MODAL: WHY SETTINGS DON'T MAGICALLY REWRITE YOUR WATCH */}
      {showExplanationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-2xl w-full p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-black text-white">How Smartwatch Hardware Actually Communicates</h3>
              </div>
              <button
                onClick={() => setShowExplanationModal(false)}
                className="text-zinc-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <strong className="text-white text-sm block">1. Why budget smartwatches lock their settings</strong>
                <p className="text-zinc-400">
                  Indian smartwatches (boAt, Noise, Fire-Boltt) run lightweight closed RTOS microcontrollers (Realtek, Goodix, Huntersun). Unlike Android phones or WearOS, they do not expose open web APIs. Settings like Screen Brightness, Watch Faces, and DND are stored in internal EEPROM flash registers protected by vendor-encrypted binary protocols (e.g. boAt Crest's KaHa protocol).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <strong className="text-white text-sm block">2. What CAN be communicated over direct Web Bluetooth:</strong>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                  <li><strong className="text-zinc-200">GATT Battery Service (0x180F):</strong> WristOS reads your exact physical battery percentage in real time.</li>
                  <li><strong className="text-zinc-200">GATT Heart Rate (0x180D):</strong> Live BPM sensor notifications stream to your browser.</li>
                  <li><strong className="text-zinc-200">GATT Immediate Alert (0x1802):</strong> The buzzer ring command can physically vibrate the watch on supported firmware.</li>
                  <li><strong className="text-zinc-200">Current Time (0x1805 / 0x2A2B):</strong> Atomic clock time packets are transmitted to sync the clock.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <strong className="text-white text-sm block">3. How Watch Face and Display changes work legitimately:</strong>
                <p className="text-zinc-400">
                  WristOS exports exact pixel-matched wallpapers (e.g. 240x284 for boAt Wave Call 2). You then open the official boAt Crest app &gt; DIY Face &gt; Apply. Any website claiming it can secretly overwrite your boAt watch's firmware without the official app signature is deceptive and would risk bricking the watch.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowExplanationModal(false)}
              className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-red-600/30"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
