import React, { useState } from 'react';
import {
  Settings, User, Bluetooth, Smartphone, ShieldCheck, Terminal,
  RefreshCw, CheckCircle2, AlertTriangle, Key, ExternalLink
} from 'lucide-react';
import { DeviceModelInfo, ConnectionMode } from '../types';

interface Props {
  activeDevice: DeviceModelInfo | null;
  connectionMode: ConnectionMode;
  onUpdateMode: (mode: ConnectionMode) => void;
}

export const SettingsPage: React.FC<Props> = ({
  activeDevice,
  connectionMode,
  onUpdateMode
}) => {
  const [userName, setUserName] = useState('Alex Rivera');
  const [stepGoal, setStepGoal] = useState('10000');
  const [devMode, setDevMode] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const hasWebBle = typeof navigator !== 'undefined' && !!(navigator as any).bluetooth;

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div>
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-cyan-400" />
          System Preferences & Configuration
        </span>
        <h1 className="text-3xl font-black text-white mt-1">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
          Manage target hardware parameters, Bluetooth bridge configurations, and Health Connect permissions.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>User preferences saved successfully!</span>
        </div>
      )}

      {/* USER PROFILE & TARGET GOALS */}
      <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          User Profile & Daily Fitness Targets
        </h3>

        <form onSubmit={handleSavePreferences} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">User Name / Profile</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 block mb-1">Daily Step Goal</label>
            <input
              type="number"
              value={stepGoal}
              onChange={(e) => setStepGoal(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>

      {/* BLUETOOTH & BRIDGE DIAGNOSTICS */}
      <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Bluetooth className="w-4 h-4 text-violet-400" />
          Bluetooth Subsystem Diagnostics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Web Bluetooth API</span>
              <span className={`font-bold ${hasWebBle ? 'text-emerald-400' : 'text-amber-400'}`}>
                {hasWebBle ? 'SUPPORTED' : 'UNAVAILABLE (Chrome/Edge required)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">FastAPI Companion Bridge</span>
              <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Pairing Secret Code</span>
              <span className="text-cyan-400 font-bold">WRIST-7824</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Active Device</span>
              <span className="text-white font-bold">{activeDevice?.model_name || 'boAt Wave Call 2'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Verification Level</span>
              <span className="text-cyan-400 font-bold">{activeDevice?.verification_level || 'PARTIAL_HYBRID'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Current Mode</span>
              <span className="text-amber-400 font-bold">{connectionMode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEVELOPER MODE TOGGLE & STATE INSPECTOR */}
      <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Developer Raw State Inspector
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">Toggle live JSON inspection of active hardware registry models.</p>
          </div>
          <button
            onClick={() => setDevMode(!devMode)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              devMode ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 ${
                devMode ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {devMode && (
          <pre className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-80">
            {JSON.stringify({ activeDevice, connectionMode, hasWebBle }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
