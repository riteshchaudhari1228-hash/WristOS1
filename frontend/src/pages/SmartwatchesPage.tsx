import React, { useState } from 'react';
import {
  Watch, ShieldCheck, Cpu, Sparkles, Bluetooth, Layers,
  CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, Search, Filter
} from 'lucide-react';
import { DeviceModelInfo } from '../types';
import { SmartwatchProductImage } from '../components/SmartwatchProductImage';

interface Props {
  devices: DeviceModelInfo[];
  onSelectDevice: (device: DeviceModelInfo) => void;
  onNavigateToConnect: (device: DeviceModelInfo) => void;
  onNavigateToStudio: (device: DeviceModelInfo) => void;
}

export const SmartwatchesPage: React.FC<Props> = ({
  devices,
  onSelectDevice,
  onNavigateToConnect,
  onNavigateToStudio,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Noise' | 'boAt' | 'Fire-Boltt'>('All');
  const [selectedShape, setSelectedShape] = useState<'All' | 'square' | 'round'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDossierDevice, setActiveDossierDevice] = useState<DeviceModelInfo | null>(null);

  const filteredDevices = devices.filter(d => {
    const brandMatch = selectedBrand === 'All' || d.brand.toLowerCase() === selectedBrand.toLowerCase();
    const shapeMatch = selectedShape === 'All' || d.shape === selectedShape;
    const queryMatch =
      d.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.chipset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.companion_app.toLowerCase().includes(searchQuery.toLowerCase());
    return brandMatch && shapeMatch && queryMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/80 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-2">
            <Watch className="w-3.5 h-3.5" />
            <span>Target Hardware Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Supported Smartwatches
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
            Directly cataloged for Indian wearables: <strong className="text-zinc-200">Noise</strong>, <strong className="text-zinc-200">boAt</strong>, and <strong className="text-zinc-200">Fire-Boltt</strong>.
            Every device includes verified Bluetooth GATT services, screen resolutions, and manufacturer protocol boundaries.
          </p>
        </div>

        {/* Brand Summary Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="text-red-400 font-bold">{devices.length}</span> Models Verified
          </div>
          <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="text-emerald-400 font-bold">100%</span> Standard GATT
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        {/* Brand tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Noise', 'boAt', 'Fire-Boltt'] as const).map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedBrand === brand
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {brand === 'All' ? 'All Brands' : brand}
            </button>
          ))}
        </div>

        {/* Shape Filter & Search */}
        <div className="flex items-center gap-3">
          {/* Shape Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setSelectedShape('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                selectedShape === 'All' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
            >
              All Shapes
            </button>
            <button
              onClick={() => setSelectedShape('square')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                selectedShape === 'square' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
            >
              Square
            </button>
            <button
              onClick={() => setSelectedShape('round')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                selectedShape === 'round' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
            >
              Round
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search model, chipset..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* SMARTWATCH CARDS SHOWROOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDevices.map(device => {
          return (
            <div
              key={device.id}
              className="group rounded-3xl bg-gradient-to-b from-zinc-900/70 to-zinc-950 border border-zinc-800/80 hover:border-red-500/40 transition-all duration-300 p-6 flex flex-col justify-between shadow-xl hover:shadow-red-600/10"
            >
              {/* Card Header & Brand Pill */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs font-bold font-mono text-zinc-300">
                    {device.brand}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      device.verification_level === 'VERIFIED_GATT'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {device.verification_level === 'VERIFIED_GATT' ? 'VERIFIED GATT' : 'HYBRID EXPORT'}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-red-400 transition-colors">
                  {device.model_name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {device.screen_type} • {device.screen_size}
                </p>

                {/* Large Smartwatch Product Visual */}
                <div className="py-6 flex items-center justify-center">
                  <SmartwatchProductImage
                    shape={device.shape}
                    brand={device.brand}
                    modelName={device.model_name}
                    size="lg"
                    accentColor="#ef4444"
                  />
                </div>

                {/* Specs Pill List */}
                <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase block">Resolution</span>
                    <strong className="text-zinc-200">
                      {device.resolution_width} × {device.resolution_height}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase block">Companion App</span>
                    <strong className="text-zinc-200 truncate block" title={device.companion_app}>
                      {device.companion_app.split(':')[0]}
                    </strong>
                  </div>
                </div>

                {/* Verified Bluetooth Services */}
                <div className="space-y-1.5 mb-5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Supported Services</span>
                  <div className="flex flex-wrap gap-1.5">
                    {device.has_standard_battery && (
                      <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-[10px] font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Battery 0x180F
                      </span>
                    )}
                    {device.has_standard_heart_rate && (
                      <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-[10px] font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Heart Rate 0x180D
                      </span>
                    )}
                    {device.has_immediate_alert && (
                      <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/60 text-zinc-300 text-[10px] font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Buzzer 0x1802
                      </span>
                    )}
                  </div>
                </div>

                {/* Honest Protocol Limitation Notice */}
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                  <span className="text-zinc-300 font-semibold block mb-0.5">Chipset: {device.chipset}</span>
                  {device.limitations_notes}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-zinc-800/80">
                <button
                  onClick={() => onNavigateToConnect(device)}
                  className="px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>Connect Watch</span>
                </button>
                <button
                  onClick={() => onNavigateToStudio(device)}
                  className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-red-400" />
                  <span>Design Face</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-400">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No smartwatches match your criteria</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Try adjusting your search query or reset the brand and shape filters.
          </p>
        </div>
      )}
    </div>
  );
};
