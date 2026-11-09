import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DemoModeBanner } from './components/DemoModeBanner';
import { LandingPage } from './pages/LandingPage';
import { SmartwatchesPage } from './pages/SmartwatchesPage';
import { ConnectWatchPage } from './pages/ConnectWatchPage';
import { WatchFaceStudioPage } from './pages/WatchFaceStudioPage';
import { FindMyWatchPage } from './pages/FindMyWatchPage';
import { HealthActivityPage } from './pages/HealthActivityPage';
import { SupportPage } from './pages/SupportPage';
import { WatchSettingsPage } from './pages/WatchSettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AIPilotPage } from './pages/AIPilotPage';
import { AutomationsPage } from './pages/AutomationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CallHubPage } from './pages/CallHubPage';
import { Bot, PhoneCall, Sparkles } from 'lucide-react';
import {
  DeviceModelInfo, ConnectionMode, WatchFaceDesign,
  TodayHealthMetrics, DeviceCompatibilityReport
} from './types';
import {
  api, CLIENT_FALLBACK_DEVICES, CLIENT_FALLBACK_WATCHFACES
} from './services/api';
import { webBleManager } from './services/webBleService';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [devices, setDevices] = useState<DeviceModelInfo[]>(CLIENT_FALLBACK_DEVICES);
  const [activeDevice, setActiveDevice] = useState<DeviceModelInfo>(CLIENT_FALLBACK_DEVICES[0]);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('DEMO_SIMULATED');
  const [activeDesign, setActiveDesign] = useState<WatchFaceDesign>(CLIENT_FALLBACK_WATCHFACES[0]);
  const [savedDesigns, setSavedDesigns] = useState<WatchFaceDesign[]>(CLIENT_FALLBACK_WATCHFACES);
  const [compatibilityReport, setCompatibilityReport] = useState<DeviceCompatibilityReport | null>(null);
  const [incomingCallTrigger, setIncomingCallTrigger] = useState<{ name: string; number: string; timestamp: number } | null>(null);

  const [todayHealth, setTodayHealth] = useState<TodayHealthMetrics>({
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
  });

  // Initial load
  useEffect(() => {
    let mounted = true;
    api.getDevices().then(devs => {
      if (mounted && devs.length > 0) {
        setDevices(devs);
        const match = devs.find(d => d.id === 'noise-colorfit-pro-4') || devs[0];
        setActiveDevice(match);
      }
    });

    api.getTodayHealth().then(h => {
      if (mounted) setTodayHealth(h);
    });

    api.getWatchFaces().then(wfs => {
      if (mounted && wfs.length > 0) {
        setSavedDesigns(wfs);
        setActiveDesign(wfs[0]);
      }
    });

    // Listen to real Web Bluetooth connection events
    const unsubscribeBle = webBleManager.subscribe(bleState => {
      if (bleState.isConnected) {
        setConnectionMode('CONNECTED_BLE');
        if (bleState.batteryLevel !== null) {
          setTodayHealth(prev => ({
            ...prev,
            battery_level: bleState.batteryLevel!,
            data_source_badge: 'LIVE_GATT_0x180F',
          }));
        }
        if (bleState.liveHeartRate) {
          setTodayHealth(prev => ({
            ...prev,
            heart_rate_current: bleState.liveHeartRate!,
            data_source_badge: 'LIVE_GATT_0x180D',
          }));
        }
      } else if (connectionMode === 'CONNECTED_BLE') {
        setConnectionMode('DEMO_SIMULATED');
        setTodayHealth(prev => ({
          ...prev,
          data_source_badge: 'DEMO_SIMULATED',
        }));
      }
    });

    return () => {
      mounted = false;
      unsubscribeBle();
    };
  }, []);

  // Sync compatibility report when active device changes
  useEffect(() => {
    if (activeDevice) {
      api.getDeviceCompatibility(activeDevice.id).then(setCompatibilityReport);
    }
  }, [activeDevice]);

  const handleSelectDevice = (device: DeviceModelInfo, mode: ConnectionMode) => {
    setActiveDevice(device);
    setConnectionMode(mode);
    setActiveDesign(prev => ({
      ...prev,
      target_model_id: device.id,
      resolution_width: device.resolution_width,
      resolution_height: device.resolution_height
    }));
  };

  const handleNavigateToConnectWithDevice = (device: DeviceModelInfo) => {
    setActiveDevice(device);
    setCurrentPage('connect');
  };

  const handleNavigateToStudioWithDevice = (device: DeviceModelInfo) => {
    setActiveDevice(device);
    setActiveDesign(prev => ({
      ...prev,
      target_model_id: device.id,
      resolution_width: device.resolution_width,
      resolution_height: device.resolution_height,
    }));
    setCurrentPage('watchfaces');
  };

  const handleTriggerIncomingCall = (name: string, number: string) => {
    setIncomingCallTrigger({ name, number, timestamp: Date.now() });
    setCurrentPage('calls');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Persistent Demo / Live Mode Top Indicator */}
      <DemoModeBanner
        mode={connectionMode}
        onNavigateToConnect={() => setCurrentPage('connect')}
        activeDeviceName={activeDevice?.model_name}
      />

      {/* Main Global Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        activeDevice={activeDevice}
        connectionMode={connectionMode}
        batteryLevel={todayHealth.battery_level}
      />

      {/* Dynamic View Router */}
      <main className="flex-1 pb-16">
        {/* 1. HOME */}
        {currentPage === 'home' && (
          <LandingPage
            onNavigate={setCurrentPage}
            devices={devices}
            activeDesign={activeDesign}
            onSelectDesign={setActiveDesign}
          />
        )}

        {/* 2. SMARTWATCHES */}
        {currentPage === 'smartwatches' && (
          <SmartwatchesPage
            devices={devices}
            onSelectDevice={dev => setActiveDevice(dev)}
            onNavigateToConnect={handleNavigateToConnectWithDevice}
            onNavigateToStudio={handleNavigateToStudioWithDevice}
          />
        )}

        {/* 3. CONNECT */}
        {currentPage === 'connect' && (
          <ConnectWatchPage
            devices={devices}
            activeDevice={activeDevice}
            connectionMode={connectionMode}
            onSelectDevice={handleSelectDevice}
            compatibilityReport={compatibilityReport}
          />
        )}

        {/* 4. WATCH FACES */}
        {currentPage === 'watchfaces' && (
          <WatchFaceStudioPage
            activeDesign={activeDesign}
            onUpdateDesign={setActiveDesign}
            activeDevice={activeDevice}
            savedDesigns={savedDesigns}
            onSelectSavedDesign={setActiveDesign}
            onDeleteDesign={(id) => setSavedDesigns(prev => prev.filter(d => d.id !== id))}
          />
        )}

        {/* 5. HEALTH */}
        {currentPage === 'health' && (
          <HealthActivityPage
            todayHealth={todayHealth}
          />
        )}

        {/* 6. FIND MY WATCH */}
        {currentPage === 'find' && (
          <FindMyWatchPage
            activeDevice={activeDevice}
            batteryLevel={todayHealth.battery_level}
          />
        )}

        {/* 7. SUPPORT */}
        {currentPage === 'support' && (
          <SupportPage />
        )}

        {/* Extra Power Tools */}
        {currentPage === 'dashboard' && (
          <DashboardPage
            onNavigate={setCurrentPage}
            activeDevice={activeDevice}
            activeDesign={activeDesign}
            connectionMode={connectionMode}
            todayHealth={todayHealth}
            onRefreshHealth={() => api.getTodayHealth().then(setTodayHealth)}
          />
        )}

        {currentPage === 'ai' && (
          <AIPilotPage
            activeDevice={activeDevice}
            onNavigate={setCurrentPage}
            onApplyThemeAction={(params) => {
              setActiveDesign(prev => ({ ...prev, ...params }));
            }}
            onTriggerIncomingCall={handleTriggerIncomingCall}
          />
        )}

        {currentPage === 'calls' && (
          <CallHubPage
            activeDevice={activeDevice}
            connectionMode={connectionMode}
            onNavigateToAi={() => setCurrentPage('ai')}
            incomingCallTrigger={incomingCallTrigger}
          />
        )}

        {currentPage === 'automations' && (
          <AutomationsPage
            activeDesign={activeDesign}
            onUpdateDesign={setActiveDesign}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === 'settings' && (
          <WatchSettingsPage
            activeDevice={activeDevice}
            connectionMode={connectionMode}
            batteryLevel={todayHealth.battery_level}
          />
        )}
      </main>

      {/* Persistent Floating Quick Launch: AI Agent & Calls */}
      {currentPage !== 'ai' && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5">
          {currentPage !== 'calls' && (
            <button
              onClick={() => setCurrentPage('calls')}
              title="Open Call Hub & Phone Relay"
              className="w-11 h-11 rounded-full bg-zinc-900/90 backdrop-blur border border-zinc-700/80 hover:border-red-500/80 text-zinc-300 hover:text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer group"
            >
              <PhoneCall className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            </button>
          )}
          <button
            onClick={() => setCurrentPage('ai')}
            title="Ask WristPilot AI (Natural Language & Voice Assistant)"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 hover:scale-105 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Ask AI Pilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
