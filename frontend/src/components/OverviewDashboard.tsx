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
      {/* Hero Section with Full-Bleed Space Shuttle Launch Background */}
      <section className="relative overflow-hidden rounded-2xl glass-panel border border-cyan-500/20 p-6 sm:p-12 lg:p-16 min-h-[480px] sm:min-h-[520px] flex flex-col justify-center">
        {/* Full-Bleed Background Image & Seamless Gradient Overlays */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/hero-launch.jpg"
            alt="NASA Space Shuttle Launch - Combustion in Microgravity"
            className="w-full h-full object-cover object-[center_35%] lg:object-center select-none"
          />
          {/* Left-to-right gradient to ensure text readability on the left while keeping the shuttle vivid on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070c1b]/95 via-[#070c1b]/80 sm:via-[#070c1b]/70 to-[#070c1b]/40"></div>
          {/* Top and bottom subtle vignettes to blend into the site container */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070c1b] via-transparent to-[#070c1b]/70"></div>
          {/* Overall dark tint for cohesive spaceflight theme */}
          <div className="absolute inset-0 bg-[#070c1b]/25"></div>
        </div>

        {/* Ambient Plume & Rocket Thruster Glows */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none z-0"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl pointer-events-none z-0"></div>

        {/* Relevant Content Layer on top of full background */}
        <div className="relative z-10 max-w-3xl space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-mono shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>NASA PSI-25 RESEARCH PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-none drop-shadow-lg">
            Understanding Fire <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-orange-400 bg-clip-text text-transparent">
              Beyond Earth.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed drop-shadow-md">
            AI-powered microgravity combustion intelligence for safer space exploration. Built on flight experiments from the International Space Station’s Microgravity Science Glovebox.
          </p>

          <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
            <button
              onClick={() => onNavigate('flame-studio')}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 text-orange-300" />
              <span>Explore AI Flame Studio</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('assessment')}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 font-semibold text-xs sm:text-sm flex items-center space-x-2 backdrop-blur-md shadow-lg transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Launch Pre-Mission Assessment</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 pt-5 border-t border-slate-700/60 max-w-xl">
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 drop-shadow">129</p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">NASA Flight Tests</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-orange-400 drop-shadow">52</p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">Unique Flight Test Videos (84 Files)</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 drop-shadow">ISS PSI-25</p>
              <p className="text-[11px] sm:text-xs text-slate-300 font-medium">Microgravity Science Glovebox</p>
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
              <span>Our Features</span>
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
      {/* <section className="space-y-4">
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
      </section> */}
    </div>
  );
};
