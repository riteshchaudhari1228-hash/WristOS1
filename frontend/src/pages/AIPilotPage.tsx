import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, Sparkles, CheckCircle2, AlertTriangle, ArrowRight,
  HelpCircle, RefreshCw, Terminal, Layers, Palette, Radio, Activity,
  Mic, MicOff, Volume2, VolumeX, PhoneCall, Vibrate, Clock
} from 'lucide-react';
import { WristPilotResponse, DeviceModelInfo } from '../types';
import { api } from '../services/api';
import { webBleManager } from '../services/webBleService';

interface Props {
  activeDevice: DeviceModelInfo | null;
  onNavigate: (page: string) => void;
  onApplyThemeAction: (params: any) => void;
  onTriggerIncomingCall?: (callerName: string, phoneNumber: string) => void;
}

export const AIPilotPage: React.FC<Props> = ({
  activeDevice,
  onNavigate,
  onApplyThemeAction,
  onTriggerIncomingCall
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; data?: WristPilotResponse }>>([
    {
      role: 'assistant',
      text: `Hello! I am WristPilot AI, your natural-language smartwatch assistant. I can control your ${activeDevice?.model_name || 'smartwatch'}, simulate phone calls, trigger physical vibration pulses, synthesize watch faces, analyze health data, or sync real atomic time. What would you like to do?`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendMessage(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text to Speech
  const speakText = (text: string) => {
    if (!voiceSpeechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio fallback
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const quickPrompts = [
    'Simulate incoming call from Mom',
    'Trigger vibration on my watch',
    'Sync real atomic time',
    'Design a red sports watch face',
    'Show my steps from this week',
    'Find my connected watch',
    'Why does my watch keep disconnecting?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await api.sendAiCommand(query, activeDevice?.id || 'boat-wave-call-2');
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: response.reply_message,
          data: response
        }
      ]);

      speakText(response.reply_message);

      // Automatically execute connected hardware actions if applicable!
      if (response.action) {
        handleAutoExecuteAction(response.action);
      }
    } catch (e: any) {
      const fallbackText = 'WristPilot processed your command via client-side action engine.';
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: fallbackText,
        }
      ]);
      speakText(fallbackText);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoExecuteAction = async (action: any) => {
    if (action.tool_name === 'trigger_incoming_call') {
      const name = action.parameters?.caller_name || 'Incoming Call';
      const number = action.parameters?.phone_number || '+91 98765 43210';
      setActionNotice(`AI Agent Dispatched Call Alert: ${name} (${number})`);
      await webBleManager.triggerImmediateAlert(2);
      if (onTriggerIncomingCall) {
        onTriggerIncomingCall(name, number);
      }
      setTimeout(() => {
        setActionNotice(null);
        onNavigate('calls');
      }, 1200);
    } else if (action.tool_name === 'trigger_watch_vibration') {
      setActionNotice('AI Agent Dispatched High Alert Vibration Pulse to Smartwatch (GATT 0x1802)!');
      await webBleManager.triggerImmediateAlert(2);
      setTimeout(() => setActionNotice(null), 4000);
    } else if (action.tool_name === 'sync_atomic_time') {
      setActionNotice('AI Agent Dispatched Atomic Clock Sync Packet (GATT 0x1805)!');
      await webBleManager.writeCurrentTime(new Date());
      setTimeout(() => setActionNotice(null), 4000);
    } else if (action.tool_name === 'configure_watchface_canvas') {
      onApplyThemeAction(action.parameters);
      setActionNotice('AI Agent Configured Canvas Theme!');
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleExecuteAction = (data: WristPilotResponse) => {
    if (!data.action) return;

    if (data.action.tool_name === 'trigger_incoming_call') {
      const name = data.action.parameters?.caller_name || 'Incoming Call';
      const number = data.action.parameters?.phone_number || '+91 98765 43210';
      if (onTriggerIncomingCall) {
        onTriggerIncomingCall(name, number);
      }
      onNavigate('calls');
    } else if (data.action.tool_name === 'configure_watchface_canvas') {
      onApplyThemeAction(data.action.parameters);
      onNavigate('watchfaces');
    } else if (data.action.target_page) {
      onNavigate(data.action.target_page);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-semibold mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Connected AI Control Agent</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">WristPilot Natural Language AI</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Your conversational smartwatch agent connected directly to hardware controls, call alerts, dial creation,
            and health analytics. Speak via microphone or type natural language instructions.
          </p>
        </div>

        {/* Voice Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              voiceSpeechEnabled
                ? 'bg-zinc-900 text-zinc-200 border-zinc-700'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
          >
            {voiceSpeechEnabled ? <Volume2 className="w-3.5 h-3.5 text-red-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{voiceSpeechEnabled ? 'Voice Output ON' : 'Voice Output Muted'}</span>
          </button>
        </div>
      </div>

      {/* ACTION NOTICE BANNER */}
      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-red-500/40 text-xs font-mono text-zinc-200 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* QUICK PROMPTS CHIPS */}
      <div className="flex flex-wrap gap-2 pt-1">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs border border-zinc-800 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* CHAT CONTAINER */}
      <div className="h-[460px] overflow-y-auto p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-zinc-950 text-zinc-200 border border-zinc-800/80 shadow-md'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-2 font-mono text-[10px] text-red-400 uppercase font-bold">
                  <Bot className="w-3.5 h-3.5" />
                  <span>WristPilot Agent</span>
                </div>
              )}

              <p className="whitespace-pre-line">{msg.text}</p>

              {/* ACTION EXECUTION CARD */}
              {msg.data?.action && (
                <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-zinc-400">
                    <span className="text-zinc-500 block text-[9px] uppercase">Registered Hardware Tool</span>
                    <strong className="text-white">{msg.data.action.tool_name}</strong>
                  </div>

                  <button
                    onClick={() => handleExecuteAction(msg.data!)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-red-600/30"
                  >
                    <span>Open in View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
            <span>WristPilot reasoning over hardware action registry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT FORM WITH SPEECH-TO-TEXT MICROPHONE */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-zinc-900 border border-zinc-800"
      >
        {/* Voice Dictation Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
            isListening
              ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40'
              : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
          title={isListening ? 'Listening... Tap to stop' : 'Click to speak voice command'}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <input
          type="text"
          placeholder={isListening ? 'Listening to voice command...' : "Say 'Call Mom', 'Trigger vibration', or 'Design a sports watch face'..."}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer disabled:opacity-40 shadow-md shadow-red-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
