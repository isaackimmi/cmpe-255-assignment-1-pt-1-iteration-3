import React from 'react';
import { Trophy, BarChart3, BrainCircuit, Search, PlayCircle, Github } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Trophy },
    { id: 'eda', label: 'Home Advantage EDA', icon: BarChart3 },
    { id: 'models', label: 'Models & Calibration', icon: BrainCircuit },
    { id: 'explorer', label: 'Match Explorer', icon: Search },
    { id: 'simulator', label: 'Live Predictor', icon: PlayCircle },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#080C14]/85 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-black font-bold text-xl">
              ⚽
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">EURO SOCCER DS</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">CRISP-DM V3</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">CMPE 255 • Pre-Kickoff Outcome Prediction</p>
            </div>
          </div>

          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
