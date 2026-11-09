import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Download, 
  FileText,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { ScenarioInputData, PredictionResult } from '../types';

export const PreMissionAssessment: React.FC = () => {
  // Mode: 'single' or 'compare'
  const [mode, setMode] = useState<'single' | 'compare'>('single');

  // Single scenario state
  const [scenario, setScenario] = useState<ScenarioInputData>({
    material: 'PMMA Thin Film',
    thickness_mm: 0.2,
    airflow_velocity_cm_s: 5.0,
    oxygen_vol_pct: 21.0,
    width_cm: 2.0,
    flow_restrictor: 2,
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-scenario comparison state
  const [scenariosList, setScenariosList] = useState<Array<{ label: string; data: ScenarioInputData }>>([
    {
      label: 'Scenario A (Nominal Cabin)',
      data: { material: 'PMMA Thin Film', thickness_mm: 0.2, airflow_velocity_cm_s: 5.0, oxygen_vol_pct: 21.0, width_cm: 2.0, flow_restrictor: 2 }
    },
    {
      label: 'Scenario B (Reduced O₂ Purge)',
      data: { material: 'PMMA Thin Film', thickness_mm: 0.2, airflow_velocity_cm_s: 2.0, oxygen_vol_pct: 17.5, width_cm: 2.0, flow_restrictor: 2 }
    },
    {
      label: 'Scenario C (High Airflow Draft)',
      data: { material: 'PMMA Thin Film', thickness_mm: 0.2, airflow_velocity_cm_s: 25.0, oxygen_vol_pct: 21.0, width_cm: 2.0, flow_restrictor: 0 }
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

  const runPrediction = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assessment/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      });
      if (!res.ok) throw new Error('Prediction API failed.');
      const data: PredictionResult = await res.json();
      setPrediction(data);
    } catch (err: any) {
      setError(err.message || 'Error generating prediction.');
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
      if (!res.ok) throw new Error('Scenario comparison failed.');
      const data = await res.json();
      setComparisonResults(data.comparisons);
    } catch (err: any) {
      setError(err.message || 'Error running scenario comparison.');
    } finally {
      setCompareLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!prediction) return;
    try {
      const res = await fetch('/api/research/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Pre-Mission Assessment: ${scenario.material}`,
          scenario: scenario,
          prediction: prediction.prediction
        })
      });
      if (!res.ok) throw new Error('Failed to generate report PDF.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIREWISE_X_PreMission_${scenario.material.replace(/\s+/g, '_')}.pdf`;
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
            Simulate and predict microgravity fire behavior, extinction thresholds, and toxic gas generation
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'single'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Single Scenario
          </button>
          <button
            onClick={() => {
              setMode('compare');
              if (!comparisonResults) runComparison();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
          {/* Left Form: Parameter Controls */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Spacecraft Combustion Conditions</span>
              </span>
              <button
                onClick={() => setScenario({
                  material: 'PMMA Thin Film',
                  thickness_mm: 0.2,
                  airflow_velocity_cm_s: 5.0,
                  oxygen_vol_pct: 21.0,
                  width_cm: 2.0,
                  flow_restrictor: 2,
                })}
                className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center space-x-1"
                title="Reset to NASA standard baseline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Material Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Fuel Material Type
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
                <span>0.1 mm (Thin Film)</span>
                <span>15.0 mm (Thick Rod/Slab)</span>
              </div>
            </div>

            {/* Oxygen % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Ambient Oxygen (O₂):</span>
                <span className={`font-mono font-bold ${
                  scenario.oxygen_vol_pct < 18 ? 'text-blue-400' :
                  scenario.oxygen_vol_pct > 24 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {scenario.oxygen_vol_pct}% by vol
                </span>
              </div>
              <input
                type="range"
                min={15.0}
                max={30.0}
                step={0.5}
                value={scenario.oxygen_vol_pct}
                onChange={(e) => setScenario({ ...scenario, oxygen_vol_pct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>15.0% (Near Quench)</span>
                <span>21.0% (ISS Norm)</span>
                <span>30.0% (Enriched)</span>
              </div>
            </div>

            {/* Airflow Velocity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Duct Airflow Velocity:</span>
                <span className="font-mono text-orange-400 font-bold">{scenario.airflow_velocity_cm_s} cm/s</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={45.0}
                step={0.5}
                value={scenario.airflow_velocity_cm_s}
                onChange={(e) => setScenario({ ...scenario, airflow_velocity_cm_s: parseFloat(e.target.value) })}
                className="w-full accent-orange-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.5 cm/s (Quiescent)</span>
                <span>5.0 cm/s (Standard)</span>
                <span>45.0 cm/s (High Draft)</span>
              </div>
            </div>

            {/* Flow Restrictor Plate */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Perforated Flow Restrictor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 0, label: '0 (High Flow)' },
                  { val: 1, label: '1 (Med Flow)' },
                  { val: 2, label: '2 (Low Flow)' },
                ].map(r => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setScenario({ ...scenario, flow_restrictor: r.val })}
                    className={`py-2 px-2 rounded-xl text-xs font-mono border transition-all ${
                      scenario.flow_restrictor === r.val
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runPrediction}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Evaluating AI Physics Models...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-orange-300" />
                  <span>Execute Pre-Mission Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Right Area: Prediction Results & Explainable AI */}
          <div className="lg:col-span-7 space-y-6">
            {prediction ? (
              <div className="space-y-6">
                {/* Outcome Banner */}
                <div className={`glass-panel p-6 rounded-2xl border ${
                  prediction.prediction.outcome_code.includes('quench') ? 'border-blue-500/40 bg-blue-950/20' :
                  prediction.prediction.outcome_code.includes('sustained') ? 'border-amber-500/40 bg-amber-950/20' :
                  'border-rose-500/40 bg-rose-950/20'
                } space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                      PREDICTED OUTCOME
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-cyan-300">
                      CONFIDENCE: {(prediction.prediction.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h3 className={`text-2xl font-black ${
                    prediction.prediction.outcome_code.includes('quench') ? 'text-blue-300' :
                    prediction.prediction.outcome_code.includes('sustained') ? 'text-amber-300' : 'text-rose-300'
                  }`}>
                    {prediction.prediction.outcome_label}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {prediction.prediction.scientific_rationale}
                  </p>
                </div>

                {/* Metric Predictions Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400">FLAME SPREAD RATE</p>
                    <p className="text-xl font-bold font-mono text-cyan-300">
                      {prediction.prediction.predicted_spread_rate_cm_s} <span className="text-xs text-slate-400">cm/s</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ± {prediction.prediction.predicted_spread_rate_uncertainty} cm/s (Tree STD)
                    </p>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400">ESTIMATED BURN TIME</p>
                    <p className="text-xl font-bold font-mono text-orange-400">
                      {prediction.prediction.predicted_duration_s} <span className="text-xs text-slate-400">s</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Until extinction / burnout
                    </p>
                  </div>

                  <div className="glass-panel p-4 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-mono text-slate-400">EXPECTED ΔCO EMISSION</p>
                    <p className="text-xl font-bold font-mono text-rose-400">
                      {prediction.prediction.predicted_co_delta_ppm} <span className="text-xs text-slate-400">ppm</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ± {prediction.prediction.predicted_co_uncertainty} ppm
                    </p>
                  </div>
                </div>

                {/* Explainable AI: Feature Importances */}
                <div className="glass-panel p-5 rounded-2xl border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Model 5: Explainable AI Attribution</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">SHAP Feature Weights</span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={prediction.explainability.top_influencing_variables} 
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" domain={[0, 0.5]} stroke="#64748b" fontSize={10} />
                        <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={10} width={110} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#090e24', borderColor: '#00f2fe', fontSize: '11px', borderRadius: '8px' }}
                        />
                        <Bar dataKey="importance" fill="#00f2fe" radius={[0, 4, 4, 0]} name="Importance Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Nearest NASA Historical Flight Tests */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center space-x-1.5">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Corroborating NASA PSI-25 Flight Benchmarks</span>
                  </h4>

                  <div className="space-y-2">
                    {prediction.explainability.closest_nasa_experiments.map((bench) => (
                      <div key={bench.test_id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-300">
                            Test #{bench.test_id} ({bench.pi})
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            {(bench.similarity_score * 100).toFixed(0)}% MATCH
                          </span>
                        </div>
                        <p className="text-slate-300">
                          {bench.material} • {bench.actual_airflow} cm/s • {bench.actual_o2}% O₂
                        </p>
                        <p className="text-[11px] text-slate-400 italic">
                          "{bench.observations}"
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
              <div className="h-96 glass-panel rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Activity className="w-10 h-10 text-cyan-500/40" />
                <h3 className="text-sm font-semibold text-slate-300">
                  Ready to Analyze Mission Parameters
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Configure material, ambient O₂, and ventilation airflow on the left panel, then click "Execute Pre-Mission Assessment" to generate predictions grounded in NASA flight tests.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Multi-Scenario Comparator View (Scenario A vs B vs C) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Evaluate how altering spacecraft ventilation and atmospheric O₂ concentration affects combustion risk across parallel mission profiles.
            </p>
            <button
              onClick={runComparison}
              disabled={compareLoading}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Re-run Multi-Scenario Analysis</span>
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

                <div className="space-y-2 text-xs">
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
                      <span className="text-[10px] font-mono text-slate-500 block">PREDICTED OUTCOME</span>
                      <p className={`text-sm font-bold ${
                        comparisonResults[idx].prediction.outcome_code.includes('quench') ? 'text-blue-400' :
                        comparisonResults[idx].prediction.outcome_code.includes('sustained') ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {comparisonResults[idx].prediction.outcome_label}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block">SPREAD RATE</span>
                        <span className="text-cyan-300 font-semibold">
                          {comparisonResults[idx].prediction.predicted_spread_rate_cm_s} cm/s
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block">BURN DURATION</span>
                        <span className="text-orange-300 font-semibold">
                          {comparisonResults[idx].prediction.predicted_duration_s} s
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      "{comparisonResults[idx].prediction.scientific_rationale.slice(0, 110)}..."
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
