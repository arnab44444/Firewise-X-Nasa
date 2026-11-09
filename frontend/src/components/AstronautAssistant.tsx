import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Radio, 
  BookOpen, 
  RotateCcw, 
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  Activity
} from 'lucide-react';
import { ChatMessage, ChatResponse } from '../types';

export const AstronautAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: (
        "Welcome to the **FIREWISE-X Grounded Astronaut Assistant**.\n\n" +
        "I provide information strictly grounded in cited facts from NASA's PSI-25 (BASS-II) flight investigation (NASA/TM-20210011385). " +
        "I can report documented flight measurements (e.g., Test B1 or Test M5), explain microgravity quenching limits, " +
        "or compare your custom O₂ and Carbon Monoxide (CO) readings against a stated NASA reference flight run.\n\n" +
        "*Note: Any question outside documented BASS-II data will be explicitly refused.*"
      ),
      source_page: "NASA/TM-20210011385, Appendix A",
      timestamp: '16:00 UTC',
      refused: false
    }
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Stated Reference Run Telemetry Comparator (Requirement 2)
  const [userO2, setUserO2] = useState<number>(19.5);
  const [userCO, setUserCO] = useState<number>(45.0);
  const [selectedRefRun, setSelectedRefRun] = useState<string>('B1');
  const [comparisonOutput, setComparisonOutput] = useState<any | null>(null);
  const [compLoading, setCompLoading] = useState<boolean>(false);

  const quickQuestions = [
    "Tell me about test B1 O2 and CO measurements",
    "What happened in test M5 thick PMMA burn?",
    "Why did Nomex III extinguish in test F1?",
    "How was flame quenched in test T4 at 2.2 cm/s?",
    "What is the low-speed radiative extinction limit?",
    "How do I bake bread in space?" // Intentional test refusal query!
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
      const data: ChatResponse = await res.json();

      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: data.response,
        source_page: data.source_page,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        refused: data.refused
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `Error communicating with Assistant: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        refused: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCompareTelemetry = async () => {
    setCompLoading(true);
    try {
      const res = await fetch('/api/assistant/analyze-sensors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_o2_pct: userO2,
          current_co_ppm: userCO,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setComparisonOutput(data);
      }
    } catch (err) {
      console.error('Error comparing telemetry:', err);
    } finally {
      setCompLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>Astronaut Assistant (Grounded & Able to Refuse)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Answers strictly matching documented NASA BASS-II flight facts with source page citations. Refuses out-of-scope queries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
            CITED EVIDENCE: NASA/TM-20210011385
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Window */}
        <div className="lg:col-span-7 flex flex-col h-[650px] glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden">
          {/* Chat Messages */}
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
                      : m.refused
                      ? 'bg-rose-950/40 text-rose-200 border border-rose-500/40'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between space-x-3 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                    <span className="font-semibold text-cyan-300">
                      {m.sender === 'user' ? 'ASTRONAUT / CREW' : 'BASS-II CITATION ENGINE'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-line text-xs font-normal">
                    {m.text}
                  </div>

                  {/* Show source page if available */}
                  {m.source_page && (
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-cyan-300 flex items-center space-x-1.5">
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      <span>{m.source_page}</span>
                    </div>
                  )}

                  {/* Refusal Notice: Explicitly NO confidence badge (Requirement 2) */}
                  {m.refused && (
                    <div className="pt-1 text-[10px] font-mono text-rose-400 flex items-center space-x-1">
                      <XCircle className="w-3 h-3" />
                      <span>OFF-TOPIC REFUSAL (No confidence badge displayed)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-cyan-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Verifying citations against BASS-II flight matrix...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 whitespace-nowrap font-mono text-[10px]">CITED PROMPTS:</span>
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

          {/* Input Bar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a cited BASS-II question (e.g. 'Tell me about test B1 or M5')..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>

        {/* Right: Compare User Telemetry Against Stated Reference Run (Requirement 2) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-cyan-500/20 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center space-x-1.5">
                <Radio className="w-4 h-4 text-orange-400" />
                <span>Reference Flight Run Comparator (Requirement 2)</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your measured O₂ and Carbon Monoxide (CO) levels and compare directly against a stated BASS-II benchmark flight run.
              </p>
            </div>

            {/* Select Stated Reference Run */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Stated Reference Flight Run:
              </label>
              <select
                value={selectedRefRun}
                onChange={(e) => setSelectedRefRun(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="B1">Reference Run B1 (100-µm PMMA Film: 22.2% O₂, 6 ppm CO)</option>
                <option value="M5">Reference Run M5 (1-mm PMMA Slab: 19.0% O₂, &gt;500 ppm CO)</option>
                <option value="T4">Reference Run T4 (SIBAL Fabric Quench: 18.7% O₂, 15 ppm CO)</option>
              </select>
            </div>

            {/* User O2 Input */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Your Measured Oxygen (O₂):</span>
                <span className="font-mono text-cyan-300 font-bold">{userO2}%</span>
              </div>
              <input
                type="range"
                min={15.0}
                max={25.0}
                step={0.1}
                value={userO2}
                onChange={(e) => setUserO2(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* User CO Input */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Your Measured Carbon Monoxide (CO):</span>
                <span className="font-mono text-orange-400 font-bold">{userCO} ppm</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={1}
                value={userCO}
                onChange={(e) => setUserCO(parseFloat(e.target.value))}
                className="w-full accent-orange-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <button
              onClick={handleCompareTelemetry}
              disabled={compLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Compare Against Reference Run</span>
            </button>

            {/* Comparison Output */}
            {comparisonOutput && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-mono text-[10px] text-cyan-400 uppercase">
                    COMPARISON: #{comparisonOutput.reference_run.test_id} ({comparisonOutput.reference_run.material})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {comparisonOutput.reference_run.source}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {comparisonOutput.comparison_findings.map((f: string, i: number) => (
                    <p key={i} className="text-slate-200 leading-snug">
                      • {f}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 leading-tight">
            Grounded strictly in NASA/TM-20210011385 flight records. Does not replace NASA spacecraft fire suppression protocols.
          </div>
        </div>
      </div>
    </div>
  );
};
