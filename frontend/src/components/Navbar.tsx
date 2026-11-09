import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Activity, 
  FileText, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight,
  Radio
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatus: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, systemStatus }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Compass,
      desc: 'Mission control telemetry & flight dataset counts'
    },
    { 
      id: 'flame-studio', 
      label: 'Flame Studio', 
      icon: Flame,
      desc: 'Full video area timeline, stepping & masked CV HUD'
    },
    { 
      id: 'assessment', 
      label: 'Pre-Mission Assessment', 
      icon: Activity,
      desc: 'BASS-II empirical lookup & flight envelope bounds'
    },
    { 
      id: 'astronaut-ai', 
      label: 'Astronaut AI', 
      icon: Sparkles,
      desc: 'Grounded decision assistant citing NASA/TM-20210011385'
    },
    { 
      id: 'reports', 
      label: 'Research Reports', 
      icon: FileText,
      desc: '129 flight experiment archive & 9-part PDF generator'
    },
    { 
      id: 'validation', 
      label: 'Validation Suite', 
      icon: ShieldCheck,
      desc: '15-frame IoU benchmark, LOO-CV & failure audits'
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  const activeItem = navItems.find(item => item.id === activeTab) || navItems[0];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-md bg-[#070c1b]/90">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Section */}
        <div 
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group shrink-0"
          onClick={() => handleNavClick('overview')}
        >
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500/20 via-cyan-500/20 to-blue-600/20 border border-cyan-500/30 group-hover:border-cyan-400 transition-all duration-300 shrink-0">
            <Flame className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm group-hover:blur-md transition-all"></div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-base sm:text-lg bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                FIREWISE-X
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 whitespace-nowrap shrink-0">
                ISS PSI-25
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-tight -mt-0.5 whitespace-nowrap hidden sm:block">
              Microgravity Fire Intelligence & Astronaut Safety
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Visible on Large Screens >= 1280px) */}
        <nav className="hidden xl:flex items-center space-x-1 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Status Pill, CTA & Hamburger Menu Button */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Status Pill (Visible on md and above) */}
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs shrink-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono text-[11px] whitespace-nowrap">
              {systemStatus}
            </span>
          </div>

          {/* Launch Predictor Button (Desktop) */}
          <button
            onClick={() => handleNavClick('assessment')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Launch Predictor</span>
          </button>

          {/* Responsive Hamburger Toggle Button (Visible when < 1280px) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
            aria-expanded={isMenuOpen}
            className={`xl:hidden flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all cursor-pointer border ${
              isMenuOpen
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 ring-2 ring-cyan-500/30'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border-cyan-500/30 hover:border-cyan-400'
            }`}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 text-cyan-400" />
            ) : (
              <Menu className="w-5 h-5 text-cyan-400" />
            )}
            <span className="text-xs font-mono font-semibold tracking-wider">
              {isMenuOpen ? 'CLOSE' : 'MENU'}
            </span>
          </button>
        </div>
      </div>

      {/* Responsive Hamburger Drawer Menu (Overlay & Slide-Down) */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 top-16 bg-black/70 backdrop-blur-md z-40 xl:hidden animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="absolute top-full left-0 right-0 z-50 bg-[#090e1f] border-b border-cyan-500/30 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl px-4 py-5 max-h-[calc(100vh-4.5rem)] overflow-y-auto xl:hidden animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-2xl mx-auto space-y-4">
              
              {/* Current Active Tab Info Bar */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center space-x-2 text-slate-400">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>CURRENT MODULE:</span>
                </div>
                <span className="font-semibold text-cyan-300 flex items-center space-x-1.5">
                  <activeItem.icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{activeItem.label}</span>
                </span>
              </div>

              {/* Navigation Tabs List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/15 border-cyan-400/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                          : 'bg-slate-900/50 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-semibold ${isActive ? 'text-cyan-200' : 'text-slate-200'}`}>
                            {item.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 self-center shrink-0 ${
                        isActive ? 'text-cyan-400' : 'text-slate-600'
                      }`} />
                    </button>
                  );
                })}
              </div>

              {/* Mobile Actions & Engine Status */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleNavClick('assessment')}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  <span>Launch Pre-Mission Assessment</span>
                </button>

                <div className="flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-[11px]">{systemStatus}</span>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </header>
  );
};
