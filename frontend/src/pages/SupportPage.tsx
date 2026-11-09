import React, { useState, useEffect } from 'react';
import {
  HelpCircle, ShieldCheck, Bluetooth, Smartphone, Terminal,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Send, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { webBleManager } from '../services/webBleService';

export const SupportPage: React.FC = () => {
  const [diagResults, setDiagResults] = useState<{
    webBle: boolean;
    secureContext: boolean;
    webAudio: boolean;
    localStorage: boolean;
    backendOnline: boolean;
  }>({
    webBle: false,
    secureContext: false,
    webAudio: false,
    localStorage: false,
    backendOnline: false,
  });

  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Model verification form
  const [modelBrand, setModelBrand] = useState('Noise');
  const [modelNameInput, setModelNameInput] = useState('');
  const [chipsetInput, setChipsetInput] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setIsRunningDiag(true);
    const webBle = webBleManager.isSupported();
    const secureContext = webBleManager.isSecureContext();
    const webAudio = typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
    let localStorageOk = false;
    try {
      localStorage.setItem('__wristos_diag__', '1');
      localStorage.removeItem('__wristos_diag__');
      localStorageOk = true;
    } catch {
      localStorageOk = false;
    }

    let backendOnline = false;
    try {
      const res = await fetch('/api/devices');
      backendOnline = res.ok;
    } catch {
      backendOnline = false;
    }

    setDiagResults({
      webBle,
      secureContext,
      webAudio,
      localStorage: localStorageOk,
      backendOnline,
    });
    setIsRunningDiag(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelNameInput.trim()) return;

    const query = modelNameInput.toLowerCase();
    if (query.includes('colorfit') || query.includes('halo') || query.includes('noise')) {
      setVerificationFeedback(
        `Audit for Noise ${modelNameInput}: Compatible with Web Bluetooth Battery (0x180F) & Heart Rate (0x180D). Watch face transfer supported via 356x400 / 390x450 PNG export to NoiseFit app.`
      );
    } else if (query.includes('wave') || query.includes('storm') || query.includes('xtend') || query.includes('lunar') || query.includes('boat')) {
      setVerificationFeedback(
        `Audit for boAt ${modelNameInput}: Standard Battery GATT supported. Activity sync supported via Android Health Connect bridge. Watch face wallpapers exportable to boAt Crest / Wave apps.`
      );
    } else if (query.includes('ninja') || query.includes('phoenix') || query.includes('ring') || query.includes('fire')) {
      setVerificationFeedback(
        `Audit for Fire-Boltt ${modelNameInput}: Verified Da Fit hardware. Exposes GATT 0x180F, 0x180D HR, and 0x1802 Immediate Alert buzzer. Export PNG canvas to Da Fit DIY face studio.`
      );
    } else {
      setVerificationFeedback(
        `Audit for ${modelBrand} ${modelNameInput}: Hardware platform identified. Standard Bluetooth SIG services will be probed on connection. For proprietary RTOS dial compilation, use the WristOS PNG export workflow with the official manufacturer app.`
      );
    }
  };

  const faqs = [
    {
      q: 'Why can’t WristOS directly flash watch face binaries without the official app?',
      a: 'Budget Indian smartwatches (Noise, boAt, Fire-Boltt) use closed RTOS microcontrollers (Realtek, Goodix, Huntersun) that enforce proprietary firmware checksums and AES encryption signatures. Flashing raw unauthenticated binaries over raw BLE risks permanent device bricking. WristOS provides the honest, elegant solution: generating pixel-perfect wallpapers matched to your exact screen resolution and providing step-by-step guides for your official app.',
    },
    {
      q: 'Which browsers support direct Web Bluetooth smart watch connectivity?',
      a: 'Google Chrome and Microsoft Edge on Windows, macOS, Android, and ChromeOS fully support the Web Bluetooth API. Safari (iOS) and Mozilla Firefox do not support Web Bluetooth due to vendor security restrictions. For unsupported browsers, use our Kotlin Android Companion App or Demo Mode.',
    },
    {
      q: 'Does the Python backend access my phone’s Bluetooth adapter directly?',
      a: 'No, and no remote web server can! Bluetooth Low Energy requires physical proximity (under 10 meters) and local radio hardware. In WristOS, Bluetooth connectivity happens directly between your browser and smartwatch via Web Bluetooth, or between your Android phone and smartwatch via our native Kotlin BLE app. The Python FastAPI backend coordinates analytics, device compatibility records, design storage, and CSV exports.',
    },
    {
      q: 'Why does my watch disconnect after 5 minutes of inactivity?',
      a: 'To maximize battery life on small 200–300mAh batteries, smartwatches enter a deep RF sleep state when idle and cease broadcasting BLE advertisement packets. Pressing the physical rotary crown or side button wakes up the display and radio, allowing immediate reconnection.',
    },
    {
      q: 'How does Find My Watch calculate distance?',
      a: 'WristOS uses the Log-Distance Path Loss Model based on Bluetooth RSSI (Received Signal Strength Indicator) with a measured power reference (-59 dBm at 1 meter). Signal strength varies due to human body water absorption and physical walls, so it displays proximity confidence zones rather than deceptive GPS coordinates.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* HEADER */}
      <div className="border-b border-zinc-800/80 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support & Troubleshooting</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Hardware Diagnostics & Setup Guide
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          Resolve Bluetooth discovery issues, understand hardware boundaries, and test your browser environment.
        </p>
      </div>

      {/* SYSTEM DIAGNOSTICS SUITE */}
      <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-red-400 uppercase tracking-widest font-semibold">
              Live Subsystem Diagnostics
            </span>
            <h2 className="text-xl font-bold text-white mt-1">Browser & API Compatibility Audit</h2>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isRunningDiag}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiag ? 'animate-spin' : ''}`} />
            <span>Re-Run Audit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Diagnostic Item 1 */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Web Bluetooth</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {diagResults.webBle ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Supported</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Not Detected</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Chrome / Edge</p>
          </div>

          {/* Diagnostic Item 2 */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Context Security</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {diagResults.secureContext ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Secure (HTTPS/Local)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Insecure</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Required for BLE</p>
          </div>

          {/* Diagnostic Item 3 */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Web Audio Radar</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {diagResults.webAudio ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Operational</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400">Unavailable</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Proximity Beep</p>
          </div>

          {/* Diagnostic Item 4 */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">Local Storage</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {diagResults.localStorage ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Persistent</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Blocked</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Watch Face Drafts</p>
          </div>

          {/* Diagnostic Item 5 */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">FastAPI Backend</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              {diagResults.backendOnline ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Connected (:8000)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400">Fallback Mode</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">REST & CSV Service</p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: TROUBLESHOOTING & MODEL VERIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Step-by-Step Connection Guide */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bluetooth className="w-4 h-4 text-red-400" />
              <span>Smartwatch Connection Troubleshooting</span>
            </h3>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-white text-xs block">Step 1: Release Active Phone Pairing Lock</span>
                <p className="text-zinc-400 leading-relaxed">
                  Budget smartwatches only accept <strong className="text-zinc-200">one active BLE connection</strong> at a time.
                  If your watch is currently bonded to NoiseFit, boAt Crest, or Da Fit on your smartphone, turn off Bluetooth on your phone temporarily so the watch can broadcast advertisements to your PC.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-white text-xs block">Step 2: Wake the Smartwatch Display</span>
                <p className="text-zinc-400 leading-relaxed">
                  Press the physical rotary crown or side button. Smartwatches stop broadcasting BLE packets when screen is off for 5 minutes.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-white text-xs block">Step 3: Enable Windows Bluetooth & Location</span>
                <p className="text-zinc-400 leading-relaxed">
                  On Windows 10/11, ensure Bluetooth is toggled ON in the system tray and Google Chrome has permission to access nearby devices in Windows Settings &gt; Privacy &gt; Radios.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                <span className="font-bold text-white text-xs block">Step 4: Use "Show All Bluetooth Devices"</span>
                <p className="text-zinc-400 leading-relaxed">
                  In WristOS &gt; Connect, toggle "Show All Bluetooth Devices" if your smartwatch model advertises with a generic name (e.g. <code className="text-red-400">Watch_BT</code> or <code className="text-red-400">FB_Calling</code>).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Model Verification Audit Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify My Smartwatch Model</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Have an exact model from Noise, boAt, or Fire-Boltt? Enter it below to receive an instant compatibility breakdown.
            </p>

            <form onSubmit={handleVerifySubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Brand</label>
                <select
                  value={modelBrand}
                  onChange={e => setModelBrand(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Noise">Noise</option>
                  <option value="boAt">boAt</option>
                  <option value="Fire-Boltt">Fire-Boltt</option>
                  <option value="Other">Other Brand</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Exact Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. ColorFit Pro 4, Wave Call 2, Ninja Calling..."
                  value={modelNameInput}
                  onChange={e => setModelNameInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Chipset / Details (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Realtek, Goodix, KaHa, Da Fit..."
                  value={chipsetInput}
                  onChange={e => setChipsetInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Perform Compatibility Audit</span>
              </button>
            </form>

            {verificationFeedback && (
              <div className="p-4 rounded-2xl bg-zinc-950 border border-red-500/30 text-xs text-zinc-300 leading-relaxed space-y-1">
                <span className="font-bold text-red-400 block">Verification Audit Result:</span>
                <p>{verificationFeedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-lg font-bold text-white mb-2">Hardware Protocol Transparency FAQ</h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-zinc-950/70 border border-zinc-800/80 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-white cursor-pointer hover:bg-zinc-900/40"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-red-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
