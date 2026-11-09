import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Activity, 
  ShieldAlert, 
  Radio, 
  BookOpen, 
  Sliders, 
  RotateCcw, 
  AlertTriangle,
  Flame,
  CheckCircle2,
  Info
} from 'lucide-react';
import { ChatMessage, SensorAnalysisResult } from '../types';

export const AstronautAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: (
        "Welcome to the **FIREWISE-X Astronaut Fire Safety Assistant**. I am a domain-specific decision-support agent grounded in flight data and documentation from NASA's PSI-25 (BASS-II) microgravity combustion investigation.\n\n" +
        "How can I assist your mission today? You can inquire about microgravity flame physics, analyze specific NASA test runs (e.g., 'Tell me about Test B12'), evaluate cabin sensor telemetry anomalies, or check material flammability limits."
      ),
      grounding_sources: ["NASA PSI-25 BASS-II Summary Report (NASA/TM-20210011385)"],
      timestamp: '16:00 UTC'
    }
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Live Sensor Telemetry Tester state
  const [sensorInputs, setSensorInputs] = useState({
    current_o2_pct: 21.0,
    current_co_ppm: 0.0,
    current_co2_pct: 0.35,
    airflow_cm_s: 5.0,
    radiometer_mv: 0.0
  });
  const [sensorResult, setSensorResult] = useState<SensorAnalysisResult | null>(null);
  const [sensorLoading, setSensorLoading] = useState<boolean>(false);

  const quickQuestions = [
    "Why do microgravity flames become spherical?",
    "What is the low-speed radiative extinction limit?",
    "Analyze sensor reading: O2 18.2%, CO 65 ppm",
    "What happened in NASA test B12?",
    "How does SIBAL fabric compare to Nomex III?",
    "Explain aerodynamic blow-off extinction"
  ];

  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!msgText) setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });
      if (!res.ok) throw new Error('Assistant API failed.');
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.response,
        grounding_sources: data.grounding_sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: data.confidence
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `Error communicating with Astronaut Assistant: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleRunSensorAnalysis = async () => {
    setSensorLoading(true);
    try {
      const res = await fetch('/api/assistant/analyze-sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorInputs),
      });
      if (!res.ok) throw new Error('Sensor telemetry analysis failed.');
      const data: SensorAnalysisResult = await res.json();
      setSensorResult(data);
    } catch (err: any) {
      alert(`Sensor Error: ${err.message}`);
    } finally {
      setSensorLoading(false);
    }
  };

  const sendSensorDataToChat = () => {
    const msg = `Analyze current cabin sensor readings: O2 = ${sensorInputs.current_o2_pct}%, CO = ${sensorInputs.current_co_ppm} ppm, Airflow = ${sensorInputs.airflow_cm_s} cm/s, Radiometer = ${sensorInputs.radiometer_mv} mV.`;
    handleSendMessage(msg);
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Astronaut AI Assistant</span>
          </h2>
          <p className="text-xs text-slate-400">
            Microgravity fire safety intelligence, source-grounded answers, and telemetry anomaly diagnostics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            RAG GROUNDED: NASA TM-20210011385
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Chat Window */}
        <div className="lg:col-span-8 flex flex-col h-[650px] glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden">
          {/* Chat Messages Scrollable Box */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-3 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                    <span className="font-semibold text-cyan-300">
                      {m.sender === 'user' ? 'ASTRONAUT / CREW' : 'FIREWISE-X SAFETY AI'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line text-xs font-normal">
                    {m.text}
                  </div>

                  {m.grounding_sources && m.grounding_sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-400 flex flex-wrap gap-1 items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      <span>Sources: {m.grounding_sources.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-cyan-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Synthesizing NASA experimental evidence...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 whitespace-nowrap font-mono text-[10px]">SUGGESTED:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-slate-700 text-cyan-300 border border-slate-700/60 transition-colors cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about microgravity flames, sensor anomalies, or BASS-II tests (e.g. Test B10)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>

        {/* Right: Live Sensor Telemetry Analyzer Panel */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-orange-400" />
                <span>Cabin Sensor Telemetry Diagnostics</span>
              </span>
              <button
                onClick={() => setSensorInputs({
                  current_o2_pct: 21.0,
                  current_co_ppm: 0.0,
                  current_co2_pct: 0.35,
                  airflow_cm_s: 5.0,
                  radiometer_mv: 0.0
                })}
                className="text-[10px] font-mono text-slate-400 hover:text-cyan-300"
                title="Reset to nominal"
              >
                Reset
              </button>
            </div>

            {/* O2 Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Oxygen (CSA-CP):</span>
                <span className="font-mono text-cyan-300 font-bold">{sensorInputs.current_o2_pct}%</span>
              </div>
              <input
                type="range"
                min={14.0}
                max={28.0}
                step={0.2}
                value={sensorInputs.current_o2_pct}
                onChange={(e) => setSensorInputs({ ...sensorInputs, current_o2_pct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* CO Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Carbon Monoxide (CO):</span>
                <span className={`font-mono font-bold ${
                  sensorInputs.current_co_ppm > 50 ? 'text-rose-400' :
                  sensorInputs.current_co_ppm > 15 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {sensorInputs.current_co_ppm} ppm
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                step={1}
                value={sensorInputs.current_co_ppm}
                onChange={(e) => setSensorInputs({ ...sensorInputs, current_co_ppm: parseFloat(e.target.value) })}
                className="w-full accent-orange-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0 ppm (Nominal)</span>
                <span>50 ppm (Warning)</span>
                <span>100+ ppm (Critical)</span>
              </div>
            </div>

            {/* Airflow Velocity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Duct Airflow:</span>
                <span className="font-mono text-slate-200">{sensorInputs.airflow_cm_s} cm/s</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={30.0}
                step={0.5}
                value={sensorInputs.airflow_cm_s}
                onChange={(e) => setSensorInputs({ ...sensorInputs, airflow_cm_s: parseFloat(e.target.value) })}
                className="w-full accent-blue-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Radiometer Signal */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Radiometer IR Signal:</span>
                <span className="font-mono text-purple-300">{sensorInputs.radiometer_mv} mV</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={sensorInputs.radiometer_mv}
                onChange={(e) => setSensorInputs({ ...sensorInputs, radiometer_mv: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleRunSensorAnalysis}
                disabled={sensorLoading}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                {sensorLoading ? 'Evaluating...' : 'Evaluate Telemetry'}
              </button>
              <button
                onClick={sendSensorDataToChat}
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer"
                title="Send telemetry values directly into AI Chat"
              >
                Send to Chat
              </button>
            </div>

            {/* Diagnostic Output Card */}
            {sensorResult && (
              <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                sensorResult.hazard_severity === 'CRITICAL' ? 'bg-rose-950/40 border-rose-500/50' :
                sensorResult.hazard_severity === 'WARNING' ? 'bg-amber-950/40 border-amber-500/50' :
                sensorResult.hazard_severity === 'CAUTION' ? 'bg-yellow-950/30 border-yellow-500/40' :
                'bg-emerald-950/30 border-emerald-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 uppercase">HAZARD LEVEL</span>
                  <span className={`font-mono font-bold text-xs ${
                    sensorResult.hazard_severity === 'CRITICAL' ? 'text-rose-300' :
                    sensorResult.hazard_severity === 'WARNING' ? 'text-amber-300' :
                    sensorResult.hazard_severity === 'CAUTION' ? 'text-yellow-300' : 'text-emerald-300'
                  }`}>
                    {sensorResult.hazard_severity}
                  </span>
                </div>

                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400">Fire Event Probability:</span>
                  <span className="text-white font-bold">{(sensorResult.fire_event_probability * 100).toFixed(0)}%</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">ANOMALIES:</span>
                  {sensorResult.detected_deviations.map((d, i) => (
                    <p key={i} className="text-[11px] text-slate-200 leading-tight">
                      • {d}
                    </p>
                  ))}
                </div>

                {sensorResult.action_recommendations.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-amber-400 font-mono block">DIRECTED ACTIONS:</span>
                    {sensorResult.action_recommendations.map((a, i) => (
                      <p key={i} className="text-[11px] text-amber-200 font-semibold leading-tight">
                        {i + 1}. {a}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Safety Disclaimer footer */}
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 leading-tight">
            Astronaut Assistant provides scientific inference based on NASA PSI-25 data. For active spacecraft emergency protocols, follow Mission Operations Flight Rules.
          </div>
        </div>
      </div>
    </div>
  );
};
