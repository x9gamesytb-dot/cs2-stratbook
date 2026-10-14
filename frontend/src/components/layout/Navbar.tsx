import React from 'react';
import { Shield, BookOpen, Layers, Compass, Crosshair } from 'lucide-react';

interface NavbarProps {
  totalStratsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ totalStratsCount = 0 }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
              <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-wider tactical-font text-white">
                  CS2 TACTICAL STRATBOOK
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-semibold">
                  SOURCE 2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                Map Pool Actif & Ardoise Tactique Vectorielle
              </p>
            </div>
          </div>

          {/* Tactical Badges & Quick Stats */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-mono font-medium">7 Maps Compétitives</span>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-mono font-semibold">
                {totalStratsCount > 0 ? `${totalStratsCount} Strats Prêtes` : 'Playbook Actif'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
export default Navbar;
