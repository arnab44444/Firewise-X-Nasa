import React from 'react';
import { 
  Flame, 
  Activity, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Database, 
  Cpu, 
  ArrowRight, 
  Radio, 
  Eye, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { SystemStatus, Experiment } from '../types';

interface OverviewDashboardProps {
  status: SystemStatus | null;
  experiments: Experiment[];
  onNavigate: (tab: string) => void;
  onSelectExperiment: (exp: Experiment) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  status,
  experiments,
  onNavigate,
  onSelectExperiment
}) => {
  const videoEnabledCount = experiments.filter(e => e.has_video).length;
  const recentTests = experiments.slice(0, 6);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl glass-panel border border-cyan-500/20 p-8 sm:p-12 lg:p-16">
        {/* Background ambient glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>NASA PSI-25 RESEARCH PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
              Understanding Fire <br />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-orange-400 bg-clip-text text-transparent">
                Beyond Earth.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              AI-powered microgravity combustion intelligence for safer space exploration. Built on flight experiments from the International Space Station’s Microgravity Science Glovebox.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('flame-studio')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-orange-300" />
                <span>Explore AI Flame Studio</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => onNavigate('assessment')}
                className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-200 border border-cyan-500/30 hover:border-cyan-400 font-semibold text-sm flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Launch Pre-Mission Assessment</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div>
                <p className="text-2xl font-bold font-mono text-cyan-400">129</p>
                <p className="text-xs text-slate-400">NASA Flight Tests</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-orange-400">52</p>
                <p className="text-xs text-slate-400">Unique Flight Test Videos (84 Files)</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-emerald-400">LOO: 68.2%</p>
                <p className="text-xs text-slate-400">Leave-One-Out Accuracy</p>
              </div>
            </div>
          </div>

          {/* Cinematic Microgravity Flame Graphic */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center">
              {/* Outer chamber ring */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_60s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border border-dashed border-cyan-500/30 animate-[spin_40s_linear_infinite_reverse]"></div>
              
              {/* Spherical microgravity flame visualization */}
              <div className="relative w-48 h-48 rounded-full bg-gradient-to-t from-blue-900/40 via-cyan-900/30 to-amber-900/20 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center shadow-2xl shadow-cyan-500/20 overflow-hidden">
                {/* Glow concentric layers */}
                <div className="absolute w-36 h-36 rounded-full bg-blue-500/20 blur-xl"></div>
                <div className="absolute w-28 h-28 rounded-full bg-cyan-400/30 blur-lg"></div>
                <div className="absolute w-20 h-20 rounded-full bg-orange-500/40 blur-md"></div>
                <div className="absolute w-12 h-12 rounded-full bg-amber-200/70 blur-sm"></div>

                {/* SVG Spherical Flame Representation */}
                <svg className="w-32 h-32 relative z-10 animate-flame" viewBox="0 0 100 100" fill="none">
                  {/* Chemiluminescent blue halo */}
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.7" />
                  {/* Outer soot boundary */}
                  <ellipse cx="50" cy="52" rx="32" ry="30" fill="url(#flameOuter)" opacity="0.6" />
                  {/* Luminous core */}
                  <ellipse cx="50" cy="50" rx="20" ry="18" fill="url(#flameCore)" opacity="0.9" />
                  {/* Pyrolysis fuel sample representation */}
                  <rect x="25" y="49" width="50" height="2" fill="#94a3b8" rx="1" opacity="0.8" />

                  <defs>
                    <radialGradient id="flameOuter" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#0284c7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="flameCore" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                      <stop offset="50%" stopColor="#f97316" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>

                {/* Microgravity HUD annotation */}
                <div className="absolute bottom-2 font-mono text-[9px] text-cyan-300 tracking-wider bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  g ≈ 10⁻⁴ g | Quiescent Spherical
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Intelligence Architecture Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Core AI Model Architecture</span>
            </h2>
            <p className="text-xs text-slate-400">
              Five integrated intelligence engines operationalized for spaceflight safety
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
            ALL ENGINES ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400">MODEL 1</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Flame Detection & Segmentation</h3>
            <p className="text-xs text-slate-400 leading-snug">
              OpenCV & adaptive color-space segmentation. Extracts flame area, centroid drift, perimeter, and spread rate.
            </p>
            <div className="pt-2 text-[10px] font-mono text-cyan-300 flex items-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
              <span>Sub-pixel precision</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400">ENGINE 2</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">BASS-II Flight Run Lookup</h3>
            <p className="text-xs text-slate-400 leading-snug">
              Deterministic nearest-neighbor matching against 129 flight runs with range bounds verification.
            </p>
            <div className="pt-2 text-[10px] font-mono text-cyan-300 flex items-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
              <span>Tested Range Alerts</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400">MODEL 3</span>
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Temporal Behavior Analysis</h3>
            <p className="text-xs text-slate-400 leading-snug">
              Time-series tracking of flame growth rate dA/dt, pre-extinction low-frequency pulsations, and sudden quench.
            </p>
            <div className="pt-2 text-[10px] font-mono text-cyan-300 flex items-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
              <span>Oscillation detection</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400">MODEL 4</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Multimodal Fusion</h3>
            <p className="text-xs text-slate-400 leading-snug">
              Fuses visual video features (peak area, front speed) with tabular environmental conditions and CSA-CP sensor data.
            </p>
            <div className="pt-2 text-[10px] font-mono text-cyan-300 flex items-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
              <span>Multi-stream telemetry</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400">MODEL 5</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Explainable AI & Evidence</h3>
            <p className="text-xs text-slate-400 leading-snug">
              Feature attribution analysis and nearest-neighbor retrieval linking predictions to verified NASA reports.
            </p>
            <div className="pt-2 text-[10px] font-mono text-cyan-300 flex items-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
              <span>SHAP + NASA TM citations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Radio className="w-5 h-5 text-orange-400" />
            <span>Platform Capabilities</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dedicated mission modules designed for astronauts, safety engineers, and researchers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div 
            onClick={() => onNavigate('flame-studio')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Flame Analysis Studio
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect real microgravity combustion MP4 videos with synchronized AI segmentation masks, area timeline charts, and frame-by-frame scrubbing.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => onNavigate('assessment')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Pre-Mission Assessment
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test hypothetical spacecraft cabin parameters (O₂, airflow, fuel thickness) and run multi-scenario comparisons (Scenario A vs B vs C) before flight.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Run Assessment</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => onNavigate('astronaut-ai')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Astronaut AI Assistant
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conversational decision-support assistant equipped with scientific RAG across NASA BASS-II reports and real-time cabin sensor anomaly diagnostics.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Open Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => onNavigate('reports')}
            className="glass-panel p-6 rounded-2xl border border-cyan-500/20 hover:border-cyan-400 cursor-pointer transition-all duration-300 group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Research Intelligence
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Searchable database of all 129 NASA PSI-25 experiments, observation logs, and a 1-click generator for official 9-part scientific PDF reports.
              </p>
            </div>
            <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Browse Archive</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Recent NASA PSI-25 Experiments Highlights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>NASA Flight Experiments Spotlight</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verified experimental trials conducted aboard the ISS Microgravity Science Glovebox
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View all 129 tests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTests.map((exp) => (
            <div
              key={exp.id}
              onClick={() => onSelectExperiment(exp)}
              className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-cyan-300 group-hover:text-cyan-200">
                    Test #{exp.test_id}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    GMT {exp.gmt}
                  </span>
                </div>
                {exp.has_video && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-950/80 text-orange-400 border border-orange-500/30 flex items-center space-x-1">
                    <Flame className="w-2.5 h-2.5" />
                    <span>Video</span>
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-white truncate">{exp.fuel_material_raw}</p>
                <p className="text-[11px] text-slate-400">PI: {exp.pi} • {exp.flow_geometry} flow</p>
              </div>

              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[9px]">O₂ IN</span>
                  <span className="text-slate-200">{exp.calibrated_initial_o2_vol_pct}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">FLOW</span>
                  <span className="text-slate-200">{exp.airflow_velocity_cm_s} cm/s</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">OUTCOME</span>
                  <span className={`text-[10px] ${
                    exp.outcome.includes('quench') ? 'text-blue-400' :
                    exp.outcome.includes('sustained') ? 'text-amber-400' :
                    exp.outcome.includes('blow') ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {exp.outcome.replace('extinguished_', '')}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 italic pt-1">
                "{exp.observations}"
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
