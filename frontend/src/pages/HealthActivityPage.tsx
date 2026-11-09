import React, { useState, useEffect } from 'react';
import {
  Activity, Footprints, Flame, Heart, Moon, Download, Calendar,
  TrendingUp, ShieldAlert, CheckCircle2, ArrowUpRight, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { AnalyticsOverview, TodayHealthMetrics } from '../types';
import { api } from '../services/api';

interface Props {
  todayHealth: TodayHealthMetrics;
}

export const HealthActivityPage: React.FC<Props> = ({ todayHealth }) => {
  const [period, setPeriod] = useState<'7_DAYS' | '30_DAYS'>('7_DAYS');
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.getHealthAnalytics(period).then(data => {
      if (mounted) {
        setAnalytics(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [period]);

  const handleDownloadCsv = () => {
    window.open(`/api/health/export-csv?period=${period}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
            Health & Activity Center
          </span>
          <h1 className="text-3xl font-black text-white mt-1">Biometric Analytics & Activity Trends</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Synchronized activity logs from Bluetooth GATT streams and Android Health Connect with transparent data provenance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setPeriod('7_DAYS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                period === '7_DAYS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod('30_DAYS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                period === '30_DAYS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-zinc-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Average Daily Steps</span>
            <Footprints className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {analytics?.avg_daily_steps.toLocaleString() || '9,774'}
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 font-mono flex items-center gap-1">
            <span>97.7% of 10,000 goal</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Average Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {analytics?.avg_heart_rate || 71} <span className="text-xs text-zinc-400">BPM</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2 font-mono">
            Resting Baseline: 62 BPM
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Average Sleep</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {analytics?.avg_sleep_hours || 7.3} <span className="text-xs text-zinc-400">Hours</span>
          </div>
          <p className="text-[11px] text-indigo-300 mt-2 font-mono">
            28% Deep Sleep Architecture
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase">Active Calorie Burn</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {analytics?.total_calories.toLocaleString() || '3,880'} <span className="text-xs text-zinc-400">kcal</span>
          </div>
          <p className="text-[11px] text-amber-400 mt-2 font-mono">
            554 kcal Daily Average
          </p>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Step Cadence History Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Step Cadence History</h3>
              <p className="text-xs text-zinc-400">Daily step accumulation vs 10,000 target</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {todayHealth.data_source_badge}
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            {analytics && analytics.daily_history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.daily_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={10}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#00F2FE' }}
                  />
                  <Bar dataKey="steps" fill="#00F2FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">Loading charts...</div>
            )}
          </div>
        </div>

        {/* Intraday Heart Rate Curve */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-panel border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">24h Heart Rate Zone</h3>
              <p className="text-xs text-zinc-400">Intraday sampling (BPM)</p>
            </div>
            <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>

          <div className="h-64 w-full pt-4">
            {analytics && analytics.heart_rate_samples.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.heart_rate_samples} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="timestamp" stroke="#71717a" fontSize={10} />
                  <YAxis domain={[50, 100]} stroke="#71717a" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#f43f5e' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#hrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-zinc-500">Loading curve...</div>
            )}
          </div>
        </div>
      </div>

      {/* MEDICAL DISCLAIMER BANNER */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400 leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>NON-MEDICAL DISCLAIMER:</strong> {todayHealth.medical_disclaimer}
        </p>
      </div>
    </div>
  );
};
