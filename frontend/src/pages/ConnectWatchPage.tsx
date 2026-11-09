import React, { useState, useEffect } from 'react';
import {
  Bluetooth, Smartphone, Sparkles, CheckCircle2, AlertTriangle, XCircle,
  HelpCircle, RefreshCw, Radio, ChevronRight, ShieldCheck, ArrowRight, ExternalLink,
  Battery, Activity, Volume2, Unlink
} from 'lucide-react';
import { DeviceModelInfo, ConnectionMode, DeviceCompatibilityReport } from '../types';
import { webBleManager, BleConnectionState, DiscoveredService } from '../services/webBleService';

interface Props {
  devices: DeviceModelInfo[];
  activeDevice: DeviceModelInfo | null;
  connectionMode: ConnectionMode;
  onSelectDevice: (device: DeviceModelInfo, mode: ConnectionMode) => void;
  compatibilityReport: DeviceCompatibilityReport | null;
}

export const ConnectWatchPage: React.FC<Props> = ({
  devices,
  activeDevice,
  connectionMode,
  onSelectDevice,
  compatibilityReport
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>(activeDevice?.brand || 'Noise');
  const [selectedModelId, setSelectedModelId] = useState<string>(activeDevice?.id || 'noise-colorfit-pro-4');
  const [selectedTab, setSelectedTab] = useState<'web_ble' | 'matrix' | 'android_bridge' | 'demo'>('web_ble');

  // Real Web Bluetooth Manager state
  const [bleState, setBleState] = useState<BleConnectionState>(webBleManager.getState());
  const [acceptAllDevices, setAcceptAllDevices] = useState(true);
  const [customPrefix, setCustomPrefix] = useState('');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = webBleManager.subscribe((state) => {
      setBleState(state);
      if (state.isConnected) {
        // Auto-match connected device from hardware name if possible
        if (state.deviceName) {
          const matched = devices.find(d =>
            state.deviceName!.toLowerCase().includes(d.model_name.toLowerCase()) ||
            d.model_name.toLowerCase().includes(state.deviceName!.toLowerCase()) ||
            state.deviceName!.toLowerCase().includes(d.brand.toLowerCase())
          );
          if (matched) {
            setSelectedModelId(matched.id);
            setSelectedBrand(matched.brand);
            onSelectDevice(matched, 'CONNECTED_BLE');
            return;
          }
        }
        if (currentDevice) {
          onSelectDevice(currentDevice, 'CONNECTED_BLE');
        }
      }
    });
    return unsubscribe;
  }, [selectedModelId]);

  const currentDevice = devices.find(d => d.id === selectedModelId) || devices[0];

  const handleWebBluetoothConnect = async () => {
    const success = await webBleManager.connect({
      acceptAllDevices,
      filterPrefix: customPrefix.trim() || undefined,
      targetBrand: currentDevice.brand,
    });

    if (success) {
      const state = webBleManager.getState();
      if (state.deviceName) {
        const matched = devices.find(d =>
          state.deviceName!.toLowerCase().includes(d.model_name.toLowerCase()) ||
          d.model_name.toLowerCase().includes(state.deviceName!.toLowerCase()) ||
          state.deviceName!.toLowerCase().includes(d.brand.toLowerCase())
        );
        if (matched) {
          setSelectedModelId(matched.id);
          setSelectedBrand(matched.brand);
          onSelectDevice(matched, 'CONNECTED_BLE');
          return;
        }
      }
      onSelectDevice(currentDevice, 'CONNECTED_BLE');
    }
  };

  const handleDisconnect = async () => {
    await webBleManager.disconnect();
    onSelectDevice(currentDevice, 'DEMO_SIMULATED');
  };

  const handleTriggerBuzzerTest = async () => {
    await webBleManager.triggerImmediateAlert(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-2">
            <Bluetooth className="w-3.5 h-3.5" />
            <span>Hardware Connectivity Engine</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Connect Your Smartwatch</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Pairs directly with physical smartwatches using the Web Bluetooth API.
            Discovers real GATT services, reads live battery levels, and streams heart rate telemetry without mockups.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
          <button
            onClick={() => setSelectedTab('web_ble')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              selectedTab === 'web_ble' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Web Bluetooth
          </button>
          <button
            onClick={() => setSelectedTab('matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              selectedTab === 'matrix' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Model Dossier
          </button>
          <button
            onClick={() => setSelectedTab('android_bridge')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              selectedTab === 'android_bridge' ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Android Bridge
          </button>
          <button
            onClick={() => setSelectedTab('demo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              selectedTab === 'demo' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Demo Mode
          </button>
        </div>
      </div>

      {/* MODEL SELECTION & CONNECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Brand & Model Selection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>1. Target Smartwatch Model</span>
              <span className="text-red-400">{selectedBrand}</span>
            </h3>

            {/* Brand Switcher */}
            <div className="grid grid-cols-3 gap-2">
              {['Noise', 'boAt', 'Fire-Boltt'].map(brand => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    const first = devices.find(d => d.brand.toLowerCase() === brand.toLowerCase());
                    if (first) setSelectedModelId(first.id);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Model List in selected brand */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-mono text-zinc-400 block">Select Specific Hardware:</label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {devices
                  .filter(d => d.brand.toLowerCase() === selectedBrand.toLowerCase())
                  .map(device => (
                    <button
                      key={device.id}
                      onClick={() => setSelectedModelId(device.id)}
                      className={`w-full p-3 rounded-2xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedModelId === device.id
                          ? 'bg-zinc-800/90 border border-red-500/50 text-white shadow-sm'
                          : 'bg-zinc-950/60 border border-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                      }`}
                    >
                      <div>
                        <strong className="text-zinc-200 block">{device.model_name}</strong>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {device.resolution_width}x{device.resolution_height} • {device.shape}
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${selectedModelId === device.id ? 'text-red-400' : 'text-zinc-600'}`} />
                    </button>
                  ))}
              </div>
            </div>

            {/* Selected Device Spec Overview */}
            <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Chipset:</span>
                <span className="font-mono text-zinc-200">{currentDevice.chipset}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Official Companion:</span>
                <span className="text-zinc-200 font-semibold">{currentDevice.companion_app}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>BLE Name Prefix:</span>
                <span className="font-mono text-red-400 font-semibold">{currentDevice.ble_name_prefix}</span>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
            <span className="font-bold text-zinc-300 block flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Honest Architecture Guarantee
            </span>
            <p className="leading-relaxed">
              WristOS will never show a fake "Connected" state. When you click Connect, your browser initiates a real Bluetooth Low Energy scan. You must choose your physical smartwatch from the pairing prompt.
            </p>
          </div>
        </div>

        {/* Right: Tab Workspace */}
        <div className="lg:col-span-7">
          {/* TAB 1: WEB BLUETOOTH */}
          {selectedTab === 'web_ble' && (
            <div className="space-y-6">
              {/* Connection Status Card */}
              <div className={`p-6 rounded-3xl border transition-all ${
                bleState.isConnected
                  ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-emerald-500/40 shadow-xl shadow-emerald-500/5'
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        bleState.isConnected ? 'bg-emerald-400 animate-pulse' : bleState.isConnecting ? 'bg-amber-400 animate-ping' : 'bg-zinc-600'
                      }`} />
                      <span className="text-xs font-mono uppercase font-bold text-zinc-400">
                        {bleState.isConnected ? 'HARDWARE CONNECTED' : bleState.isConnecting ? 'SCANNING FOR PERIPHERAL...' : 'NOT CONNECTED'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white">
                      {bleState.isConnected ? bleState.deviceName : 'Direct Web Bluetooth'}
                    </h2>
                  </div>

                  {bleState.isConnected ? (
                    <button
                      onClick={handleDisconnect}
                      className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Unlink className="w-3.5 h-3.5 text-red-400" />
                      <span>Disconnect</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleWebBluetoothConnect}
                      disabled={bleState.isConnecting}
                      className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                    >
                      <Bluetooth className={`w-4 h-4 ${bleState.isConnecting ? 'animate-spin' : ''}`} />
                      <span>{bleState.isConnecting ? 'Opening BLE Scanner...' : 'Connect Watch'}</span>
                    </button>
                  )}
                </div>

                {/* Live Hardware Readouts when Connected */}
                {bleState.isConnected ? (
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800">
                    <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Battery (0x180F)</span>
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-emerald-400" />
                        <span className="text-lg font-black text-white font-mono">
                          {bleState.batteryLevel !== null ? `${bleState.batteryLevel}%` : 'Read on Demand'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Live HR (0x180D)</span>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-400 animate-pulse" />
                        <span className="text-lg font-black text-white font-mono">
                          {bleState.liveHeartRate ? `${bleState.liveHeartRate} BPM` : 'Streaming...'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Alert (0x1802)</span>
                      <button
                        onClick={handleTriggerBuzzerTest}
                        disabled={!bleState.alertSupported}
                        className={`text-xs font-bold font-mono px-2 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                          bleState.alertSupported
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{bleState.alertSupported ? 'Test Ring' : 'N/A in FW'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  // Scanner Options & Pre-Flight Checklist
                  <div className="space-y-4 pt-4 border-t border-zinc-800 text-xs">
                    {/* 3-Step Preparation Checklist */}
                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
                      <span className="text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider block">
                        Quick Connection Checklist (Must Follow):
                      </span>
                      <div className="space-y-1.5 text-zinc-300 text-[11px]">
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">1</span>
                          <span><strong className="text-white">Turn OFF Bluetooth on your phone</strong> (boAt, Noise & Fire-Boltt watches only allow 1 connection at a time; if connected to your phone app, your PC cannot see or pair it).</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">2</span>
                          <span><strong className="text-white">Wake the watch screen</strong> (press the physical side button/crown so the display turns on and starts broadcasting BLE signals).</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">3</span>
                          <span><strong className="text-white">Use Google Chrome or Microsoft Edge</strong> on Windows/Mac (Web Bluetooth is not supported in Safari or Firefox).</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-semibold">Scanning Scope</span>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-medium">
                        <input
                          type="checkbox"
                          checked={acceptAllDevices}
                          onChange={e => setAcceptAllDevices(e.target.checked)}
                          className="rounded border-zinc-700 text-red-600 focus:ring-red-500 w-4 h-4"
                        />
                        <span className="text-red-400 font-semibold">Show All Nearby Bluetooth Devices (Recommended)</span>
                      </label>
                    </div>

                    {!acceptAllDevices && (
                      <div>
                        <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                          Device Name Filter Prefix (Optional):
                        </label>
                        <input
                          type="text"
                          placeholder={`Default: ${currentDevice.ble_name_prefix}`}
                          value={customPrefix}
                          onChange={e => setCustomPrefix(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Error Banner with Retry Helper */}
                {bleState.error && (
                  <div className="mt-4 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="text-white block mb-0.5">Bluetooth Connection Troubleshooting:</strong>
                        {bleState.error}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t border-red-500/20">
                      <button
                        onClick={() => {
                          setAcceptAllDevices(true);
                          setCustomPrefix('');
                          handleWebBluetoothConnect();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-600/30"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry with All Devices Visible</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DISCOVERED GATT SERVICES TREE */}
              {bleState.isConnected && bleState.discoveredServices.length > 0 && (
                <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                  <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
                    <span>Discovered GATT Services ({bleState.discoveredServices.length})</span>
                    <span className="text-xs text-emerald-400">Live Hardware Enumeration</span>
                  </h3>

                  <div className="space-y-2">
                    {bleState.discoveredServices.map(srv => (
                      <div key={srv.uuid} className="rounded-2xl bg-zinc-950 border border-zinc-800/80 overflow-hidden">
                        <button
                          onClick={() => setExpandedService(expandedService === srv.uuid ? null : srv.uuid)}
                          className="w-full p-3.5 text-left text-xs flex items-center justify-between hover:bg-zinc-900/40 cursor-pointer"
                        >
                          <div>
                            <strong className="text-zinc-200 block">{srv.name}</strong>
                            <span className="text-[10px] font-mono text-zinc-500">{srv.uuid}</span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900">
                            {srv.characteristics.length} chars
                          </span>
                        </button>

                        {expandedService === srv.uuid && (
                          <div className="p-3 bg-zinc-900/40 border-t border-zinc-800/60 space-y-2">
                            {srv.characteristics.map(char => (
                              <div key={char.uuid} className="p-2.5 rounded-xl bg-zinc-950 text-xs flex items-center justify-between">
                                <div>
                                  <span className="text-zinc-300 font-semibold block">{char.name}</span>
                                  <span className="text-[9px] font-mono text-zinc-500">{char.uuid}</span>
                                </div>
                                <div className="flex gap-1 text-[9px] font-mono">
                                  {char.properties.read && <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">READ</span>}
                                  {char.properties.write && <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">WRITE</span>}
                                  {char.properties.notify && <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30">NOTIFY</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODEL DOSSIER */}
          {selectedTab === 'matrix' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div>
                <span className="text-xs font-mono text-red-400 uppercase font-semibold">Engineering Dossier</span>
                <h3 className="text-xl font-bold text-white mt-1">{currentDevice.model_name} Specification</h3>
                <p className="text-xs text-zinc-400 mt-1">Detailed hardware analysis, verified GATT boundaries, and companion app workflows.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Screen Shape & Res</span>
                  <strong className="text-zinc-200 text-sm">
                    {currentDevice.resolution_width} × {currentDevice.resolution_height} ({currentDevice.shape})
                  </strong>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">Microcontroller Platform</span>
                  <strong className="text-zinc-200 text-sm">{currentDevice.chipset}</strong>
                </div>
              </div>

              {/* Protocol Transparency */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                <span className="font-bold text-zinc-200 block">Protocol Analysis:</span>
                <p className="text-zinc-400 leading-relaxed">{currentDevice.limitations_notes}</p>
              </div>

              {/* Companion App Steps */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400 uppercase block font-semibold">
                  Official Watch Face Transfer Procedure:
                </span>
                <div className="space-y-1.5 text-xs text-zinc-300">
                  {currentDevice.app_guide_steps.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID BRIDGE */}
          {selectedTab === 'android_bridge' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-red-400 uppercase font-semibold">Android Companion</span>
                  <h3 className="text-xl font-bold text-white mt-1">Kotlin Jetpack Compose Bridge</h3>
                </div>
                <Smartphone className="w-8 h-8 text-red-500" />
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                For devices that encapsulate health data inside companion apps, WristOS provides a native Android app in <code className="text-red-400">/android</code> that reads step and sleep records from <strong className="text-zinc-200">Android 14+ Health Connect</strong> and synchronizes them to this web dashboard.
              </p>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Android Package:</span>
                  <span className="text-zinc-300">{currentDevice.companion_package}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pairing Code:</span>
                  <span className="text-red-400 font-bold">WRIST-7824</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sync Endpoint:</span>
                  <span className="text-zinc-300">/api/sync/telemetry</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                <span className="font-bold text-white block">How to Build & Run:</span>
                <p>1. Open <code className="text-zinc-300">wristos/android</code> in Android Studio Hedgehog / Iguana.</p>
                <p>2. Deploy to your physical Android phone (API 34+ recommended).</p>
                <p>3. Tap "Sync Health Connect Records" to bridge steps directly to this web dashboard.</p>
              </div>
            </div>
          )}

          {/* TAB 4: DEMO MODE */}
          {selectedTab === 'demo' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-amber-500/30 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-400 uppercase font-semibold">Simulation Engine</span>
                  <h3 className="text-xl font-bold text-white mt-1">Virtual Smartwatch Demo</h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-500/40">
                  DEMO ACTIVE
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                If you do not have physical hardware nearby, Demo Mode allows you to experience all dashboard analytics, canvas watch face creation, and proximity radar tools.
              </p>

              <button
                onClick={() => onSelectDevice(currentDevice, 'DEMO_SIMULATED')}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Set Active as {currentDevice.model_name} (Demo Mode)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
