import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Flame, 
  X, 
  CheckCircle2, 
  Layers,
  FileCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Experiment, EvidenceCardData } from '../types';
import { EvidenceCard } from './EvidenceCard';

interface ResearchReportsProps {
  experiments: Experiment[];
  onSelectVideoForStudio?: (testId: string) => void;
}

export const ResearchReports: React.FC<ResearchReportsProps> = ({ 
  experiments,
  onSelectVideoForStudio 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPI, setSelectedPI] = useState<string>('ALL');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceCardData | null>(null);
  const [downloadingTestId, setDownloadingTestId] = useState<string | null>(null);

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const pis = ['ALL', 'Bhattacharjee', 'Ferkul', 'Fernandez-Pello', 'Miller', 'Olson', "T'ien"];
  const materials = [
    'ALL',
    'PMMA Thin Film',
    'PMMA Thick Slab',
    'PMMA Clear Rod',
    'PMMA Black Rod',
    'SIBAL Fabric',
    'Nomex III',
    'Japan Wax Candle',
    'PMMA Sphere'
  ];
  const outcomes = ['ALL', 'extinguished_quenched', 'sustained', 'extinguished_blowoff', 'no_ignition'];

  const filteredExperiments = experiments.filter(e => {
    const matchesSearch = !searchTerm || 
      e.test_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.fuel_material_raw.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.pi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.observations.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPI = selectedPI === 'ALL' || e.pi.toLowerCase() === selectedPI.toLowerCase();
    const matchesMat = selectedMaterial === 'ALL' || e.material_category === selectedMaterial;
    const matchesOutcome = selectedOutcome === 'ALL' || e.outcome === selectedOutcome;

    return matchesSearch && matchesPI && matchesMat && matchesOutcome;
  });

  // Reset pagination to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPI, selectedMaterial, selectedOutcome]);

  const totalPages = Math.ceil(filteredExperiments.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredExperiments.length);
  const paginatedExperiments = filteredExperiments.slice(startIndex, endIndex);

  // Generate pagination page list with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const loadEvidenceCard = async (testId: string) => {
    try {
      const res = await fetch(`/api/research/evidence/${testId}`);
      if (res.ok) {
        const evData: EvidenceCardData = await res.json();
        setSelectedEvidence(evData);
      }
    } catch (err) {
      console.error('Error loading evidence card:', err);
    }
  };

  const handleDownloadPDF = async (exp: Experiment) => {
    setDownloadingTestId(exp.test_id);
    try {
      const res = await fetch('/api/research/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: exp.test_id,
          title: `NASA PSI-25 Investigation: Test ${exp.test_id} (${exp.pi})`
        })
      });
      if (!res.ok) throw new Error('PDF generation failed.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIREWISE_X_Report_${exp.test_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Report Error: ${err.message}`);
    } finally {
      setDownloadingTestId(null);
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header */}
      <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Research Intelligence & Reports</span>
          </h2>
          <p className="text-xs text-slate-400">
            Searchable experimental repository of 129 NASA PSI-25 flight trials with 1-click 9-part PDF report export
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-300">
          <span>
            SHOWING {filteredExperiments.length > 0 ? startIndex + 1 : 0}–{endIndex} OF {filteredExperiments.length} TESTS
          </span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px]">
            PAGE {currentPage}/{totalPages}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test ID, material, notes..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* PI Filter */}
        <div>
          <select
            value={selectedPI}
            onChange={(e) => setSelectedPI(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {pis.map(p => (
              <option key={p} value={p}>
                PI: {p}
              </option>
            ))}
          </select>
        </div>

        {/* Material Filter */}
        <div>
          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {materials.map(m => (
              <option key={m} value={m}>
                Material: {m}
              </option>
            ))}
          </select>
        </div>

        {/* Outcome Filter */}
        <div>
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {outcomes.map(o => (
              <option key={o} value={o}>
                Outcome: {o.replace('extinguished_', '').replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Experiments Table */}
      <div className="glass-panel rounded-2xl border border-cyan-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-[11px] font-mono text-cyan-400 border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Test ID</th>
                <th className="py-3 px-4">PI</th>
                <th className="py-3 px-4">Fuel Material</th>
                <th className="py-3 px-4">Thickness</th>
                <th className="py-3 px-4">Initial O₂</th>
                <th className="py-3 px-4">Flow Velocity</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Video</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {paginatedExperiments.map((exp) => (
                <tr 
                  key={exp.id} 
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => setSelectedExperiment(exp)}
                >
                  <td className="py-3 px-4 font-bold text-white group-hover:text-cyan-300">
                    #{exp.test_id}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{exp.pi}</td>
                  <td className="py-3 px-4 text-slate-200 font-sans max-w-[200px] truncate" title={exp.fuel_material_raw}>
                    {exp.fuel_material_raw}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{exp.thickness_mm} mm</td>
                  <td className="py-3 px-4 text-cyan-300 font-bold">{exp.calibrated_initial_o2_vol_pct}%</td>
                  <td className="py-3 px-4 text-orange-400">{exp.airflow_velocity_cm_s} cm/s</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      exp.outcome.includes('quench') ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                      exp.outcome.includes('sustained') ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                      exp.outcome.includes('blow') ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {exp.outcome.replace('extinguished_', '')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {exp.has_video ? (
                      <span className="text-[10px] text-orange-400 flex items-center space-x-1">
                        <Flame className="w-3 h-3" />
                        <span>MP4</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => loadEvidenceCard(exp.test_id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-cyan-500/30 inline-flex items-center space-x-1 transition-all cursor-pointer text-[10px]"
                      title="Open Scientific Evidence Card (Requirement 3)"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>Evidence</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(exp)}
                      disabled={downloadingTestId === exp.test_id}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 inline-flex items-center space-x-1 transition-all cursor-pointer text-[10px]"
                      title="Download 9-part Technical Report PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>{downloadingTestId === exp.test_id ? '...' : 'PDF'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Bar (10 per page) */}
        <div className="p-3.5 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="text-slate-400 text-[11px]">
            Showing <span className="text-cyan-300 font-bold">{filteredExperiments.length > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="text-cyan-300 font-bold">{endIndex}</span> of{' '}
            <span className="text-white font-bold">{filteredExperiments.length}</span> tests (10 per page)
          </div>

          <div className="flex items-center space-x-1">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
              {getPageNumbers().map((p, i) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${i}`} className="px-1.5 text-slate-600 text-[11px]">
                      ...
                    </span>
                  );
                }
                const pageNum = p as number;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Card Modal (Requirement 3) */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl relative">
            <button
              onClick={() => setSelectedEvidence(null)}
              className="absolute -top-3 -right-3 z-10 bg-slate-800 text-slate-300 hover:text-white p-1.5 rounded-full border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
            <EvidenceCard evidence={selectedEvidence} />
          </div>
        </div>
      )}

      {/* Experiment Detail Modal */}
      {selectedExperiment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-cyan-500/30 p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedExperiment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
              <h3 className="text-lg font-bold text-white font-mono">
                NASA BASS-II Experiment Record: #{selectedExperiment.test_id}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800 font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">PI</span>
                <span className="text-slate-200">{selectedExperiment.pi}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DATE / GMT</span>
                <span className="text-slate-200">{selectedExperiment.date} (GMT {selectedExperiment.gmt})</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SAMPLE #</span>
                <span className="text-slate-200">{selectedExperiment.sample_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">FLOW GEOMETRY</span>
                <span className="text-slate-200 capitalize">{selectedExperiment.flow_geometry}</span>
              </div>
            </div>

            {/* Test Conditions */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">Input Conditions & Sensors</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Fuel Material:</span>
                  <span className="text-white font-medium">{selectedExperiment.fuel_material_raw}</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Thickness: {selectedExperiment.thickness_mm} mm | Width: {selectedExperiment.width_cm} cm
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Atmosphere & Flow:</span>
                  <span className="text-cyan-300 font-bold">{selectedExperiment.calibrated_initial_o2_vol_pct}% O₂</span>
                  <span className="text-slate-300 block">Flow: {selectedExperiment.airflow_velocity_cm_s} cm/s (Restrictor {selectedExperiment.flow_restrictor})</span>
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase">NASA Flight Observations</h4>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
                "{selectedExperiment.observations}"
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {selectedExperiment.has_video && onSelectVideoForStudio ? (
                <button
                  onClick={() => {
                    onSelectVideoForStudio(selectedExperiment.test_id);
                    setSelectedExperiment(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Inspect in Flame Studio</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500">No video recorded for this run</span>
              )}

              <button
                onClick={() => handleDownloadPDF(selectedExperiment)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all shadow-md shadow-cyan-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export 9-Part Scientific PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
