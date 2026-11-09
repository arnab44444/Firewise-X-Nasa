import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { FlameStudio } from './components/FlameStudio';
import { PreMissionAssessment } from './components/PreMissionAssessment';
import { AstronautAssistant } from './components/AstronautAssistant';
import { ResearchReports } from './components/ResearchReports';
import { ValidationView } from './components/ValidationView';
import { SystemStatus, Experiment, VideoInfo } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [videos, setVideos] = useState<VideoInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Status (with static fallback for Vercel deployment)
      try {
        const statusRes = await fetch('/api/status');
        if (statusRes.ok) {
          const sData: SystemStatus = await statusRes.json();
          setStatus(sData);
        } else {
          throw new Error('API offline, using static status');
        }
      } catch {
        const fbStatus = await fetch('/data/status.json');
        if (fbStatus.ok) {
          const sData: SystemStatus = await fbStatus.json();
          setStatus(sData);
        }
      }

      // 2. Experiments (with static fallback for Vercel deployment)
      try {
        const expRes = await fetch('/api/research/experiments');
        if (expRes.ok) {
          const eData = await expRes.json();
          setExperiments(eData.experiments || []);
        } else {
          throw new Error('API offline, using static experiments');
        }
      } catch {
        const fbExp = await fetch('/data/experiments.json');
        if (fbExp.ok) {
          const eList: Experiment[] = await fbExp.json();
          setExperiments(eList || []);
        }
      }

      // 3. Videos (with static fallback for Vercel deployment)
      try {
        const vidRes = await fetch('/api/flame/videos');
        if (vidRes.ok) {
          const vData = await vidRes.json();
          setVideos(vData.videos || []);
        } else {
          throw new Error('API offline, using static videos');
        }
      } catch {
        const fbVid = await fetch('/data/videos.json');
        if (fbVid.ok) {
          const vData = await fbVid.json();
          setVideos(vData.videos || []);
        }
      }
    } catch (err) {
      console.error('Error initializing platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedStudioTestId, setSelectedStudioTestId] = useState<string>('B1');

  const handleSelectExperimentForStudio = (testId: string) => {
    setSelectedStudioTestId(testId);
    setActiveTab('flame-studio');
  };

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black w-full max-w-full overflow-x-hidden">
      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={status ? 'NASA PSI-25 ONLINE' : 'CONNECTING...'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 min-w-0">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4 text-cyan-400">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono text-xs tracking-wider">
              CONNECTING TO NASA PSI-25 DATA ENGINES...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewDashboard
                status={status}
                experiments={experiments}
                onNavigate={setActiveTab}
                onSelectExperiment={(exp) => {
                  if (exp.has_video) {
                    setActiveTab('flame-studio');
                  } else {
                    setActiveTab('reports');
                  }
                }}
              />
            )}

            {activeTab === 'flame-studio' && (
              <FlameStudio videos={videos} initialTestId={selectedStudioTestId} />
            )}

            {activeTab === 'assessment' && (
              <PreMissionAssessment />
            )}

            {activeTab === 'astronaut-ai' && (
              <AstronautAssistant />
            )}

            {activeTab === 'reports' && (
              <ResearchReports
                experiments={experiments}
                onSelectVideoForStudio={handleSelectExperimentForStudio}
              />
            )}

            {activeTab === 'validation' && (
              <ValidationView />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">FIREWISE-X</span>
            <span>•</span>
            <span>NASA Physical Science Informatics (PSI-25) BASS-II Flight Investigation</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span>NASA/TM-20210011385</span>
            <span>•</span>
            <span>ISS Microgravity Science Glovebox</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
