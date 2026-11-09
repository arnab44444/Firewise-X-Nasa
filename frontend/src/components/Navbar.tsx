import React from 'react';
import { Flame, Activity, ShieldAlert, FileText, Compass, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemStatus }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'flame-studio', label: 'Flame Studio', icon: Flame },
    { id: 'assessment', label: 'Pre-Mission Assessment', icon: Activity },
    { id: 'astronaut-ai', label: 'Astronaut AI', icon: Sparkles },
    { id: 'reports', label: 'Research Reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab('overview')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 via-cyan-500/20 to-blue-600/20 border border-cyan-500/30 group-hover:border-cyan-400 transition-all duration-300">
            <Flame className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm group-hover:blur-md transition-all"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                FIREWISE-X
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                ISS PSI-25
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight -mt-0.5">
              Microgravity Fire Intelligence & Astronaut Safety
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              {systemStatus}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('assessment')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Launch Predictor</span>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/60 bg-slate-950/80 text-xs overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded ${
                isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
