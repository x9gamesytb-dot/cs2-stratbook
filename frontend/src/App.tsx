import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Navbar } from './components/layout/Navbar';
import { StratBookScreen } from './components/stratbook/StratBookScreen';
import { Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [totalStrats, setTotalStrats] = useState<number>(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const summary = await api.getStratsMapSummary();
        const total = Object.values(summary).reduce((a, b) => a + b, 0);
        setTotalStrats(total);
      } catch (err) {
        console.warn('API Strats en chargement...');
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Tactical Header */}
      <Navbar totalStratsCount={totalStrats} />

      {/* Main Strat Book & Map Pool Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StratBookScreen />
      </main>

      {/* Tactical Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060910] text-slate-500 text-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-bold uppercase">CS2 Tactical Stratbook</span>
            <span>•</span>
            <span className="text-slate-400">Official Radar Overviews & Vectorial Tactical Board</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>Pool Actif : Mirage, Inferno, Nuke, Anubis, Ancient, Dust II, Vertigo</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
