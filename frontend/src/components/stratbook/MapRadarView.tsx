import React, { useState } from 'react';
import { TacticalPin } from '../../types';
import {
  Flame,
  Cloud,
  Zap,
  Bomb,
  RotateCcw,
  Target,
  Plus,
  Compass
} from 'lucide-react';

interface MapRadarViewProps {
  mapName: string;
  pins: TacticalPin[];
  onPinClick?: (pin: TacticalPin) => void;
  onRadarClick?: (coords: { x: number; y: number }) => void;
  selectedPinId?: string | null;
}

export const MapRadarView: React.FC<MapRadarViewProps> = ({
  mapName,
  pins,
  onPinClick,
  onRadarClick,
  selectedPinId,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSide, setFilterSide] = useState<string>('all');
  const [hoveredPin, setHoveredPin] = useState<TacticalPin | null>(null);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onRadarClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onRadarClick({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  };

  const filteredPins = pins.filter((pin) => {
    if (filterType !== 'all' && pin.type !== filterType) return false;
    if (filterSide !== 'all' && pin.side !== filterSide) return false;
    return true;
  });

  const getPinIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'smoke':
        return <Cloud className="w-3.5 h-3.5 text-slate-100" />;
      case 'flash':
        return <Zap className="w-3.5 h-3.5 text-amber-950 font-bold" />;
      case 'molotov':
        return <Flame className="w-3.5 h-3.5 text-red-100" />;
      case 'he':
        return <Bomb className="w-3.5 h-3.5 text-amber-100" />;
      case 'retake':
        return <RotateCcw className="w-3.5 h-3.5 text-purple-100" />;
      default:
        return <Target className="w-3.5 h-3.5 text-sky-100" />;
    }
  };

  const getPinColor = (type: string, isSelected: boolean) => {
    if (isSelected) return 'ring-4 ring-amber-400 scale-125 z-30 shadow-lg shadow-amber-400/50';
    switch (type.toLowerCase()) {
      case 'smoke':
        return 'bg-slate-500 border-slate-300 hover:bg-slate-400 shadow-slate-900/50';
      case 'flash':
        return 'bg-amber-400 border-amber-200 hover:bg-amber-300 shadow-amber-500/50';
      case 'molotov':
        return 'bg-red-500 border-red-300 hover:bg-red-400 shadow-red-900/50';
      case 'he':
        return 'bg-orange-500 border-orange-300 hover:bg-orange-400 shadow-orange-900/50';
      case 'retake':
        return 'bg-purple-600 border-purple-300 hover:bg-purple-500 shadow-purple-900/50';
      default:
        return 'bg-sky-500 border-sky-300 hover:bg-sky-400 shadow-sky-900/50';
    }
  };

  // Coordonnées spécifiques pour les zones textuelles par map
  const getMapZones = (m: string) => {
    switch (m.toLowerCase()) {
      case 'mirage':
        return [
          { name: 'T SPAWN', x: 22, y: 78, color: '#f97316' },
          { name: 'A RAMP', x: 58, y: 72, color: '#cbd5e1' },
          { name: 'PALACE', x: 68, y: 82, color: '#cbd5e1' },
          { name: 'A SITE', x: 64, y: 64, color: '#38bdf8', isSite: true },
          { name: 'STAIRS', x: 59, y: 62, color: '#94a3b8' },
          { name: 'JUNGLE', x: 55, y: 56, color: '#94a3b8' },
          { name: 'WINDOW', x: 48, y: 52, color: '#94a3b8' },
          { name: 'TOP MID', x: 38, y: 58, color: '#cbd5e1' },
          { name: 'UNDERPASS', x: 42, y: 64, color: '#94a3b8' },
          { name: 'CONNECTOR', x: 52, y: 62, color: '#cbd5e1' },
          { name: 'B APTS', x: 28, y: 35, color: '#cbd5e1' },
          { name: 'B SITE', x: 38, y: 28, color: '#38bdf8', isSite: true },
          { name: 'CATWALK / SHORT', x: 44, y: 42, color: '#cbd5e1' },
          { name: 'MARKET / KITCHEN', x: 52, y: 32, color: '#94a3b8' },
          { name: 'CT SPAWN', x: 66, y: 44, color: '#38bdf8' },
        ];
      case 'inferno':
        return [
          { name: 'T SPAWN', x: 80, y: 80, color: '#f97316' },
          { name: 'BANANA', x: 40, y: 55, color: '#cbd5e1' },
          { name: 'CAR', x: 42, y: 42, color: '#94a3b8' },
          { name: 'B SITE', x: 36, y: 30, color: '#38bdf8', isSite: true },
          { name: 'COFFINS', x: 34, y: 22, color: '#94a3b8' },
          { name: 'CT SPAWN', x: 55, y: 24, color: '#38bdf8' },
          { name: 'MID', x: 60, y: 62, color: '#cbd5e1' },
          { name: 'BOILER / APTS', x: 65, y: 48, color: '#cbd5e1' },
          { name: 'A SHORT', x: 58, y: 40, color: '#94a3b8' },
          { name: 'A LONG', x: 74, y: 45, color: '#94a3b8' },
          { name: 'PIT', x: 78, y: 32, color: '#cbd5e1' },
          { name: 'A SITE', x: 68, y: 32, color: '#38bdf8', isSite: true },
        ];
      case 'nuke':
        return [
          { name: 'T SPAWN', x: 20, y: 80, color: '#f97316' },
          { name: 'OUTSIDE', x: 65, y: 55, color: '#cbd5e1' },
          { name: 'GARAGE', x: 75, y: 45, color: '#94a3b8' },
          { name: 'SECRET', x: 72, y: 30, color: '#cbd5e1' },
          { name: 'LOBBY', x: 35, y: 60, color: '#cbd5e1' },
          { name: 'RADIO', x: 40, y: 48, color: '#94a3b8' },
          { name: 'RAMP', x: 45, y: 40, color: '#cbd5e1' },
          { name: 'A SITE (UPPER)', x: 48, y: 58, color: '#38bdf8', isSite: true },
          { name: 'B SITE (LOWER)', x: 50, y: 28, color: '#38bdf8', isSite: true },
          { name: 'HUT', x: 42, y: 64, color: '#94a3b8' },
          { name: 'SQUEAKY', x: 38, y: 55, color: '#94a3b8' },
          { name: 'CT SPAWN', x: 55, y: 70, color: '#38bdf8' },
        ];
      default:
        return [
          { name: 'T SPAWN', x: 25, y: 80, color: '#f97316' },
          { name: 'MID', x: 50, y: 50, color: '#cbd5e1' },
          { name: 'A SITE', x: 70, y: 40, color: '#38bdf8', isSite: true },
          { name: 'B SITE', x: 30, y: 30, color: '#38bdf8', isSite: true },
          { name: 'CT SPAWN', x: 60, y: 20, color: '#38bdf8' },
        ];
    }
  };

  const zones = getMapZones(mapName);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
      {/* Radar Header & Filters */}
      <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="font-bold uppercase tracking-wider text-slate-200 tactical-font">
            RADAR TACTIQUE : {mapName}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px]">
            {filteredPins.length} Repères
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {/* Side Filter */}
          <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              onClick={() => setFilterSide('all')}
              className={`px-2 py-0.5 rounded ${
                filterSide === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterSide('T-Side')}
              className={`px-2 py-0.5 rounded ${
                filterSide === 'T-Side' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-orange-400'
              }`}
            >
              T
            </button>
            <button
              onClick={() => setFilterSide('CT-Side')}
              className={`px-2 py-0.5 rounded ${
                filterSide === 'CT-Side' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-sky-400'
              }`}
            >
              CT
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tous les utilitaires</option>
            <option value="smoke">Smokes</option>
            <option value="flash">Flashbangs</option>
            <option value="molotov">Molotovs</option>
            <option value="he">HE Grenades</option>
            <option value="retake">Setups Retake</option>
            <option value="callout">Callouts & Repères</option>
          </select>
        </div>
      </div>

      {/* Interactive Map Radar Canvas */}
      <div className="relative w-full aspect-square max-h-[500px] bg-[#0c121e] overflow-hidden select-none cursor-crosshair group">
        {/* Radar Background Vector / Grid Layout */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full pointer-events-auto"
          onClick={handleSvgClick}
        >
          {/* Subtle Radar Grid Lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#172338" strokeWidth="0.3" />
            </pattern>
            <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0b0f19" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* Radar background */}
          <rect width="100" height="100" fill="url(#radarScan)" />
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Radar Circles */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2d47" strokeWidth="0.5" strokeDasharray="1,2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="#1f2d47" strokeWidth="0.5" strokeDasharray="1,2" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="#1f2d47" strokeWidth="0.5" strokeDasharray="1,2" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="#1f2d47" strokeWidth="0.3" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="#1f2d47" strokeWidth="0.3" />

          {/* Schematic Blueprint Shapes representing CS2 Map Pathways */}
          <g opacity="0.35" stroke="#334155" strokeWidth="1.2" fill="none">
            {/* Outer bounds / Main paths */}
            <path d="M 20 85 L 25 70 L 40 60 L 50 62 L 65 65 L 75 80 Z" stroke="#f97316" strokeWidth="0.8" />
            <path d="M 25 70 L 28 35 L 38 28 L 52 32 L 66 44 L 64 64 Z" stroke="#38bdf8" strokeWidth="0.8" />
            <rect x="60" y="60" width="10" height="10" rx="1.5" fill="#0369a1" fillOpacity="0.3" />
            <rect x="34" y="24" width="10" height="10" rx="1.5" fill="#0369a1" fillOpacity="0.3" />
            <path d="M 40 60 L 45 42 L 55 42 L 60 60" stroke="#64748b" strokeWidth="1" strokeDasharray="2,1" />
          </g>

          {/* Map Zone Labels */}
          {zones.map((zone, idx) => (
            <g key={idx} className="pointer-events-none">
              {zone.isSite && (
                <circle cx={zone.x} cy={zone.y} r="5" fill="#0284c7" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="0.5" />
              )}
              <text
                x={zone.x}
                y={zone.y}
                fill={zone.color}
                fontSize={zone.isSite ? "3.2" : "2.4"}
                fontWeight={zone.isSite ? "bold" : "600"}
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily="Chakra Petch"
                opacity={zone.isSite ? 0.95 : 0.65}
              >
                {zone.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Interactive Tactical Pins Overlaid */}
        {filteredPins.map((pin, index) => {
          const isSelected = selectedPinId === pin.id;
          return (
            <div
              key={pin.id || index}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                if (onPinClick) onPinClick(pin);
              }}
              onMouseEnter={() => setHoveredPin(pin)}
              onMouseLeave={() => setHoveredPin(null)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 group/pin"
            >
              {/* Pulse effect if selected */}
              {isSelected && (
                <div className="absolute inset-0 rounded-full bg-amber-400 radar-ping opacity-75" />
              )}

              {/* Pin badge */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-md transition-all ${getPinColor(
                  pin.type,
                  isSelected
                )}`}
              >
                {getPinIcon(pin.type)}
              </div>

              {/* Mini Label badge under pin */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] text-slate-200 whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none z-20 shadow-md">
                {pin.title}
              </div>
            </div>
          );
        })}

        {/* Tooltip Card for Hovered or Selected Pin */}
        {hoveredPin && (
          <div
            style={{
              left: `${Math.min(Math.max(hoveredPin.x, 15), 85)}%`,
              top: `${hoveredPin.y > 60 ? hoveredPin.y - 12 : hoveredPin.y + 12}%`,
            }}
            className="absolute -translate-x-1/2 z-40 bg-slate-950/95 border border-amber-500/50 rounded-lg p-2.5 shadow-2xl text-xs max-w-xs pointer-events-none backdrop-blur-md"
          >
            <div className="flex items-center justify-between space-x-2 mb-1">
              <span className="font-bold text-amber-400 tactical-font">{hoveredPin.title}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold font-mono ${
                  hoveredPin.side === 'T-Side' ? 'bg-orange-500/20 text-orange-400' : 'bg-sky-500/20 text-sky-400'
                }`}
              >
                {hoveredPin.side}
              </span>
            </div>
            {hoveredPin.description && (
              <p className="text-slate-300 text-[11px] leading-tight mb-1.5">{hoveredPin.description}</p>
            )}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800 pt-1">
              <span>Type: <strong className="text-slate-200">{hoveredPin.throw_type || 'Jumpthrow'}</strong></span>
              <span>Rôle: <strong className="text-slate-200">{hoveredPin.player_role || 'All'}</strong></span>
            </div>
          </div>
        )}

        {/* Helper footer inside radar */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm pointer-events-none">
          <span>💡 Cliquez sur la carte pour définir les coordonnées d'un nouveau repère.</span>
          <span className="font-mono text-slate-300">Coordonnées: 0-100%</span>
        </div>
      </div>
    </div>
  );
};
