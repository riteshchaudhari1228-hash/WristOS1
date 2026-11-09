import React from 'react';

interface Props {
  shape?: 'round' | 'square' | 'rect';
  brand?: string;
  modelName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  accentColor?: string;
  interactive?: boolean;
}

export const SmartwatchProductImage: React.FC<Props> = ({
  shape = 'square',
  brand = 'Noise',
  modelName = 'Smartwatch',
  size = 'md',
  accentColor = '#ef4444',
  interactive = true,
}) => {
  const isRound = shape === 'round';

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-44 h-44',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80',
    hero: 'w-80 h-80 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px]',
  }[size];

  const currentTime = '10:42';
  const currentDate = 'WED, 30 OCT';

  return (
    <div
      className={`relative ${sizeClasses} flex items-center justify-center select-none transition-transform duration-500 ${
        interactive ? 'hover:scale-[1.03] group' : ''
      }`}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-4 rounded-full blur-2xl opacity-40 transition-opacity duration-500 group-hover:opacity-75 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accentColor} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {isRound ? (
        // ROUND WATCH CHASSIS
        <svg
          viewBox="0 0 340 340"
          className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Top and Bottom Straps */}
            <linearGradient id="strapGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#18181c" />
              <stop offset="30%" stopColor="#282830" />
              <stop offset="70%" stopColor="#202026" />
              <stop offset="100%" stopColor="#121215" />
            </linearGradient>

            {/* Bezel Outer Metal Rim */}
            <linearGradient id="metalBezel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="25%" stopColor="#18181b" />
              <stop offset="50%" stopColor="#52525b" />
              <stop offset="75%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>

            {/* Rotary Crown Gradient */}
            <linearGradient id="crownGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#71717a" />
              <stop offset="50%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>

            {/* Screen OLED Surface */}
            <radialGradient id="screenGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#18181f" />
              <stop offset="60%" stopColor="#0d0e12" />
              <stop offset="100%" stopColor="#050507" />
            </radialGradient>
          </defs>

          {/* Upper Strap */}
          <path
            d="M 125 10 L 215 10 L 205 60 L 135 60 Z"
            fill="url(#strapGrad)"
            stroke="#27272a"
            strokeWidth="1.5"
          />
          <line x1="130" y1="25" x2="210" y2="25" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />
          <line x1="132" y1="40" x2="208" y2="40" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />

          {/* Lower Strap */}
          <path
            d="M 135 280 L 205 280 L 215 330 L 125 330 Z"
            fill="url(#strapGrad)"
            stroke="#27272a"
            strokeWidth="1.5"
          />
          <line x1="132" y1="300" x2="208" y2="300" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />
          <line x1="130" y1="315" x2="210" y2="315" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />

          {/* Right Crown Button with Red Accent Ring */}
          <rect x="288" y="145" width="16" height="32" rx="4" fill="url(#crownGrad)" stroke="#3f3f46" />
          <line x1="293" y1="145" x2="293" y2="177" stroke="#ef4444" strokeWidth="2.5" />
          <rect x="286" y="195" width="10" height="22" rx="3" fill="#27272a" stroke="#3f3f46" />

          {/* Outer Case Chassis */}
          <circle cx="170" cy="170" r="124" fill="url(#metalBezel)" stroke="#52525b" strokeWidth="2" />
          <circle cx="170" cy="170" r="118" fill="#18181b" stroke="#09090b" strokeWidth="3" />

          {/* Ceramic Bezel Index Marks */}
          <circle cx="170" cy="170" r="110" fill="none" stroke="#27272a" strokeWidth="4" />
          <circle
            cx="170"
            cy="170"
            r="104"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.8"
          />

          {/* Active OLED Display */}
          <circle cx="170" cy="170" r="98" fill="url(#screenGrad)" />

          {/* Glass Reflection Highlight Arc */}
          <path
            d="M 90 120 A 95 95 0 0 1 235 95"
            fill="none"
            stroke="white"
            strokeWidth="3"
            opacity="0.12"
            strokeLinecap="round"
          />

          {/* Watch Face UI (Dial Complications) */}
          <g>
            {/* Outer Activity Progress Ring */}
            <circle
              cx="170"
              cy="170"
              r="84"
              fill="none"
              stroke="#27272a"
              strokeWidth="4"
            />
            <circle
              cx="170"
              cy="170"
              r="84"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray="527"
              strokeDashoffset="140"
              strokeLinecap="round"
              transform="rotate(-90 170 170)"
            />

            {/* Brand / OS Tagline */}
            <text
              x="170"
              y="118"
              fill="#ef4444"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="2"
            >
              WRISTOS
            </text>

            {/* Digital Time */}
            <text
              x="170"
              y="166"
              fill="#ffffff"
              fontSize="34"
              fontFamily="sans-serif"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="-0.5"
            >
              {currentTime}
            </text>

            {/* Date */}
            <text
              x="170"
              y="188"
              fill="#a1a1aa"
              fontSize="10"
              fontFamily="sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="1"
            >
              {currentDate}
            </text>

            {/* Heart Rate / Battery Bottom Pods */}
            <rect x="120" y="204" width="44" height="20" rx="6" fill="#18181b" stroke="#27272a" />
            <text x="142" y="218" fill="#ef4444" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              ♥ 74
            </text>

            <rect x="176" y="204" width="44" height="20" rx="6" fill="#18181b" stroke="#27272a" />
            <text x="198" y="218" fill="#22c55e" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              ⚡ 86%
            </text>
          </g>
        </svg>
      ) : (
        // SQUARE / RECTANGULAR WATCH CHASSIS
        <svg
          viewBox="0 0 340 380"
          className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Strap Gradient */}
            <linearGradient id="sqStrapGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="25%" stopColor="#27272a" />
              <stop offset="50%" stopColor="#202024" />
              <stop offset="75%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#121215" />
            </linearGradient>

            {/* Metallic Chassis Gradient */}
            <linearGradient id="sqMetalCase" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#52525b" />
              <stop offset="30%" stopColor="#27272a" />
              <stop offset="70%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#3f3f46" />
            </linearGradient>

            {/* OLED Glass Screen */}
            <radialGradient id="sqOledScreen" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#181820" />
              <stop offset="50%" stopColor="#0c0d12" />
              <stop offset="100%" stopColor="#040406" />
            </radialGradient>
          </defs>

          {/* Upper Strap */}
          <path
            d="M 115 5 L 225 5 L 215 65 L 125 65 Z"
            fill="url(#sqStrapGrad)"
            stroke="#27272a"
            strokeWidth="1.5"
          />
          <line x1="120" y1="22" x2="220" y2="22" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />
          <line x1="122" y1="40" x2="218" y2="40" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />

          {/* Lower Strap */}
          <path
            d="M 125 315 L 215 315 L 225 375 L 115 375 Z"
            fill="url(#sqStrapGrad)"
            stroke="#27272a"
            strokeWidth="1.5"
          />
          <line x1="122" y1="340" x2="218" y2="340" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />
          <line x1="120" y1="358" x2="220" y2="358" stroke="#3f3f46" strokeWidth="1" opacity="0.6" />

          {/* Right Crown Button with Crimson Accent Ring */}
          <rect x="278" y="160" width="14" height="42" rx="4" fill="#3f3f46" stroke="#52525b" />
          <line x1="282" y1="160" x2="282" y2="202" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="286" y1="160" x2="286" y2="202" stroke="#71717a" strokeWidth="1" />

          {/* Outer Watch Case Body */}
          <rect
            x="60"
            y="65"
            width="220"
            height="250"
            rx="46"
            fill="url(#sqMetalCase)"
            stroke="#52525b"
            strokeWidth="2"
          />

          {/* Inner Chamfered Bezel */}
          <rect
            x="66"
            y="71"
            width="208"
            height="238"
            rx="40"
            fill="#09090b"
            stroke="#27272a"
            strokeWidth="1.5"
          />

          {/* Active 2.5D Curved OLED Glass Surface */}
          <rect
            x="76"
            y="81"
            width="188"
            height="218"
            rx="32"
            fill="url(#sqOledScreen)"
          />

          {/* Curved Glass Sheen */}
          <path
            d="M 92 94 Q 170 82 248 94 Q 240 130 92 120 Z"
            fill="white"
            opacity="0.08"
          />

          {/* Watch Face UI Complications */}
          <g>
            {/* Top Brand Pill */}
            <rect x="135" y="98" width="70" height="18" rx="9" fill="#18181b" stroke="#ef4444" strokeWidth="1" />
            <text
              x="170"
              y="110"
              fill="#ef4444"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              letterSpacing="1.5"
            >
              WRISTOS
            </text>

            {/* Prominent Digital Clock */}
            <text
              x="170"
              y="168"
              fill="#ffffff"
              fontSize="44"
              fontFamily="sans-serif"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="-1"
            >
              {currentTime}
            </text>

            {/* Date */}
            <text
              x="170"
              y="192"
              fill="#a1a1aa"
              fontSize="11"
              fontFamily="sans-serif"
              fontWeight="600"
              textAnchor="middle"
              letterSpacing="1"
            >
              {currentDate}
            </text>

            {/* Dynamic Activity Progress Bar */}
            <rect x="98" y="214" width="144" height="6" rx="3" fill="#27272a" />
            <rect x="98" y="214" width="118" height="6" rx="3" fill="#ef4444" />

            {/* Bottom 3 Complication Widgets */}
            {/* Steps */}
            <g transform="translate(94, 234)">
              <rect width="44" height="42" rx="8" fill="#141418" stroke="#27272a" />
              <text x="22" y="16" fill="#a1a1aa" fontSize="7" fontFamily="sans-serif" textAnchor="middle">STEPS</text>
              <text x="22" y="32" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">8.4k</text>
            </g>

            {/* Heart Rate */}
            <g transform="translate(148, 234)">
              <rect width="44" height="42" rx="8" fill="#141418" stroke="#ef4444" strokeWidth="0.8" />
              <text x="22" y="16" fill="#ef4444" fontSize="7" fontFamily="sans-serif" textAnchor="middle">BPM</text>
              <text x="22" y="32" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">74</text>
            </g>

            {/* Battery */}
            <g transform="translate(202, 234)">
              <rect width="44" height="42" rx="8" fill="#141418" stroke="#27272a" />
              <text x="22" y="16" fill="#22c55e" fontSize="7" fontFamily="sans-serif" textAnchor="middle">BATT</text>
              <text x="22" y="32" fill="#22c55e" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">86%</text>
            </g>
          </g>
        </svg>
      )}

      {/* Brand & Model floating chip on hover */}
      {interactive && (
        <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-zinc-900/95 border border-zinc-700/80 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-mono font-bold text-zinc-200">
            {brand} • {modelName}
          </span>
        </div>
      )}
    </div>
  );
};
