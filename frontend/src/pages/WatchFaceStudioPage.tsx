import React, { useState, useRef, useEffect } from 'react';
import {
  Palette, Sparkles, Download, Upload, Copy, Trash2, Check,
  Clock, Sliders, Layers, Eye, Smartphone, AlertCircle, Info, RefreshCw, Save
} from 'lucide-react';
import { WatchFaceDesign, DeviceModelInfo } from '../types';
import { api } from '../services/api';

interface Props {
  activeDesign: WatchFaceDesign;
  onUpdateDesign: (design: WatchFaceDesign) => void;
  activeDevice: DeviceModelInfo | null;
  savedDesigns: WatchFaceDesign[];
  onSelectSavedDesign: (design: WatchFaceDesign) => void;
  onDeleteDesign: (id: string) => void;
}

export const WatchFaceStudioPage: React.FC<Props> = ({
  activeDesign,
  onUpdateDesign,
  activeDevice,
  savedDesigns,
  onSelectSavedDesign,
  onDeleteDesign
}) => {
  const [activeTab, setActiveTab] = useState<'style' | 'colors' | 'background' | 'widgets' | 'export'>('style');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [exportNotice, setExportNotice] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Local draft design
  const [draft, setDraft] = useState<WatchFaceDesign>({
    ...activeDesign,
    target_model_id: activeDevice?.id || activeDesign.target_model_id,
    resolution_width: activeDevice?.resolution_width || activeDesign.resolution_width,
    resolution_height: activeDevice?.resolution_height || activeDesign.resolution_height,
  });

  // Keep target resolution aligned with activeDevice
  useEffect(() => {
    if (activeDevice) {
      setDraft(prev => ({
        ...prev,
        target_model_id: activeDevice.id,
        resolution_width: activeDevice.resolution_width,
        resolution_height: activeDevice.resolution_height,
      }));
    }
  }, [activeDevice]);

  const updateDraft = (updates: Partial<WatchFaceDesign>) => {
    const updated = { ...draft, ...updates, updated_at: new Date().toISOString() };
    setDraft(updated);
    onUpdateDesign(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateDraft({
            background_type: 'upload',
            background_image_data: reader.result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw watch face canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = draft.resolution_width;
    const h = draft.resolution_height;
    canvas.width = w;
    canvas.height = h;

    // 1. Draw Background
    if (draft.background_type === 'upload' && draft.background_image_data) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        drawOverlays(ctx, w, h);
      };
      img.src = draft.background_image_data;
      return;
    }

    // Default gradient/pattern backgrounds
    const grad = ctx.createLinearGradient(0, 0, w, h);
    if (draft.theme === 'sports') {
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#0c0a09');
    } else if (draft.theme === 'cyberpunk') {
      grad.addColorStop(0, '#180e29');
      grad.addColorStop(1, '#090812');
    } else if (draft.theme === 'business') {
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(1, '#09090b');
    } else {
      grad.addColorStop(0, '#18181b');
      grad.addColorStop(1, '#09090b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle radial glow
    const radial = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.6);
    radial.addColorStop(0, `${draft.primary_color}22`);
    radial.addColorStop(1, '#00000000');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    drawOverlays(ctx, w, h);
  }, [draft]);

  const drawOverlays = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const isRound = activeDevice?.shape === 'round';

    // Circular or Square frame guide
    if (isRound) {
      ctx.strokeStyle = `${draft.accent_color}44`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.44, 0, Math.PI * 2);
      ctx.stroke();
    }

    const now = new Date();
    const hours = draft.time_format === '24h'
      ? String(now.getHours()).padStart(2, '0')
      : String(now.getHours() % 12 || 12).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    if (draft.style === 'analog') {
      // Draw Analog Dial
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.38;

      // Dial hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const x1 = cx + Math.sin(angle) * (radius - 12);
        const y1 = cy - Math.cos(angle) * (radius - 12);
        const x2 = cx + Math.sin(angle) * radius;
        const y2 = cy - Math.cos(angle) * radius;

        ctx.strokeStyle = i % 3 === 0 ? draft.primary_color : '#71717a';
        ctx.lineWidth = i % 3 === 0 ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Hour hand
      const hrAngle = ((now.getHours() % 12) + now.getMinutes() / 60) * (Math.PI / 6);
      ctx.strokeStyle = draft.primary_color;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(hrAngle) * (radius * 0.55), cy - Math.cos(hrAngle) * (radius * 0.55));
      ctx.stroke();

      // Minute hand
      const minAngle = (now.getMinutes() + now.getSeconds() / 60) * (Math.PI / 30);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.sin(minAngle) * (radius * 0.78), cy - Math.cos(minAngle) * (radius * 0.78));
      ctx.stroke();

      // Second hand
      if (draft.show_seconds) {
        const secAngle = now.getSeconds() * (Math.PI / 30);
        ctx.strokeStyle = draft.accent_color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(secAngle) * (radius * 0.85), cy - Math.cos(secAngle) * (radius * 0.85));
        ctx.stroke();
      }

      // Center Pinion
      ctx.fillStyle = draft.accent_color;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw Digital Clock
      let posY = h * 0.5;
      if (draft.clock_position === 'top') posY = h * 0.35;
      if (draft.clock_position === 'bottom') posY = h * 0.68;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Brand Title
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = draft.accent_color;
      ctx.fillText('WRISTOS', w / 2, posY - Math.min(w, h) * 0.16);

      // Digital Clock Time
      const fontSize = Math.floor(Math.min(w, h) * 0.22);
      ctx.font = `900 ${fontSize}px sans-serif`;
      ctx.fillStyle = draft.primary_color;
      ctx.fillText(`${hours}:${minutes}`, w / 2, posY);

      // Date Widget
      if (draft.show_date) {
        ctx.font = '600 12px sans-serif';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText('WED, 30 OCT', w / 2, posY + fontSize * 0.6);
      }
    }

    // Complication Widgets
    const widgetY = h * 0.82;
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px monospace';

    if (draft.show_steps) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText('👟 8,420', w * 0.28, widgetY);
    }
    if (draft.show_heart_rate) {
      ctx.fillStyle = draft.accent_color;
      ctx.fillText('♥ 74', w * 0.5, widgetY);
    }
    if (draft.show_battery) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText('⚡ 86%', w * 0.72, widgetY);
    }
  };

  // Direct PNG download from HTML5 Canvas
  const handleClientSideDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `wristos_${draft.name.toLowerCase().replace(/\s+/g, '_')}_${draft.resolution_width}x${draft.resolution_height}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleExport = async () => {
    setIsExporting(true);
    handleClientSideDownload();

    try {
      const res = await api.exportWallpaper(draft.id, activeDevice?.id || draft.target_model_id);
      setExportNotice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveDesign = () => {
    onUpdateDesign(draft);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const templatesList = [
    {
      name: 'Cyberpunk Lumina',
      theme: 'cyberpunk',
      style: 'digital',
      primary: '#00F2FE',
      secondary: '#180e29',
      accent: '#ef4444',
    },
    {
      name: 'Geneva Classic',
      theme: 'minimal',
      style: 'analog',
      primary: '#F8FAFC',
      secondary: '#0F172A',
      accent: '#dc2626',
    },
    {
      name: 'Aero Dynamic Red',
      theme: 'sports',
      style: 'digital',
      primary: '#ef4444',
      secondary: '#1c1917',
      accent: '#eab308',
    },
    {
      name: 'Chronos Executive',
      theme: 'business',
      style: 'analog',
      primary: '#FFD700',
      secondary: '#1c1917',
      accent: '#ffffff',
    },
    {
      name: 'Campus Horizon',
      theme: 'college',
      style: 'digital',
      primary: '#38BDF8',
      secondary: '#0F172A',
      accent: '#f97316',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>Watch Face Studio</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Interactive Dial Designer</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Customize analog and digital dials, upload personal wallpapers, configure complications, and export
            pixel-perfect wallpapers matching your smartwatch’s hardware resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDesign}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved!' : 'Save Design'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export PNG Wallpaper'}</span>
          </button>
        </div>
      </div>

      {/* STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Virtual Smartwatch Bezel Stage */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-2xl flex flex-col items-center sticky top-24">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider">
                Hardware Canvas Stage
              </span>
              <span className="text-xs font-mono text-red-400 font-bold">
                {draft.resolution_width} × {draft.resolution_height} px
              </span>
            </div>

            {/* Smartwatch Bezel Housing */}
            <div className={`p-4 rounded-[42px] bg-gradient-to-b from-zinc-800 to-zinc-950 border-4 border-zinc-700 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative ${
              activeDevice?.shape === 'round' ? 'rounded-full' : ''
            }`}>
              {/* Rotary crown */}
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-10 rounded-r-md bg-zinc-600 border-l border-red-500" />

              {/* Canvas viewport */}
              <div className={`overflow-hidden bg-black flex items-center justify-center ${
                activeDevice?.shape === 'round' ? 'rounded-full' : 'rounded-[32px]'
              }`} style={{ width: 260, height: 290 }}>
                <canvas
                  ref={canvasRef}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Active Model Tag */}
            <div className="w-full mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Target: <strong className="text-white">{activeDevice?.model_name || 'Smartwatch'}</strong></span>
              <span className="text-zinc-500">{activeDevice?.companion_app.split(':')[0]}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dial Customization Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">
            {[
              { id: 'style', label: 'Clock & Style', icon: Clock },
              { id: 'colors', label: 'Palette', icon: Palette },
              { id: 'background', label: 'Wallpaper', icon: Upload },
              { id: 'widgets', label: 'Widgets', icon: Layers },
              { id: 'export', label: 'App Guide', icon: Smartphone },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: CLOCK & STYLE */}
          {activeTab === 'style' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">1. Dial Mode & Placement</h3>

              {/* Analog vs Digital */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateDraft({ style: 'digital' })}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    draft.style === 'digital'
                      ? 'bg-zinc-800 border-red-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <strong className="block text-sm">Digital Display</strong>
                  <span className="text-xs text-zinc-500">Numeric bold OLED readouts</span>
                </button>
                <button
                  onClick={() => updateDraft({ style: 'analog' })}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    draft.style === 'analog'
                      ? 'bg-zinc-800 border-red-500 text-white'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <strong className="block text-sm">Analog Chronograph</strong>
                  <span className="text-xs text-zinc-500">Classic mechanical watch hands</span>
                </button>
              </div>

              {/* Time Format */}
              {draft.style === 'digital' && (
                <div className="space-y-3 pt-3 border-t border-zinc-800">
                  <span className="text-xs font-mono text-zinc-400 block">Time Format & Position</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateDraft({ time_format: '24h' })}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        draft.time_format === '24h' ? 'bg-red-600/20 text-red-300 border-red-500/40' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      24-Hour (14:45)
                    </button>
                    <button
                      onClick={() => updateDraft({ time_format: '12h' })}
                      className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                        draft.time_format === '12h' ? 'bg-red-600/20 text-red-300 border-red-500/40' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      12-Hour (02:45 PM)
                    </button>
                  </div>

                  {/* Position */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {(['top', 'center', 'bottom'] as const).map(pos => (
                      <button
                        key={pos}
                        onClick={() => updateDraft({ clock_position: pos })}
                        className={`py-2 rounded-xl text-xs font-semibold capitalize border cursor-pointer ${
                          draft.clock_position === pos ? 'bg-zinc-800 text-white border-red-500' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {pos} Position
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Templates */}
              <div className="space-y-3 pt-3 border-t border-zinc-800">
                <span className="text-xs font-mono text-zinc-400 block">Or Pick a Curated Theme:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {templatesList.map(tpl => (
                    <button
                      key={tpl.name}
                      onClick={() =>
                        updateDraft({
                          name: tpl.name,
                          theme: tpl.theme as any,
                          style: tpl.style as any,
                          primary_color: tpl.primary,
                          secondary_color: tpl.secondary,
                          accent_color: tpl.accent,
                        })
                      }
                      className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 text-left text-xs transition-all cursor-pointer"
                    >
                      <strong className="block text-zinc-200 truncate">{tpl.name}</strong>
                      <div className="flex gap-1.5 mt-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: tpl.primary }} />
                        <span className="w-3 h-3 rounded-full" style={{ background: tpl.accent }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PALETTE */}
          {activeTab === 'colors' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">2. Color Customization</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1.5">Primary Clock Accent:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draft.primary_color}
                      onChange={e => updateDraft({ primary_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={draft.primary_color}
                      onChange={e => updateDraft({ primary_color: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1.5">Accent & Hands Color:</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={draft.accent_color}
                      onChange={e => updateDraft({ accent_color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={draft.accent_color}
                      onChange={e => updateDraft({ accent_color: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WALLPAPER */}
          {activeTab === 'background' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">3. Custom Background Image</h3>

              <div className="p-8 border-2 border-dashed border-zinc-800 hover:border-red-500/50 rounded-3xl text-center space-y-3 cursor-pointer transition-all bg-zinc-950/40"
                   onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-red-500 mx-auto" />
                <div>
                  <p className="text-sm font-bold text-white">Click to Upload Wallpaper</p>
                  <p className="text-xs text-zinc-500 mt-0.5">PNG or JPG (Scaled to {draft.resolution_width}x{draft.resolution_height})</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {draft.background_image_data && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-300">Custom Photo Active</span>
                  <button
                    onClick={() => updateDraft({ background_type: 'gradient', background_image_data: null })}
                    className="text-xs text-red-400 hover:underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WIDGETS */}
          {activeTab === 'widgets' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">4. Complication Widgets</h3>

              <div className="space-y-2">
                {[
                  { key: 'show_steps', label: 'Daily Steps Counter', icon: '👟' },
                  { key: 'show_heart_rate', label: 'Live Heart Rate (BPM)', icon: '♥' },
                  { key: 'show_battery', label: 'Battery Percentage', icon: '⚡' },
                  { key: 'show_date', label: 'Calendar Date', icon: '📅' },
                  { key: 'show_seconds', label: 'Seconds Hand / Indicator', icon: '⏱' },
                ].map(item => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 cursor-pointer hover:bg-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 text-xs text-white">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={(draft as any)[item.key]}
                      onChange={e => updateDraft({ [item.key]: e.target.checked })}
                      className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: APP GUIDE */}
          {activeTab === 'export' && (
            <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                5. How to Transfer to {activeDevice?.model_name || 'Your Watch'}
              </h3>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Official Mobile App:</span>
                  <strong className="text-white">{activeDevice?.companion_app || 'Official App'}</strong>
                </div>

                <div className="space-y-2">
                  {activeDevice?.app_guide_steps.map((step, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                <strong>Why Companion App is Required:</strong> Watch manufacturers require their official cloud compiler to generate the signed binary dial. WristOS exports the exact resolution PNG so your wallpaper fits with zero distortion.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
