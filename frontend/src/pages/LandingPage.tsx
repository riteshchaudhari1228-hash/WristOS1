import React, { useState } from 'react';
import {
  Watch, ShieldCheck, Cpu, Sparkles, Activity, Radio, ArrowRight,
  ChevronRight, CheckCircle2, AlertTriangle, Layers, Smartphone, Terminal, Zap, Palette,
  Bluetooth, Heart, Footprints, Flame, Moon, Volume2, PhoneCall, Bot
} from 'lucide-react';
import { DeviceModelInfo, WatchFaceDesign } from '../types';
import { SmartwatchProductImage } from '../components/SmartwatchProductImage';

interface Props {
  onNavigate: (page: string) => void;
  devices: DeviceModelInfo[];
  activeDesign: WatchFaceDesign;
  onSelectDesign: (design: WatchFaceDesign) => void;
}

export const LandingPage: React.FC<Props> = ({
  onNavigate,
  devices,
  activeDesign,
  onSelectDesign
}) => {
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Noise' | 'boAt' | 'Fire-Boltt'>('All');
  const [previewStyle, setPreviewStyle] = useState<'digital' | 'analog'>('digital');

  const filteredDevices = selectedBrand === 'All'
    ? devices.slice(0, 6)
    : devices.filter(d => d.brand.toLowerCase() === selectedBrand.toLowerCase()).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-red-600 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-zinc-800/80">
        {/* Subtle Ambient Red Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-red-600/15 via-rose-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-red-500/10 blur-[110px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Branding & Hook */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unified Wearable Connectivity Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Real Smartwatch <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-red-600">
                  Connectivity & Control
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                Engineered for Indian smartwatches: <strong className="text-white">Noise</strong>, <strong className="text-white">boAt</strong>, and <strong className="text-white">Fire-Boltt</strong>.
                Connect directly via Web Bluetooth, design pixel-perfect watch faces, and monitor real-time activity telemetry with honest hardware compatibility.
              </p>

              {/* 3 Operational Modes Pill Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Demo Mode
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Simulate hardware telemetry and test all studio features without a physical watch.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Connected Mode
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Direct Web Bluetooth GATT readouts for battery, heart rate notifications & buzzer.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Transparent Protocols
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Explicitly documents proprietary RTOS boundaries without fake APIs or claims.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => onNavigate('connect')}
                  className="px-7 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-red-600/30 hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Bluetooth className="w-4 h-4" />
                  <span>Connect Your Watch</span>
                </button>
                <button
                  onClick={() => onNavigate('smartwatches')}
                  className="px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Watch className="w-4 h-4 text-red-400" />
                  <span>Explore Smartwatches</span>
                </button>
                <button
                  onClick={() => onNavigate('watchfaces')}
                  className="px-5 py-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-mono text-xs border border-zinc-800 transition-all cursor-pointer"
                >
                  Watch Face Studio &rarr;
                </button>
              </div>
            </div>

            {/* Right: Large Smartwatch Product Hero Visual */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative p-8 rounded-3xl bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-zinc-800/80 shadow-2xl flex flex-col items-center">
                <div className="text-center mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-semibold">
                    Interactive Hardware Visual
                  </span>
                  <p className="text-xs text-zinc-400 mt-0.5">Ticking real-time clock & complication dials</p>
                </div>

                {/* Hero Smartwatch Visual */}
                <SmartwatchProductImage
                  shape="square"
                  brand="Noise"
                  modelName="ColorFit Pro 4"
                  size="hero"
                  accentColor="#ef4444"
                />

                <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>356 × 400 AMOLED</span>
                  <button
                    onClick={() => onNavigate('watchfaces')}
                    className="text-red-400 hover:underline font-semibold"
                  >
                    Open in Studio &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPATIBLE-DEVICE GALLERY */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 uppercase tracking-wider font-semibold mb-1">
              <Watch className="w-3.5 h-3.5" />
              <span>Target Hardware Gallery</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Compatible Smartwatches
            </h2>
            <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-2xl">
              Audited for Noise, boAt, and Fire-Boltt. Filter by brand or click to connect directly.
            </p>
          </div>

          {/* Brand Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            {(['All', 'Noise', 'boAt', 'Fire-Boltt'] as const).map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedBrand === b
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map(device => (
            <div
              key={device.id}
              className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800/80 hover:border-red-500/40 transition-all group flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 text-[11px] font-mono font-bold text-zinc-300">
                    {device.brand}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                    {device.verification_level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                  {device.model_name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {device.resolution_width} × {device.resolution_height} • {device.shape}
                </p>

                {/* Smartwatch image */}
                <div className="py-4 flex items-center justify-center">
                  <SmartwatchProductImage
                    shape={device.shape}
                    brand={device.brand}
                    modelName={device.model_name}
                    size="md"
                    accentColor="#ef4444"
                  />
                </div>

                {/* Specs */}
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs font-mono space-y-1 mb-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>Chipset:</span>
                    <span className="text-zinc-200">{device.chipset.split('(')[0]}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>App:</span>
                    <span className="text-zinc-200">{device.companion_app.split(':')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => onNavigate('connect')}
                  className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-red-600/20"
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => onNavigate('watchfaces')}
                  className="py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-all cursor-pointer text-center"
                >
                  Design Face
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('smartwatches')}
            className="text-xs font-mono text-red-400 hover:underline font-bold inline-flex items-center gap-1.5"
          >
            <span>View Full 10-Device Specification Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. WATCH-FACE CUSTOMIZATION PREVIEW */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
              <Palette className="w-3.5 h-3.5" />
              <span>Canvas Creation Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Watch Face Studio Preview
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Build bespoke dials in seconds. Upload your personal wallpaper, customize typography, toggle complication widgets, and export pixel-accurate PNGs matching your exact smartwatch screen.
            </p>

            {/* Quick interactive controls */}
            <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <span className="text-xs font-mono text-zinc-400 block font-semibold">Quick Dial Switcher:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPreviewStyle('digital')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewStyle === 'digital' ? 'bg-red-600 text-white' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  Digital AMOLED Layout
                </button>
                <button
                  onClick={() => setPreviewStyle('analog')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    previewStyle === 'analog' ? 'bg-red-600 text-white' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
                  }`}
                >
                  Analog Chronograph
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Resolution: <strong className="text-white">356 × 400 px</strong></span>
                <button
                  onClick={() => onNavigate('watchfaces')}
                  className="text-red-400 hover:underline font-bold"
                >
                  Launch Full Studio &rarr;
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-2xl flex flex-col items-center">
              <SmartwatchProductImage
                shape={previewStyle === 'analog' ? 'round' : 'square'}
                brand="boAt"
                modelName="Lunar Orb"
                size="lg"
                accentColor="#ef4444"
              />
              <span className="mt-4 text-xs font-mono text-zinc-500">
                Interactive Canvas Preview • {previewStyle.toUpperCase()} MODE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALL MANAGER & AI AGENT SPOTLIGHT */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Wearable Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Connected Phone Calls & AI Agent
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Control your watch hardware with natural language voice commands and manage telephone alerts directly through Bluetooth GATT Immediate Alert (0x1802).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: WristPilot AI */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">WristPilot Natural Language AI</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Equipped with Web Speech microphone dictation and voice speech synthesis. Instruct the AI to simulate incoming calls, pulse physical watch vibration motor, generate bespoke dial themes, sync atomic time, or summarize weekly step goals.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">Voice Dictation</span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">GATT Tool Dispatch</span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">Speech Synthesis</span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('ai')}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
              >
                <Bot className="w-4 h-4" />
                <span>Launch WristPilot AI</span>
              </button>
            </div>
          </div>

          {/* Card 2: Phone Call Relay Hub */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 hover:border-red-500/50 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Phone Call Relay & Dial Hub</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Dual audio ringtones (440Hz + 480Hz), tactile DTMF tone keypad, speed dial directory, and instant hardware buzzer dispatch over Bluetooth GATT Alert (0x1802). Test physical incoming call vibrations on your connected boAt, Noise, or Fire-Boltt watch.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">Dual Audio Ring</span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">Tactile DTMF</span>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">Hardware Buzzer</span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('calls')}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-red-400" />
                <span>Open Call Hub</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HEALTH & ACTIVITY CARDS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Biometric Telemetry</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Health & Activity Console
            </h2>
            <p className="text-zinc-400 mt-2 text-sm sm:text-base max-w-2xl">
              Genuine metrics from standard BLE GATT streams and Android Health Connect with transparent data source labels.
            </p>
          </div>

          <button
            onClick={() => onNavigate('health')}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <span>View Full Trends</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Daily Steps</span>
              <Footprints className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">8,420</div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: '84.2%' }} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono">84.2% of 10,000 goal</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Heart Rate</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-black text-white font-mono">74 <span className="text-sm font-normal text-zinc-400">BPM</span></div>
            <p className="text-[10px] text-emerald-400 mt-3 font-mono">Resting: 62 BPM • Peak: 134</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Active Energy</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-white font-mono">485 <span className="text-sm font-normal text-zinc-400">kcal</span></div>
            <p className="text-[10px] text-zinc-500 mt-3 font-mono">52 active minutes logged</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Sleep Architecture</span>
              <Moon className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">7.4 <span className="text-sm font-normal text-zinc-400">hrs</span></div>
            <p className="text-[10px] text-indigo-300 mt-3 font-mono">2.1h Deep • 1.4h REM</p>
          </div>
        </div>
      </section>

      {/* 5. FIND MY WATCH SECTION */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/80">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-zinc-900/80 via-zinc-900/40 to-zinc-950 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold">
              <Radio className="w-3.5 h-3.5" />
              <span>Proximity Radar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Misplaced Your Smartwatch?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Track nearby BLE signals using real-time RSSI signal calculation and trigger the physical hardware buzzer on watches supporting GATT 0x1802.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('find')}
              className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Open Proximity Radar</span>
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-800/80 bg-zinc-950 text-center text-xs text-zinc-500 space-y-2">
        <p className="font-mono text-zinc-400">
          WRISTOS • Premium Smartwatch Companion & Control Platform
        </p>
        <p className="max-w-2xl mx-auto text-[11px] text-zinc-600">
          Noise, boAt, and Fire-Boltt are registered trademarks of their respective owners. WristOS is an independent open engineering project and is not affiliated with or endorsed by Nexxbase (Noise), Imagine Marketing (boAt), or Savex Technologies (Fire-Boltt).
        </p>
      </footer>
    </div>
  );
};
