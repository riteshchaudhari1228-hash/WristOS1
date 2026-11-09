import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, PhoneOff,
  User, Volume2, VolumeX, Mic, MicOff, Clock, ShieldCheck, Sparkles,
  Play, Plus, CheckCircle2, AlertTriangle, Radio, Vibrate, Bot
} from 'lucide-react';
import { DeviceModelInfo, ConnectionMode } from '../types';
import { webBleManager } from '../services/webBleService';

interface Props {
  activeDevice: DeviceModelInfo | null;
  connectionMode: ConnectionMode;
  onNavigateToAi?: () => void;
  incomingCallTrigger?: { name: string; number: string; timestamp: number } | null;
}

export interface CallLogItem {
  id: string;
  name: string;
  number: string;
  type: 'incoming' | 'outgoing' | 'missed';
  time: string;
  duration?: string;
}

const DEFAULT_CALL_LOGS: CallLogItem[] = [
  { id: 'c1', name: 'Mom', number: '+91 98200 11223', type: 'incoming', time: '10:14 AM', duration: '2m 45s' },
  { id: 'c2', name: 'Work / Office', number: '+91 022 6677 8899', type: 'missed', time: '09:30 AM' },
  { id: 'c3', name: 'Dad', number: '+91 98200 44556', type: 'outgoing', time: 'Yesterday', duration: '5m 12s' },
  { id: 'c4', name: 'Dr. Sharma', number: '+91 99887 76655', type: 'incoming', time: 'Oct 29', duration: '1m 20s' },
];

export const CallHubPage: React.FC<Props> = ({
  activeDevice,
  connectionMode,
  onNavigateToAi,
  incomingCallTrigger
}) => {
  const [callState, setCallState] = useState<'idle' | 'incoming' | 'active'>('idle');
  const [callerName, setCallerName] = useState('Mom');
  const [callerNumber, setCallerNumber] = useState('+91 98200 11223');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [dialedInput, setDialedInput] = useState('');
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(DEFAULT_CALL_LOGS);
  const [feedback, setFeedback] = useState<string | null>(null);

  const ringAudioRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode; ctx?: AudioContext } | null>(null);

  // Play realistic telephone ringtone via Web Audio API
  const startRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      // North American / Indian standard dual telephone ring (440Hz + 480Hz)
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.setValueAtTime(480, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      ringAudioRef.current = { ctx, osc1, osc2, gain };
    } catch (e) {
      console.warn('Web Audio ringtone not available:', e);
    }
  };

  const stopRingtone = () => {
    try {
      if (ringAudioRef.current) {
        ringAudioRef.current.osc1?.stop();
        ringAudioRef.current.osc2?.stop();
        ringAudioRef.current.ctx?.close();
        ringAudioRef.current = null;
      }
    } catch (e) {
      // Cleanup
    }
  };

  // Play tactile DTMF tone on keypad button tap
  const playDtmfTone = (freq1: number, freq2: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq2, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  };

  // Call duration timer
  useEffect(() => {
    let interval: any;
    if (callState === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopRingtone();
    };
  }, []);

  // Format seconds to MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Simulate or receive an incoming call
  const triggerSimulatedCall = async (name: string, number: string) => {
    setCallerName(name);
    setCallerNumber(number);
    setCallState('incoming');
    startRingtone();

    // Trigger physical watch buzzer/vibration via Bluetooth GATT 0x1802
    await webBleManager.triggerImmediateAlert(2);

    webBleManager.addPacketLog({
      type: 'TX',
      serviceName: 'Phone Relay (HFP / GATT)',
      characteristicUuid: '0x1802 (Alert)',
      payloadHex: `CALL_INCOMING: "${name}" <${number}>`,
      description: `Incoming phone call alert dispatched to ${activeDevice?.model_name || 'smartwatch'}.`,
      hardwareResponse: 'GATT_ALERT_RINGING',
    });

    setFeedback(`Incoming call from ${name} ringing on smartwatch!`);
  };

  // React to incoming call trigger dispatched from AI Agent or global controls
  useEffect(() => {
    if (incomingCallTrigger && incomingCallTrigger.name) {
      triggerSimulatedCall(incomingCallTrigger.name, incomingCallTrigger.number);
    }
  }, [incomingCallTrigger]);

  // Answer call
  const handleAnswerCall = () => {
    stopRingtone();
    setCallState('active');
    setFeedback(`Call connected with ${callerName}. Audio relay active.`);
  };

  // Reject / Hang up call
  const handleHangUp = () => {
    stopRingtone();
    const prevDuration = callDuration;
    const isMissed = callState === 'incoming';

    setCallLogs(prev => [
      {
        id: `c-${Date.now()}`,
        name: callerName,
        number: callerNumber,
        type: isMissed ? 'missed' : 'incoming',
        time: 'Just now',
        duration: isMissed ? undefined : formatTimer(prevDuration),
      },
      ...prev,
    ]);

    setCallState('idle');
    setFeedback(isMissed ? `Call from ${callerName} rejected.` : `Call ended (${formatTimer(prevDuration)}).`);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Keypad click
  const handleKeypadPress = (digit: string, f1: number, f2: number) => {
    playDtmfTone(f1, f2);
    setDialedInput(prev => prev + digit);
  };

  // Dial out from keypad
  const handleDialOut = () => {
    if (!dialedInput.trim()) return;
    const num = dialedInput.trim();
    setCallerName('Outgoing Call');
    setCallerNumber(num);
    setCallState('active');

    setCallLogs(prev => [
      {
        id: `c-${Date.now()}`,
        name: 'Outgoing Call',
        number: num,
        type: 'outgoing',
        time: 'Just now',
      },
      ...prev,
    ]);

    setFeedback(`Dialing ${num} to ${activeDevice?.model_name || 'smartwatch'}...`);
    setDialedInput('');
  };

  // DTMF keypad grid frequencies (ITU-T recommendation Q.23)
  const keypad = [
    { key: '1', sub: '', f1: 697, f2: 1209 },
    { key: '2', sub: 'ABC', f1: 697, f2: 1336 },
    { key: '3', sub: 'DEF', f1: 697, f2: 1477 },
    { key: '4', sub: 'GHI', f1: 770, f2: 1209 },
    { key: '5', sub: 'JKL', f1: 770, f2: 1336 },
    { key: '6', sub: 'MNO', f1: 770, f2: 1477 },
    { key: '7', sub: 'PQRS', f1: 852, f2: 1209 },
    { key: '8', sub: 'TUV', f1: 852, f2: 1336 },
    { key: '9', sub: 'WXYZ', f1: 852, f2: 1477 },
    { key: '*', sub: '', f1: 941, f2: 1209 },
    { key: '0', sub: '+', f1: 941, f2: 1336 },
    { key: '#', sub: '', f1: 941, f2: 1477 },
  ];

  const speedDialContacts = [
    { name: 'Mom', number: '+91 98200 11223', icon: '❤️' },
    { name: 'Dad', number: '+91 98200 44556', icon: '👔' },
    { name: 'Work / Boss', number: '+91 022 6677 8899', icon: '💼' },
    { name: 'Dr. Sharma', number: '+91 99887 76655', icon: '🩺' },
    { name: 'College Admin', number: '+91 022 2414 5500', icon: '🎓' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-2">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Smartwatch Bluetooth Calling Hub</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Call Manager & Phone Relay</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Manage incoming caller ID, dial numbers directly, trigger watch vibration motors on incoming calls,
            and inspect dual-mode Bluetooth Hands-Free Profile (HFP) calling telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerSimulatedCall('Mom', '+91 98200 11223')}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <PhoneIncoming className="w-4 h-4" />
            <span>Simulate Incoming Call</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-red-500/40 text-xs font-mono text-zinc-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-red-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <span className="text-[10px] text-zinc-500">BLUETOOTH CALL RELAY ACTIVE</span>
        </div>
      )}

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: ACTIVE CALL SCREEN & VIRTUAL SMARTWATCH CALL DISPLAY */}
        <div className="lg:col-span-6 space-y-6">
          {/* Active Call Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 shadow-2xl relative overflow-hidden">
            {/* Background ambient ring glow */}
            {callState !== 'idle' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 via-rose-600/5 to-transparent pointer-events-none animate-pulse" />
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${callState === 'active' ? 'bg-emerald-400 animate-pulse' : callState === 'incoming' ? 'bg-amber-400 animate-ping' : 'bg-zinc-600'}`} />
                {callState === 'active' ? 'Call in Progress' : callState === 'incoming' ? 'Incoming Bluetooth Call...' : 'Smartwatch Calling Ready'}
              </span>
              <span className="text-xs font-mono text-red-400 font-bold">
                {activeDevice?.model_name || 'boAt Wave Call 2'}
              </span>
            </div>

            {/* CALL STATUS BODY */}
            {callState === 'idle' ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center mx-auto text-zinc-500 shadow-inner">
                  <Phone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No Active Calls</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Smartwatch is paired and monitoring Bluetooth Hands-Free Profile (HFP). Tap a speed dial contact or simulate an incoming call above.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => triggerSimulatedCall('College Office', '+91 022 2414 5500')}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition-all cursor-pointer"
                  >
                    Test Call: College Admin
                  </button>
                  <button
                    onClick={() => triggerSimulatedCall('Work / Boss', '+91 022 6677 8899')}
                    className="px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition-all cursor-pointer"
                  >
                    Test Call: Work
                  </button>
                </div>
              </div>
            ) : (
              // ACTIVE OR INCOMING CALL VIEW
              <div className="py-6 text-center space-y-6 relative z-10">
                {/* Caller Avatar */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className={`w-full h-full rounded-full bg-zinc-950 border-4 ${callState === 'incoming' ? 'border-amber-400 animate-pulse' : 'border-emerald-500'} flex items-center justify-center text-white text-3xl font-black shadow-2xl`}>
                    {callerName.charAt(0)}
                  </div>
                  {callState === 'incoming' && (
                    <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-amber-500 text-black animate-bounce shadow-lg">
                      <Vibrate className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{callerName}</h2>
                  <p className="text-sm font-mono text-zinc-400 mt-0.5">{callerNumber}</p>
                  <p className="text-xs font-mono text-red-400 font-bold mt-2">
                    {callState === 'incoming' ? 'RINGING ON SMARTWATCH DISPLAY...' : `CALL DURATION: ${formatTimer(callDuration)}`}
                  </p>
                </div>

                {/* Animated Voice Audio Waves during Active Call */}
                {callState === 'active' && (
                  <div className="flex items-center justify-center gap-1.5 h-8">
                    {[40, 70, 95, 60, 80, 50, 85, 30, 90, 65, 45].map((height, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                        style={{
                          height: `${isMuted ? 4 : height}%`,
                          animationDelay: `${idx * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Call Control Buttons */}
                <div className="pt-2 flex items-center justify-center gap-4">
                  {callState === 'incoming' ? (
                    <>
                      {/* Reject Button */}
                      <button
                        onClick={handleHangUp}
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all cursor-pointer hover:scale-105"
                        title="Decline Call"
                      >
                        <PhoneOff className="w-6 h-6" />
                      </button>

                      {/* Answer Button */}
                      <button
                        onClick={handleAnswerCall}
                        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-all cursor-pointer hover:scale-105 animate-pulse"
                        title="Answer Call"
                      >
                        <PhoneCall className="w-6 h-6" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Mute Button */}
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer ${isMuted ? 'bg-red-950 text-red-400 border-red-500' : 'bg-zinc-950 text-zinc-300 border-zinc-800'}`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      {/* Hang Up Button */}
                      <button
                        onClick={handleHangUp}
                        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-all cursor-pointer hover:scale-105"
                        title="End Call"
                      >
                        <PhoneOff className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Speed Dial Contacts */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Speed Dial Contacts</span>
              <span className="text-xs text-red-400 font-semibold">1-Tap Dial</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {speedDialContacts.map(contact => (
                <div
                  key={contact.name}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between hover:border-red-500/40 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{contact.icon}</span>
                    <div>
                      <strong className="text-white text-xs block">{contact.name}</strong>
                      <span className="text-[10px] text-zinc-500 font-mono">{contact.number}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerSimulatedCall(contact.name, contact.number)}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-red-600 hover:text-white text-zinc-400 transition-colors cursor-pointer"
                    title={`Call ${contact.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TACTILE DIALPAD & CALL HISTORY */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tactile Keypad */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Bluetooth Phone Dialer</span>
              <span className="text-xs text-zinc-500 font-mono">DTMF Dual-Tone</span>
            </h3>

            {/* Dialed Number Display */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <input
                type="text"
                placeholder="Enter number or tap keys..."
                value={dialedInput}
                onChange={e => setDialedInput(e.target.value)}
                className="w-full bg-transparent text-xl font-mono font-bold text-white placeholder-zinc-600 focus:outline-none"
              />
              {dialedInput && (
                <button
                  onClick={() => setDialedInput('')}
                  className="text-xs font-mono text-zinc-500 hover:text-white px-2 cursor-pointer"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* 12-Key Grid */}
            <div className="grid grid-cols-3 gap-3">
              {keypad.map(btn => (
                <button
                  key={btn.key}
                  onClick={() => handleKeypadPress(btn.key, btn.f1, btn.f2)}
                  className="p-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800/80 active:scale-95 transition-all text-center cursor-pointer group"
                >
                  <span className="text-lg font-bold text-white block group-hover:text-red-400 transition-colors">
                    {btn.key}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-widest h-3">
                    {btn.sub}
                  </span>
                </button>
              ))}
            </div>

            {/* Big Green Dial Button */}
            <button
              onClick={handleDialOut}
              disabled={!dialedInput.trim()}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-40"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Dial Call to Smartwatch</span>
            </button>
          </div>

          {/* Call History Logs */}
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Call History Log</span>
              <span className="text-xs text-zinc-500">{callLogs.length} Records</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {callLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    {log.type === 'incoming' ? (
                      <PhoneIncoming className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : log.type === 'missed' ? (
                      <PhoneMissed className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <PhoneOutgoing className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                    <div>
                      <strong className="text-zinc-200 block">{log.name}</strong>
                      <span className="text-[10px] text-zinc-500">{log.number}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-zinc-400 text-[11px] block">{log.time}</span>
                    {log.duration && (
                      <span className="text-[10px] text-emerald-400">{log.duration}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BLUETOOTH CALLING HARDWARE ARCHITECTURE EXPLANATION */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <span>How Smartwatch Bluetooth Calling Works (Hardware Architecture)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400 leading-relaxed font-mono">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <strong className="text-white text-xs block">Channel 1: Bluetooth Low Energy (BLE GATT)</strong>
            <p>
              Transmits caller name, contact numbers, and notifications using standard GATT packets.
              WristOS sends immediate vibration pulses (`0x1802 Alert Level 2`) to make the physical watch buzz on incoming calls.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <strong className="text-white text-xs block">Channel 2: Classic Bluetooth Audio (HFP Hands-Free)</strong>
            <p>
              Smartwatches with Bluetooth calling (e.g. boAt Wave Call 2, Storm Call) have a dedicated speaker and microphone chip (such as JL / Actions DSP) that bonds directly to your phone/PC as an audio headset for voice calls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
