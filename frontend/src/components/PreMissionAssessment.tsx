import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Download, 
  FileText,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ScenarioInputData, LookupResponse } from '../types';

export const PreMissionAssessment: React.FC = () => {
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  // Single scenario state
  const [scenario, setScenario] = useState<ScenarioInputData>({
    material: 'PMMA Thin Film',
    thickness_mm: 0.2,
    airflow_velocity_cm_s: 5.0,
    oxygen_vol_pct: 21.0,
  });

  const [lookupResult, setLookupResult] = useState<LookupResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Multi-scenario comparison state
  const [scenariosList] = useState<Array<{ label: string; data: ScenarioInputData }>>([
    {
      label: 'Scenario A (Nominal Cabin)',
      data: { material: 'PMMA Thin Film', thickness_mm: 0.2, airflow_velocity_cm_s: 5.0, oxygen_vol_pct: 21.0 }
    },
    {
      label: 'Scenario B (Reduced O₂ Purge)',
      data: { material: 'PMMA Thin Film', thickness_mm: 0.2, airflow_velocity_cm_s: 1.5, oxygen_vol_pct: 17.5 }
    },
    {
      label: 'Scenario C (High Airflow Draft)',
      data: { material: 'PMMA Thin Film', thickness_mm: 0.2, airflow_velocity_cm_s: 25.0, oxygen_vol_pct: 21.0 }
    }
  ]);
  const [comparisonResults, setComparisonResults] = useState<any[] | null>(null);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);

  const materials = [
    { name: 'PMMA Thin Film', defaultTh: 0.2, desc: 'Opposed flow thin film (100 - 400 µm)' },
    { name: 'PMMA Thick Slab', defaultTh: 2.0, desc: 'Opposed flow solid slab (1 - 5 mm)' },
    { name: 'PMMA Clear Rod', defaultTh: 6.35, desc: 'Concurrent stagnation flow clear rod (1/4" to 1/2")' },
    { name: 'PMMA Black Rod', defaultTh: 6.35, desc: 'Opposed flow black rod' },
    { name: 'SIBAL Fabric', defaultTh: 0.3, desc: 'Cotton/Fiberglass blend fabric (concurrent)' },
    { name: 'Nomex III', defaultTh: 0.4, desc: 'Fire-resistant aramid fabric' },
    { name: 'Japan Wax Candle', defaultTh: 8.0, desc: 'Quiescent spherical diffusion flame' },
    { name: 'PMMA Sphere', defaultTh: 40.0, desc: '4 cm spherical PMMA section' },
  ];

  // Run real lookup automatically when sliders move (Requirement 1)
  useEffect(() => {
    executeLookup(scenario);
  }, [scenario.material, scenario.thickness_mm, scenario.airflow_velocity_cm_s, scenario.oxygen_vol_pct]);

  const executeLookup = async (sc: ScenarioInputData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/assessment/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sc),
      });
      if (res.ok) {
        const data: LookupResponse = await res.json();
        setLookupResult(data);
      }
    } catch (err) {
      console.error('Error fetching lookup:', err);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    setCompareLoading(true);
    try {
      const res = await fetch('/api/assessment/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarios: scenariosList.map(s => s.data)
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setComparisonResults(data.comparisons);
      }
    } catch (err) {
      console.error('Error comparing scenarios:', err);
    } finally {
      setCompareLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!lookupResult) return;
    try {
      const primary = lookupResult.matched_historical_runs[0];
      const res = await fetch('/api/research/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Pre-Mission Assessment: ${scenario.material}`,
          test_id: primary ? primary.test_id : 'B1',
          scenario: scenario,
          prediction: {
            outcome_label: lookupResult.lookup_result.outcome_label,
            measured_burn_duration_s: lookupResult.lookup_result.measured_burn_duration_s,
            measured_spread_rate_cm_s: lookupResult.lookup_result.measured_spread_rate_cm_s,
            measured_co_delta_ppm: lookupResult.lookup_result.measured_co_delta_ppm,
            factual_summary: lookupResult.lookup_result.factual_summary
          }
        })
      });
      if (!res.ok) throw new Error('Failed to generate report PDF.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIREWISE_X_Assessment_${scenario.material.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`PDF Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Top Header & Mode Toggle */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Pre-Mission Combustion Assessment</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real BASS-II flight run lookup engine matching user conditions against 129 documented ISS microgravity experiments.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setMode('single')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              mode === 'single'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Interactive Lookup
          </button>
          <button
            onClick={() => {
              setMode('compare');
              if (!comparisonResults) runComparison();
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
              mode === 'compare'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Scenario Comparator (A vs B vs C)
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Sliders & Controls */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Mission Input Parameters</span>
              </span>
              <button
                onClick={() => setScenario({
                  material: 'PMMA Thin Film',
                  thickness_mm: 0.2,
                  airflow_velocity_cm_s: 5.0,
                  oxygen_vol_pct: 21.0,
                })}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
                title="Reset to nominal"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Material Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Fuel Material
              </label>
              <select
                value={scenario.material}
                onChange={(e) => {
                  const m = materials.find(mat => mat.name === e.target.value);
                  setScenario({
                    ...scenario,
                    material: e.target.value,
                    thickness_mm: m ? m.defaultTh : scenario.thickness_mm
                  });
                }}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-2.5 focus:border-cyan-400 focus:outline-none"
              >
                {materials.map(m => (
                  <option key={m.name} value={m.name}>
                    {m.name} — {m.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Thickness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Fuel Thickness:</span>
                <span className="font-mono text-cyan-300 font-bold">{scenario.thickness_mm} mm</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={15.0}
                step={0.1}
                value={scenario.thickness_mm}
                onChange={(e) => setScenario({ ...scenario, thickness_mm: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.1 mm (Thin)</span>
                <span>12.7 mm (BASS-II Max Tested)</span>
                <span>15.0 mm (Extreme)</span>
              </div>
            </div>

            {/* Oxygen % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ambient Oxygen (O₂):</span>
                <span className={`font-mono font-bold ${
                  scenario.oxygen_vol_pct < 15.0 || scenario.oxygen_vol_pct > 22.5 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {scenario.oxygen_vol_pct}% by vol
                </span>
              </div>
              <input
                type="range"
                min={12.0}
                max={30.0}
                step={0.5}
                value={scenario.oxygen_vol_pct}
                onChange={(e) => setScenario({ ...scenario, oxygen_vol_pct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>14% (Tested Min)</span>
                <span>21% (Nominal)</span>
                <span>22.5% (Tested Max)</span>
                <span>30% (Extreme)</span>
              </div>
            </div>

            {/* Airflow Velocity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Duct Airflow Velocity:</span>
                <span className={`font-mono font-bold ${
                  scenario.airflow_velocity_cm_s > 45.0 ? 'text-rose-400' : 'text-orange-400'
                }`}>
                  {scenario.airflow_velocity_cm_s} cm/s
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={55.0}
                step={0.5}
                value={scenario.airflow_velocity_cm_s}
                onChange={(e) => setScenario({ ...scenario, airflow_velocity_cm_s: parseFloat(e.target.value) })}
                className="w-full accent-orange-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5 cm/s (Quiescent)</span>
                <span>45.0 cm/s (Tested Max)</span>
                <span>55.0 cm/s (Extreme)</span>
              </div>
            </div>

            {/* Out-of-Range Warning Banner (Requirement 1) */}
            {lookupResult && !lookupResult.range_validation.within_tested_envelope && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-rose-300 font-bold font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>WARNING: EXTREME INPUT OUTSIDE TESTED BASS-II RANGE</span>
                </div>
                {lookupResult.range_validation.range_warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-rose-200 leading-tight">
                    • {w}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Right Area: Lookup Results (Measured Data Only) */}
          <div className="lg:col-span-7 space-y-6">
            {lookupResult ? (
              <div className="space-y-6">
                {/* Primary Lookup Result Banner */}
                <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                      CLOSEST EMPIRICAL BASS-II RUN: #{lookupResult.lookup_result.primary_match_test_id}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                      EMPIRICAL LOOKUP
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {lookupResult.lookup_result.outcome_label}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {lookupResult.lookup_result.factual_summary}
                  </p>
                </div>

                {/* Primary Measured Flight Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">MEASURED BURN DURATION</span>
                    <p className="text-xl font-bold font-mono text-orange-400">
                      {lookupResult.lookup_result.measured_burn_duration_s} <span className="text-xs text-slate-400">s</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Recorded ISS burn time</p>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">MEASURED SPREAD SPEED</span>
                    <p className="text-xl font-bold font-mono text-cyan-300">
                      {lookupResult.lookup_result.measured_spread_rate_cm_s} <span className="text-xs text-slate-400">cm/s</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Calibrated flame-front progression</p>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block">MEASURED ΔCO PRODUCED</span>
                    <p className="text-xl font-bold font-mono text-rose-400">
                      {lookupResult.lookup_result.measured_co_delta_ppm} <span className="text-xs text-slate-400">ppm</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">CSA-CP chamber sensor</p>
                  </div>
                </div>

                {/* Ranked Matched Runs (Requirement 4) */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center space-x-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>Ranked Historical Flight Runs (Requirement 4)</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      Ranked by: 1) Material Match, 2) |ΔO₂|+|ΔU|+|Δth|, 3) Sensor Completeness
                    </span>
                  </div>

                  <div className="space-y-3">
                    {lookupResult.matched_historical_runs.map((run, idx) => (
                      <div key={run.test_id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-cyan-300">
                              Rank #{idx + 1}: Test #{run.test_id} ({run.pi})
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              ΔO₂: {run.parameter_delta.delta_o2}%, ΔFlow: {run.parameter_delta.delta_airflow} cm/s
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {run.paper_reference}
                          </span>
                        </div>

                        <p className="text-slate-200">
                          <strong>Material:</strong> {run.fuel_material_raw} ({run.measured_thickness_mm} mm) • <strong>Tested at:</strong> {run.measured_initial_o2_vol_pct}% O₂, {run.measured_airflow_cm_s} cm/s
                        </p>

                        <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                          "{run.flight_observations}"
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 flex items-center space-x-2 cursor-pointer transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Technical Assessment PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-72 glass-panel rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
                Adjust sliders on the left to lookup closest BASS-II flight tests.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Multi-Scenario Comparator View (Requirement 1: Scenarios A, B, C using same lookup) */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Scenarios A, B, and C evaluated using the identical empirical BASS-II lookup. Extreme conditions trigger range warnings.
            </p>
            <button
              onClick={runComparison}
              disabled={compareLoading}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
            >
              <span>Refresh Scenario Comparison</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenariosList.map((sc, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-xs font-bold text-cyan-300 uppercase">
                    {sc.label}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                    ID: SC-{idx + 1}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Material:</span>
                    <span className="text-white font-medium">{sc.data.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thickness:</span>
                    <span className="font-mono text-slate-200">{sc.data.thickness_mm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ambient O₂:</span>
                    <span className="font-mono text-cyan-300 font-bold">{sc.data.oxygen_vol_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Airflow:</span>
                    <span className="font-mono text-orange-400 font-bold">{sc.data.airflow_velocity_cm_s} cm/s</span>
                  </div>
                </div>

                {comparisonResults && comparisonResults[idx] && (
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">CLOSEST FLIGHT TEST</span>
                      <p className="text-sm font-bold text-white">
                        Test #{comparisonResults[idx].lookup_result.primary_match_test_id}
                      </p>
                      <p className="text-xs text-orange-300 font-semibold">
                        {comparisonResults[idx].lookup_result.outcome_label}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block">MEASURED SPREAD</span>
                        <span className="text-cyan-300 font-semibold">
                          {comparisonResults[idx].lookup_result.measured_spread_rate_cm_s} cm/s
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">MEASURED BURN</span>
                        <span className="text-orange-300 font-semibold">
                          {comparisonResults[idx].lookup_result.measured_burn_duration_s} s
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      "{comparisonResults[idx].lookup_result.factual_summary}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
