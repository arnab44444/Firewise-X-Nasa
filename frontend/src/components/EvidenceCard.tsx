import React from 'react';
import { 
  FileCheck, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Layers,
  ShieldAlert
} from 'lucide-react';
import { EvidenceCardData } from '../types';

interface EvidenceCardProps {
  evidence: EvidenceCardData;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-4 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center space-x-2.5">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white font-mono uppercase">
            Scientific Evidence Card: #{evidence.test_id} ({evidence.pi})
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{evidence.paper_page}</span>
        </div>
      </div>

      {/* Grid: Observation & Flagging Rule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* What was observed */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono text-cyan-400 block uppercase">1. WHAT WAS OBSERVED</span>
          <p className="text-xs text-slate-200 leading-relaxed italic">
            "{evidence.what_was_observed}"
          </p>
        </div>

        {/* The rule that flagged it */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono text-orange-400 block uppercase">2. THE RULE THAT FLAGGED IT</span>
          <p className="text-xs text-white font-semibold leading-relaxed">
            {evidence.rule_flagged}
          </p>
        </div>
      </div>

      {/* 3. Conditions & Measurements */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
        <span className="text-[10px] font-mono text-slate-400 block uppercase">3. EXPERIMENTAL CONDITIONS & SENSOR DATA</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">MATERIAL</span>
            <span className="text-slate-200">{evidence.conditions.fuel_material}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">O₂ & AIRFLOW</span>
            <span className="text-cyan-300 font-bold">{evidence.conditions.ambient_o2_vol_pct}% O₂ @ {evidence.conditions.airflow_velocity_cm_s} cm/s</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">BURN TIME</span>
            <span className="text-orange-300">{evidence.measurements.burn_duration_s} s</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">ΔCO CONCENTRATION</span>
            <span className="text-rose-400">{evidence.measurements.co_delta_ppm} ppm</span>
          </div>
        </div>
      </div>

      {/* 4. What it supports & 5. Its limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>4. WHAT IT SUPPORTS</span>
          </span>
          <p className="text-slate-200 leading-relaxed">
            {evidence.what_it_supports}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1">
          <span className="text-[10px] font-mono text-rose-400 block uppercase font-bold flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>5. SCIENTIFIC LIMITATIONS</span>
          </span>
          <p className="text-slate-200 leading-relaxed">
            {evidence.scientific_limits}
          </p>
        </div>
      </div>

      {/* 6. Next Step for the Researcher */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-cyan-300 block uppercase font-bold">
            6. RECOMMENDED NEXT RESEARCH STEP
          </span>
          <p className="text-slate-300">
            {evidence.next_step_for_researcher}
          </p>
        </div>
      </div>
    </div>
  );
};
