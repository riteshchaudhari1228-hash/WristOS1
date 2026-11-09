import React from 'react';
import { ConnectionMode } from '../types';
import { ShieldAlert, Cpu, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  mode: ConnectionMode;
  onNavigateToConnect: () => void;
  activeDeviceName?: string;
}

export const DemoModeBanner: React.FC<Props> = ({ mode, onNavigateToConnect, activeDeviceName }) => {
  if (mode === 'CONNECTED_BLE') {
    return (
      <div className="bg-emerald-950/40 border-b border-emerald-500/30 px-4 py-2 text-xs flex items-center justify-between text-emerald-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">CONNECTED MODE ACTIVE:</span>
          <span>Accessing verified Bluetooth GATT services for <strong>{activeDeviceName || 'Smartwatch'}</strong>.</span>
        </div>
        <span className="text-[11px] text-emerald-400/80 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/20">
          GATT Standard Verified
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-2 text-xs flex flex-wrap items-center justify-between text-amber-200/90 gap-2">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] tracking-wider border border-amber-500/30">
          DEMO MODE
        </span>
        <span>
          Operating in zero-hardware demonstration mode. Telemetry and connection states are simulated for presentation.
        </span>
      </div>
      <button
        onClick={onNavigateToConnect}
        className="flex items-center gap-1 font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer"
      >
        <span>Connect Real Hardware or View Matrix</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
