import React, { useState, useEffect } from 'react';
import {
  Zap, Clock, Sparkles, CheckCircle2, ChevronRight, Check,
  BookOpen, Briefcase, Dumbbell, Compass, Moon, Plus, Bell
} from 'lucide-react';
import { AdaptiveThemePreset, RoutineItem, WatchFaceDesign } from '../types';
import { VirtualWatchPreview } from '../components/VirtualWatchPreview';
import { api } from '../services/api';

interface Props {
  activeDesign: WatchFaceDesign;
  onUpdateDesign: (design: WatchFaceDesign) => void;
  onNavigate: (page: string) => void;
}

export const AutomationsPage: React.FC<Props> = ({
  activeDesign,
  onUpdateDesign,
  onNavigate
}) => {
  const [presets, setPresets] = useState<AdaptiveThemePreset[]>([]);
  const [selectedContext, setSelectedContext] = useState<string>('College');
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // New routine form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newContext, setNewContext] = useState('College');

  useEffect(() => {
    api.getAdaptiveThemes().then(setPresets);
    api.getRoutines().then(setRoutines);
  }, []);

  const currentPreset = presets.find(p => p.context_name.toLowerCase() === selectedContext.toLowerCase()) || presets[0];

  const handleApplyContext = (preset: AdaptiveThemePreset) => {
    const updated: WatchFaceDesign = {
      ...activeDesign,
      name: `${preset.context_name} Adaptive`,
      theme: preset.recommended_theme as any,
      style: preset.recommended_style as any,
      primary_color: preset.palette.primary,
      secondary_color: preset.palette.secondary,
      accent_color: preset.palette.accent || '#00FF88'
    };
    onUpdateDesign(updated);
    setAppliedNotification(`Applied context '${preset.context_name}'. Watch face updated and routine active.`);
    setTimeout(() => setAppliedNotification(null), 4000);
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, is_enabled: !r.is_enabled } : r));
  };

  const handleCreateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newRt: RoutineItem = {
      id: `rt-${Date.now()}`,
      title: newTitle,
      trigger_time: newTime,
      context_name: newContext,
      is_enabled: true,
      actions: [
        `Switch to ${newContext} watch face configuration`,
        'Set vibration alert profile'
      ],
      notes: 'Custom user routine'
    };

    setRoutines(prev => [...prev, newRt]);
    setShowAddModal(false);
    setNewTitle('');
  };

  const getContextIcon = (ctx: string) => {
    switch (ctx.toLowerCase()) {
      case 'college': return <BookOpen className="w-5 h-5 text-sky-400" />;
      case 'work': return <Briefcase className="w-5 h-5 text-amber-400" />;
      case 'workout': return <Dumbbell className="w-5 h-5 text-emerald-400" />;
      case 'travel': return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'night': return <Moon className="w-5 h-5 text-rose-400" />;
      default: return <Zap className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Context-Aware Intelligence
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Adaptive Watch Studio & Routines</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Automatically recommends dials, complications, and smartwatch routines based on your active lifestyle context.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>New Routine</span>
        </button>
      </div>

      {/* APPLIED NOTIFICATION BANNER */}
      {appliedNotification && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-semibold text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{appliedNotification}</span>
          </div>
          <button
            onClick={() => onNavigate('studio')}
            className="text-xs underline hover:text-white"
          >
            Inspect in Studio &rarr;
          </button>
        </div>
      )}

      {/* CONTEXT CHOOSER TABS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['College', 'Work', 'Workout', 'Travel', 'Night'].map(ctx => {
          const isSelected = selectedContext.toLowerCase() === ctx.toLowerCase();
          return (
            <button
              key={ctx}
              onClick={() => setSelectedContext(ctx)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                {getContextIcon(ctx)}
                {isSelected && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
              </div>
              <span className="text-sm font-bold text-white">{ctx}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE CONTEXT DOSSIER */}
      {currentPreset && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Virtual Watch Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full p-6 rounded-3xl glass-panel border border-zinc-800 flex flex-col items-center">
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider mb-4">
                Recommended Dial Preview
              </span>
              <VirtualWatchPreview
                design={{
                  ...activeDesign,
                  theme: currentPreset.recommended_theme as any,
                  style: currentPreset.recommended_style as any,
                  primary_color: currentPreset.palette.primary,
                  secondary_color: currentPreset.palette.secondary,
                  accent_color: currentPreset.palette.accent || '#00FF88'
                }}
                scale={1}
                modeLabel={`${currentPreset.context_name.toUpperCase()} THEME`}
              />
            </div>
          </div>

          {/* Right: Recommendations & Routine */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl glass-panel border border-zinc-800 space-y-5">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">{currentPreset.context_name} Context</span>
                <h3 className="text-xl font-bold text-white mt-1">{currentPreset.display_title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{currentPreset.description}</p>
              </div>

              {/* Recommended complications */}
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Priority Complications</span>
                <div className="flex flex-wrap gap-2">
                  {currentPreset.recommended_complications.map((comp, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggested Routine */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Recommended Routine Behavior
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                  {currentPreset.routine_suggestion}
                </p>
              </div>

              {/* One-Click Apply Context Button */}
              <button
                onClick={() => handleApplyContext(currentPreset)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Apply {currentPreset.context_name} Theme & Activate Routine</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER ROUTINES LIST */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Configured Smartwatch Routines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routines.map(r => (
            <div
              key={r.id}
              className={`p-5 rounded-2xl border transition-all ${
                r.is_enabled ? 'glass-panel border-zinc-800' : 'bg-zinc-900/20 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-cyan-400">{r.trigger_time}</span>
                <button
                  onClick={() => handleToggleRoutine(r.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    r.is_enabled ? 'bg-cyan-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-0.5 ${
                      r.is_enabled ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{r.title}</h4>
              <p className="text-[11px] text-zinc-500 font-mono mb-3">{r.notes}</p>
              <div className="space-y-1 text-[11px] text-zinc-400">
                {r.actions.map((act, i) => (
                  <p key={i}>• {act}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD ROUTINE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Smartwatch Routine</h3>
            <form onSubmit={handleCreateRoutine} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Routine Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Morning Lecture Walk"
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Trigger Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 block mb-1">Lifestyle Context</label>
                <select
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                >
                  <option value="College">College</option>
                  <option value="Work">Work</option>
                  <option value="Workout">Workout</option>
                  <option value="Travel">Travel</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-black text-xs font-bold"
                >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
