import React, { useState } from 'react';
import {
  Watch, Layers, Bluetooth, Palette, Sliders, Activity, Radio, HelpCircle,
  Menu, X, Battery, Wifi, PhoneCall, Bot
} from 'lucide-react';
import { ConnectionMode, DeviceModelInfo } from '../types';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  activeDevice: DeviceModelInfo | null;
  connectionMode: ConnectionMode;
  batteryLevel?: number;
}

export const Navbar: React.FC<Props> = ({
  currentPage,
  onNavigate,
  activeDevice,
  connectionMode,
  batteryLevel = 86
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Complete, responsive navigation with Phone Calls & AI Pilot:
  const navItems = [
    { id: 'home', label: 'Home', icon: Watch },
    { id: 'smartwatches', label: 'Smartwatches', icon: Layers },
    { id: 'connect', label: 'Connect', icon: Bluetooth },
    { id: 'watchfaces', label: 'Watch Faces', icon: Palette },
    { id: 'calls', label: 'Calls', icon: PhoneCall },
    { id: 'ai', label: 'AI Pilot', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'find', label: 'Find Watch', icon: Radio },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 p-0.5 shadow-lg shadow-red-600/25 group-hover:shadow-red-600/40 transition-all">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Watch className="w-5 h-5 text-red-500 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-wider text-white">WRIST<span className="text-red-500">OS</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">v1.0</span>
              </div>
              <p className="text-[9px] font-mono text-zinc-400 -mt-0.5">SMARTWATCH COMPANION</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] xl:text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm shadow-red-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Device & Battery Pill */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => onNavigate('settings')}
              title="Click to open Live Watch Display & Settings"
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-red-500/50 transition-all cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full ${
                connectionMode === 'CONNECTED_BLE'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionMode === 'DEMO_SIMULATED'
                  ? 'bg-amber-400'
                  : 'bg-zinc-500'
              }`} />
              <div className="text-left">
                <p className="text-[11px] font-semibold text-zinc-200 leading-tight">
                  {activeDevice?.model_name || 'Smartwatch'}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono">
                  <span>{connectionMode === 'DEMO_SIMULATED' ? 'DEMO' : connectionMode === 'CONNECTED_BLE' ? 'BLE' : 'SYNCED'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-zinc-300">
                    <Battery className="w-2.5 h-2.5 text-emerald-400" />
                    {batteryLevel}%
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-zinc-950 border-b border-zinc-800 animate-fadeIn">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
