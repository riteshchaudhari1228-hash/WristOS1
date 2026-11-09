import React, { useEffect, useState } from 'react';
import { WatchFaceDesign, DeviceModelInfo } from '../types';
import { Heart, Footprints, BatteryCharging, Flame, ShieldAlert } from 'lucide-react';

interface Props {
  design: WatchFaceDesign;
  device?: DeviceModelInfo | null;
  interactive?: boolean;
  scale?: number;
  batteryLevel?: number;
  heartRate?: number;
  steps?: number;
  modeLabel?: string;
  className?: string;
}

export const VirtualWatchPreview: React.FC<Props> = ({
  design,
  device,
  interactive = true,
  scale = 1,
  batteryLevel = 86,
  heartRate = 74,
  steps = 8420,
  modeLabel = 'DEMO MODE',
  className = ''
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isRound = device?.shape === 'round';
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const formattedHours = design.time_format === '12h'
    ? (hours % 12 || 12).toString().padStart(2, '0')
    : hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();

  // Analog hand angles
  const secondAngle = (seconds / 60) * 360;
  const minuteAngle = ((minutes + seconds / 60) / 60) * 360;
  const hourAngle = (((hours % 12) + minutes / 60) / 12) * 360;

  // Background styling
  const getBackgroundStyle = (): React.CSSProperties => {
    if (design.background_image_data) {
      return {
        backgroundImage: `url(${design.background_image_data})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    if (design.background_type === 'gradient') {
      return {
        background: `radial-gradient(circle at 50% 30%, ${design.primary_color}33 0%, ${design.secondary_color}22 50%, #080a10 100%)`
      };
    }
    if (design.background_type === 'pattern') {
      return {
        background: `radial-gradient(circle at center, ${design.primary_color}18 0%, #0a0d14 100%)`,
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)',
        backgroundSize: '16px 16px'
      };
    }
    if (design.background_type === 'ai_art') {
      return {
        background: `linear-gradient(135deg, ${design.secondary_color}55 0%, #0d1117 50%, ${design.primary_color}33 100%)`
      };
    }
    return { background: '#090b10' };
  };

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
      {/* Top Silicone Strap */}
      <div className="w-28 h-12 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-t-xl border-t border-x border-zinc-700/60 shadow-inner flex flex-col justify-end items-center pb-1">
        <div className="w-20 h-1.5 bg-zinc-950/70 rounded-full" />
      </div>

      {/* Watch Outer Chassis */}
      <div className="relative group">
        {/* Physical Crown Button on Right */}
        <div
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-3.5 h-12 bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-700 rounded-r-md border border-zinc-500 shadow-md cursor-pointer hover:brightness-125 transition-all flex items-center justify-center"
          title="Digital Rotating Crown"
        >
          <div className="w-1.5 h-8 bg-zinc-800/80 rounded-sm" />
        </div>

        {/* Secondary Sensor/Mic on Left */}
        <div className="absolute -left-1.5 top-1/3 w-1.5 h-3 bg-zinc-700 rounded-l-sm" />

        {/* Main Bezel Housing */}
        <div
          className={`relative p-3.5 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 shadow-2xl border border-zinc-600/50 ${
            isRound ? 'w-72 h-72 rounded-full' : 'w-68 h-80 rounded-[44px]'
          }`}
          style={{
            boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 25px ${design.primary_color}22`
          }}
        >
          {/* Inner Chamfer Rim */}
          <div
            className={`w-full h-full p-2 bg-black border border-zinc-900 overflow-hidden relative ${
              isRound ? 'rounded-full' : 'rounded-[34px]'
            }`}
          >
            {/* Screen Glass Surface */}
            <div
              className={`w-full h-full relative overflow-hidden flex flex-col justify-between p-4 ${
                isRound ? 'rounded-full' : 'rounded-[26px]'
              }`}
              style={getBackgroundStyle()}
            >
              {/* Subtle Screen Glare Reflection */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-md pointer-events-none" />

              {/* Mode Watermark Tag */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${modeLabel.includes('DEMO') ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-[9px] font-semibold tracking-wider text-zinc-300">
                  {modeLabel}
                </span>
              </div>

              {/* CLOCK DISPLAY LAYER */}
              {design.style === 'analog' ? (
                /* ANALOG DIAL */
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Dial Markers */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                    <div
                      key={deg}
                      className="absolute w-full h-full flex justify-center items-start pt-1 pointer-events-none"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <div
                        className={`rounded-full ${deg % 90 === 0 ? 'w-1 h-3' : 'w-0.5 h-1.5'}`}
                        style={{ backgroundColor: deg % 90 === 0 ? design.primary_color : 'rgba(255,255,255,0.3)' }}
                      />
                    </div>
                  ))}

                  {/* Brand / Logo Text on Dial */}
                  <div className="absolute top-14 text-center">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400/80">WRISTOS</span>
                  </div>

                  {/* Hour Hand */}
                  <div
                    className="absolute w-1.5 h-14 rounded-full origin-bottom z-10 transition-transform duration-300"
                    style={{
                      transform: `rotate(${hourAngle}deg)`,
                      bottom: '50%',
                      backgroundColor: design.primary_color,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
                    }}
                  />

                  {/* Minute Hand */}
                  <div
                    className="absolute w-1 h-20 rounded-full origin-bottom z-10 transition-transform duration-300"
                    style={{
                      transform: `rotate(${minuteAngle}deg)`,
                      bottom: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
                    }}
                  />

                  {/* Seconds Hand */}
                  {design.show_seconds && (
                    <div
                      className="absolute w-0.5 h-22 rounded-full origin-bottom z-20"
                      style={{
                        transform: `rotate(${secondAngle}deg)`,
                        bottom: '50%',
                        backgroundColor: design.accent_color,
                        boxShadow: `0 0 8px ${design.accent_color}`
                      }}
                    />
                  )}

                  {/* Center Pivot Pin */}
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full z-30 border-2 border-black"
                    style={{ backgroundColor: design.primary_color }}
                  />

                  {/* Analog Sub-dial Date Pill */}
                  {design.show_date && (
                    <div className="absolute right-5 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-zinc-300">
                      {dateStr.split(' ')[0]} {time.getDate()}
                    </div>
                  )}
                </div>
              ) : (
                /* DIGITAL DIAL */
                <div className={`relative w-full h-full flex flex-col ${
                  design.clock_position === 'top' ? 'justify-start pt-6' :
                  design.clock_position === 'bottom' ? 'justify-end pb-6' : 'justify-center'
                } items-center text-center`}>
                  {/* Date Complication */}
                  {design.show_date && (
                    <div className="text-[11px] font-medium tracking-wider mb-1" style={{ color: design.secondary_color === '#18181B' ? '#cbd5e1' : design.secondary_color }}>
                      {dateStr}
                    </div>
                  )}

                  {/* Main Digital Time Numbers */}
                  <div
                    className="text-4xl font-black tracking-tight leading-none drop-shadow-md flex items-center gap-0.5"
                    style={{
                      color: design.primary_color,
                      fontFamily: design.clock_font,
                      textShadow: `0 0 16px ${design.primary_color}66`
                    }}
                  >
                    <span>{formattedHours}</span>
                    <span className="opacity-80 animate-pulse">:</span>
                    <span>{formattedMinutes}</span>
                  </div>

                  {/* Seconds Pill */}
                  {design.show_seconds && (
                    <div
                      className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider"
                      style={{
                        backgroundColor: `${design.accent_color}22`,
                        color: design.accent_color,
                        border: `1px solid ${design.accent_color}44`
                      }}
                    >
                      {formattedSeconds}s
                    </div>
                  )}
                </div>
              )}

              {/* COMPLICATIONS DOCK (Bottom / Corners) */}
              <div className="relative z-10 w-full flex items-center justify-around pt-2 px-1 border-t border-white/5 backdrop-blur-xs">
                {design.show_steps && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300" title="Steps">
                    <Footprints className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{steps.toLocaleString()}</span>
                  </div>
                )}

                {design.show_heart_rate && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300" title="Heart Rate">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                    <span>{heartRate} <span className="text-[9px] text-zinc-400">BPM</span></span>
                  </div>
                )}

                {design.show_battery && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300" title="Battery">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{batteryLevel}%</span>
                  </div>
                )}

                {design.show_calories && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300" title="Calories">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>485 kcal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Silicone Strap */}
      <div className="w-28 h-14 bg-gradient-to-t from-zinc-800 to-zinc-900 rounded-b-xl border-b border-x border-zinc-700/60 shadow-inner flex flex-col justify-start items-center pt-2">
        <div className="w-20 h-1.5 bg-zinc-950/70 rounded-full mb-1.5" />
        <div className="w-16 h-1.5 bg-zinc-950/70 rounded-full" />
      </div>
    </div>
  );
};
