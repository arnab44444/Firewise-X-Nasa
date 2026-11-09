import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  Upload, 
  Download, 
  AlertTriangle, 
  Activity, 
  Maximize2, 
  Sliders, 
  Layers, 
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { VideoInfo, FlameAnalysisResult, FlameTimelinePoint } from '../types';

interface FlameStudioProps {
  videos: VideoInfo[];
  initialTestId?: string;
}

export const FlameStudio: React.FC<FlameStudioProps> = ({ videos, initialTestId }) => {
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestId || 'B1');

  useEffect(() => {
    if (initialTestId) {
      setSelectedTestId(initialTestId);
    }
  }, [initialTestId]);
  const [analysis, setAnalysis] = useState<FlameAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Video playback states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentFrameData, setCurrentFrameData] = useState<FlameTimelinePoint | null>(null);
  const [showMaskOverlay, setShowMaskOverlay] = useState<boolean>(true);
  const [showBoundingBox, setShowBoundingBox] = useState<boolean>(true);
  const [showCentroid, setShowCentroid] = useState<boolean>(true);

  // Fetch analysis data whenever selected test changes
  useEffect(() => {
    if (!selectedTestId) return;
    loadAnalysis(selectedTestId);
  }, [selectedTestId]);

  const loadAnalysis = async (testId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/flame/analyze?test_id=${testId}`);
      if (!res.ok) throw new Error(`Failed to load flame analysis for ${testId}`);
      const data: FlameAnalysisResult = await res.json();
      setAnalysis(data);
      if (data.timeline && data.timeline.length > 0) {
        setCurrentFrameData(data.timeline[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Sync canvas overlay with video playback time
  const handleTimeUpdate = () => {
    if (!videoRef.current || !analysis || !analysis.timeline.length) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Find closest timeline frame
    let closest = analysis.timeline[0];
    let minDiff = Math.abs(closest.time_s - t);
    for (const pt of analysis.timeline) {
      const diff = Math.abs(pt.time_s - t);
      if (diff < minDiff) {
        minDiff = diff;
        closest = pt;
      }
    }
    setCurrentFrameData(closest);
    drawOverlay(closest);
  };

  const drawOverlay = (pt: FlameTimelinePoint | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!pt || !pt.flame_detected) {
      // Draw chamber crosshairs
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      return;
    }

    // Scale from video resolution (720x480) to canvas display size
    const scaleX = canvas.width / 720;
    const scaleY = canvas.height / 480;

    const [bx, by, bw, bh] = pt.bbox;
    const cbx = bx * scaleX;
    const cby = by * scaleY;
    const cbw = bw * scaleX;
    const cbh = bh * scaleY;
    const cx = pt.centroid_x * scaleX;
    const cy = pt.centroid_y * scaleY;

    // 1. Synthetic AI Segmentation Glow / Mask
    if (showMaskOverlay) {
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, Math.max(cbw, cbh) / 1.5);
      grad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
      grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.5)');
      grad.addColorStop(0.8, 'rgba(2, 132, 199, 0.3)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, cbw / 1.8, cbh / 1.8, 0, 0, 2 * Math.PI);
      ctx.fill();
    }

    // 2. Bounding Box
    if (showBoundingBox) {
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(cbx, cby, cbw, cbh);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#00f2fe';
      ctx.font = '10px monospace';
      ctx.fillText(`FLAME [${pt.flame_area_cm2.toFixed(1)} cm²]`, cbx, Math.max(12, cby - 4));
    }

    // 3. Centroid Marker
    if (showCentroid) {
      ctx.strokeStyle = '#f97316';
      ctx.fillStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Crosshairs at centroid
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.stroke();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleChartClick = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const pt = e.activePayload[0].payload as FlameTimelinePoint;
      handleSeek(pt.time_s);
    }
  };

  const handleDownloadAnalysis = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FIREWISE_X_Analysis_${selectedTestId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedVideoInfo = videos.find(v => v.test_id === selectedTestId);

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-cyan-500/20">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>Flame Analysis Studio</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real NASA microgravity combustion videos with synchronized AI segmentation masks & temporal kinetics
          </p>
        </div>

        {/* Video selector */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-mono">SELECT FLIGHT TEST:</label>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="bg-slate-900 border border-cyan-500/40 text-cyan-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-cyan-400"
          >
            {videos.map((v) => (
              <option key={v.test_id} value={v.test_id}>
                Test #{v.test_id} — {v.material_category} ({v.initial_o2}% O₂)
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadAnalysis}
            disabled={!analysis}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
            title="Download JSON Flame Analysis"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Main Dual Player / Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original NASA Camera Video */}
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Raw Camera Feed: NASA ISS MSG
              </h3>
            </div>
            {selectedVideoInfo && (
              <span className="text-[10px] font-mono text-slate-400">
                {selectedVideoInfo.filename} ({selectedVideoInfo.size_mb} MB)
              </span>
            )}
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
            {selectedTestId ? (
              <video
                ref={videoRef}
                src={`/api/flame/video-stream/${selectedTestId}`}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
                playsInline
              />
            ) : (
              <p className="text-xs text-slate-500 font-mono">No video selected</p>
            )}

            {/* Video overlay watermark */}
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-slate-800">
              NASA PSI-25 | BASS-II
            </div>
          </div>
        </div>

        {/* Right: AI Segmentation HUD & Flame Detection */}
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <h3 className="text-sm font-bold text-cyan-300 font-mono uppercase">
                AI Segmentation & Kinematic HUD
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-300">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMaskOverlay}
                  onChange={(e) => setShowMaskOverlay(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>Mask</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoundingBox}
                  onChange={(e) => setShowBoundingBox(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>BBox</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCentroid}
                  onChange={(e) => setShowCentroid(e.target.checked)}
                  className="rounded text-cyan-500"
                />
                <span>Centroid</span>
              </label>
            </div>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/30 flex items-center justify-center">
            {/* Canvas for AI graphics */}
            <canvas
              ref={canvasRef}
              width={720}
              height={480}
              className="w-full h-full object-contain"
            />

            {/* Live Telemetry HUD Overlay */}
            {currentFrameData && (
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 grid grid-cols-4 gap-2 text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block">FLAME AREA</span>
                  <span className="text-orange-400 font-bold">
                    {currentFrameData.flame_area_cm2.toFixed(2)} cm²
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">CENTROID (X,Y)</span>
                  <span className="text-cyan-300">
                    {currentFrameData.centroid_x.toFixed(0)}, {currentFrameData.centroid_y.toFixed(0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">FRONT SPEED</span>
                  <span className="text-emerald-400">
                    {currentFrameData.spread_velocity_cm_s.toFixed(2)} cm/s
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">GROWTH (dA/dt)</span>
                  <span className={currentFrameData.growth_rate_da_dt >= 0 ? "text-cyan-400" : "text-rose-400"}>
                    {currentFrameData.growth_rate_da_dt.toFixed(2)} cm²/s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized Playback Controls & Frame Stepping (Requirement 5) */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 space-y-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all cursor-pointer font-bold shadow-md shadow-cyan-500/20"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            onClick={() => handleSeek(0)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset video"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Frame Stepping Buttons (Requirement 5) */}
          <div className="flex items-center space-x-1 border-l border-r border-slate-800 px-3">
            <button
              onClick={() => handleSeek(Math.max(0, currentTime - 5 / 29.97))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-300"
              title="Step back 5 frames"
            >
              -5f
            </button>
            <button
              onClick={() => handleSeek(Math.max(0, currentTime - 1 / 29.97))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-300"
              title="Step back 1 frame"
            >
              -1f
            </button>
            <button
              onClick={() => handleSeek(Math.min(duration || 45, currentTime + 1 / 29.97))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-300"
              title="Step forward 1 frame"
            >
              +1f
            </button>
            <button
              onClick={() => handleSeek(Math.min(duration || 45, currentTime + 5 / 29.97))}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-300"
              title="Step forward 5 frames"
            >
              +5f
            </button>
          </div>

          {/* Time scrubber slider */}
          <div className="flex-1 flex items-center space-x-3">
            <span className="text-xs font-mono text-cyan-300 w-12 text-right">
              {currentTime.toFixed(2)}s
            </span>
            <input
              type="range"
              min={0}
              max={duration || (analysis?.video_metadata.duration_s || 45)}
              step={0.033}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 w-12">
              {(duration || (analysis?.video_metadata.duration_s || 45)).toFixed(2)}s
            </span>
          </div>
        </div>

        {/* Caveats: Spatial Scale & Timing Synchronization (Requirements 5 & 9) */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
          <span>
            <strong>SPATIAL SCALE:</strong> ~30 px/cm calibrated to physical 7.6 cm flow duct inside MSG. Valid for central flow plane.
          </span>
          <span className="text-amber-400">
            <strong>TIMING STATUS:</strong> Discrete pre/post chamber telemetry (not continuously synchronized with video frames).
          </span>
        </div>
      </div>

      {/* Summary KPI Cards & Detected Anomalies */}
      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">PEAK FLAME AREA</p>
            <p className="text-2xl font-bold font-mono text-orange-400">
              {analysis.summary.max_flame_area_cm2.toFixed(1)} <span className="text-xs text-slate-400">cm²</span>
            </p>
            <p className="text-[11px] text-slate-400">At t = {analysis.summary.peak_area_timestamp_s.toFixed(1)}s</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">AVERAGE FLAME AREA</p>
            <p className="text-2xl font-bold font-mono text-cyan-300">
              {analysis.summary.avg_flame_area_cm2.toFixed(1)} <span className="text-xs text-slate-400">cm²</span>
            </p>
            <p className="text-[11px] text-slate-400">Across burning duration</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">STABILITY REGIME</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">
              {analysis.summary.flame_stability}
            </p>
            <p className="text-[11px] text-slate-400">Low-buoyancy microgravity state</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <p className="text-[10px] font-mono text-slate-400">EXTINCTION EVENT</p>
            <p className={`text-2xl font-bold font-mono ${analysis.summary.extinction_detected ? "text-rose-400" : "text-slate-300"}`}>
              {analysis.summary.extinction_detected ? `t = ${analysis.summary.extinction_time_s?.toFixed(1)}s` : 'Sustained'}
            </p>
            <p className="text-[11px] text-slate-400">
              {analysis.summary.extinction_detected ? 'Radiative Quench Observed' : 'Steady burn through run'}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Charts: Flame Area Timeline & Kinematics */}
      {analysis && analysis.timeline.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Flame Area vs Time Chart */}
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                <span>Flame Area Evolution: A(t) [cm²]</span>
              </h3>
              <span className="text-[10px] text-slate-400">Click graph to seek video</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analysis.timeline} onClick={handleChartClick}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="time_s" 
                    unit="s" 
                    stroke="#64748b" 
                    fontSize={10} 
                  />
                  <YAxis 
                    unit=" cm²" 
                    stroke="#64748b" 
                    fontSize={10} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090e24', borderColor: '#0284c7', fontSize: '11px', borderRadius: '8px' }}
                    labelFormatter={(val) => `Time: ${val}s`}
                  />
                  <ReferenceLine x={currentTime} stroke="#00f2fe" strokeWidth={2} label={{ value: 'NOW', fill: '#00f2fe', fontSize: 9 }} />
                  <Area 
                    type="monotone" 
                    dataKey="flame_area_cm2" 
                    stroke="#f97316" 
                    fillOpacity={1} 
                    fill="url(#areaGrad)" 
                    name="Area (cm²)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flame Front Velocity & Centroid Drift */}
          <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Flame Spread Velocity: Vf(t) [cm/s]</span>
              </h3>
              <span className="text-[10px] text-slate-400">Spatial Calibration ~30 px/cm</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysis.timeline} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="time_s" 
                    unit="s" 
                    stroke="#64748b" 
                    fontSize={10} 
                  />
                  <YAxis 
                    unit=" cm/s" 
                    stroke="#64748b" 
                    fontSize={10} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#090e24', borderColor: '#00f2fe', fontSize: '11px', borderRadius: '8px' }}
                    labelFormatter={(val) => `Time: ${val}s`}
                  />
                  <ReferenceLine x={currentTime} stroke="#00f2fe" strokeWidth={2} />
                  <Line 
                    type="monotone" 
                    dataKey="spread_velocity_cm_s" 
                    stroke="#38bdf8" 
                    dot={false}
                    strokeWidth={2}
                    name="Spread Speed (cm/s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
