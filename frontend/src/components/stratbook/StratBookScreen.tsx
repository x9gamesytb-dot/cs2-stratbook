import React, { useState, useEffect } from 'react';
import { Strat, TacticalPin, DrawingElement } from '../../types';
import { api } from '../../services/api';
import { TacticalDrawingCanvas } from './TacticalDrawingCanvas';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  ChevronRight,
  Sparkles,
  Edit,
  Trash2,
  Users,
  Info,
  Layers,
  X,
  Check,
  Flame,
  Cloud,
  Zap,
  RotateCcw
} from 'lucide-react';

export const StratBookScreen: React.FC = () => {
  const [maps] = useState<string[]>([
    'Mirage',
    'Inferno',
    'Nuke',
    'Anubis',
    'Ancient',
    'Dust II',
    'Vertigo'
  ]);
  const [selectedMap, setSelectedMap] = useState<string>('Mirage');
  const [strats, setStrats] = useState<Strat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStrat, setSelectedStrat] = useState<Strat | null>(null);

  // Filters
  const [buyPhaseFilter, setBuyPhaseFilter] = useState<string>('all');
  const [sideFilter, setSideFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapCounts, setMapCounts] = useState<Record<string, number>>({});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStrat, setEditingStrat] = useState<Partial<Strat> | null>(null);

  // Pin adding helper from Radar click
  const [newPinCoords, setNewPinCoords] = useState<{ x: number; y: number } | null>(null);

  const loadStrats = async () => {
    try {
      setLoading(true);
      const data = await api.getStrats({ map_name: selectedMap });
      setStrats(data);
      if (data.length > 0 && !selectedStrat) {
        setSelectedStrat(data[0]);
      } else if (data.length === 0) {
        setSelectedStrat(null);
      }
      const summary = await api.getMapStratsSummary();
      setMapCounts(summary);
    } catch (err) {
      console.error('Erreur chargement strats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrats();

    // Synchronisation en temps réel de l'équipe (toutes les 4 secondes)
    const syncInterval = setInterval(async () => {
      if (isModalOpen) return; // Ne pas interrompre si l'utilisateur est en train d'écrire dans la modal
      try {
        const freshStrats = await api.getStrats({ map_name: selectedMap });
        setStrats(freshStrats);
        setSelectedStrat((prev) => {
          if (!prev) return freshStrats.length > 0 ? freshStrats[0] : null;
          const matched = freshStrats.find((s) => s.id === prev.id);
          return matched || prev;
        });
      } catch (err) {
        // En cas de micro-coupure réseau temporaire, continuer silencieusement
      }
    }, 4000);

    return () => clearInterval(syncInterval);
  }, [selectedMap, isModalOpen]);

  // Les repères du radar sont strictement et uniquement assignés à la stratégie sélectionnée
  const currentMapPins = selectedStrat ? (selectedStrat.pins || []) : [];

  const filteredStrats = strats.filter((s) => {
    if (buyPhaseFilter !== 'all' && s.buy_phase !== buyPhaseFilter) return false;
    if (sideFilter !== 'all' && s.side !== sideFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const handleOpenCreate = (coords?: { x: number; y: number }) => {
    setEditingStrat({
      map_name: selectedMap,
      title: '',
      buy_phase: 'Full buy',
      side: 'T-Side',
      category: 'Execution',
      description: '',
      assigned_roles: {
        IGL: '',
        Entry: '',
        Support: '',
        'AWP / Sniper': '',
        Lurker: ''
      },
      callouts: [],
      pins: coords
        ? [
            {
              id: `pin-${Date.now()}`,
              x: coords.x,
              y: coords.y,
              type: 'smoke',
              side: 'T-Side',
              title: 'Nouveau repère',
              description: 'Alignement...',
              throw_type: 'Jumpthrow',
              player_role: 'Support'
            }
          ]
        : []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (strat: Strat) => {
    setEditingStrat({ ...strat });
    setIsModalOpen(true);
  };

  const handleDeleteStrat = async (id: number) => {
    if (!window.confirm('Supprimer cette stratégie ?')) return;
    try {
      await api.deleteStrat(id);
      await loadStrats();
      if (selectedStrat?.id === id) {
        setSelectedStrat(null);
      }
    } catch (err) {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleSaveDrawing = async (elements: DrawingElement[]) => {
    if (!selectedStrat) {
      return;
    }
    try {
      const updated = await api.updateStrat(selectedStrat.id, { drawing_data: elements });
      setSelectedStrat(updated);
      setStrats((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du schéma:', err);
    }
  };

  const handleUpdatePins = async (newPins: TacticalPin[]) => {
    if (!selectedStrat) return;
    try {
      const updated = await api.updateStrat(selectedStrat.id, { pins: newPins });
      setSelectedStrat(updated);
      setStrats((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour des repères:', err);
    }
  };

  const handleSaveStrat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStrat || !editingStrat.title) return;

    try {
      if (editingStrat.id) {
        await api.updateStrat(editingStrat.id, editingStrat);
      } else {
        await api.createStrat(editingStrat);
      }
      setIsModalOpen(false);
      setEditingStrat(null);
      await loadStrats();
    } catch (err) {
      alert('Erreur lors de la sauvegarde.');
    }
  };

  const addPinToEditingStrat = () => {
    if (!editingStrat) return;
    const currentPins = editingStrat.pins || [];
    const newPin: TacticalPin = {
      id: `pin-${Date.now()}`,
      x: newPinCoords ? newPinCoords.x : 50,
      y: newPinCoords ? newPinCoords.y : 50,
      type: 'smoke',
      side: editingStrat.side || 'T-Side',
      title: 'Repère utilitaire',
      description: '',
      throw_type: 'Jumpthrow',
      player_role: 'Support'
    };
    setEditingStrat({ ...editingStrat, pins: [...currentPins, newPin] });
  };

  const removePinFromEditingStrat = (index: number) => {
    if (!editingStrat || !editingStrat.pins) return;
    const updated = [...editingStrat.pins];
    updated.splice(index, 1);
    setEditingStrat({ ...editingStrat, pins: updated });
  };

  return (
    <div className="space-y-6">
      {/* Map Selector Pills */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 shadow-md backdrop-blur">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 tactical-font flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Map Pool Actif CS2</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {strats.length} stratégies sur {selectedMap}
          </span>
        </div>
        <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-thin">
          {maps.map((map) => {
            const count = mapCounts[map] || 0;
            const isSelected = selectedMap === map;
            return (
              <button
                key={map}
                onClick={() => {
                  setSelectedMap(map);
                  setSelectedStrat(null);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap tactical-font border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{map}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Radar on Left, Strat Book on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official CS2 Radar & Tactical Drawing Board */}
        <div className="lg:col-span-7 space-y-4">
          <TacticalDrawingCanvas
            mapName={selectedMap}
            stratId={selectedStrat?.id}
            stratTitle={selectedStrat?.title}
            stratSide={selectedStrat?.side}
            pins={currentMapPins}
            drawingData={selectedStrat?.drawing_data || []}
            onSaveDrawing={handleSaveDrawing}
            onUpdatePins={handleUpdatePins}
            onRadarClick={(coords) => {
              setNewPinCoords(coords);
              handleOpenCreate(coords);
            }}
          />
        </div>

        {/* Right Column: Strat Book & Details */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une exécution, smoke, retake..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Buy Phase Filter */}
            <select
              value={buyPhaseFilter}
              onChange={(e) => setBuyPhaseFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Toutes phases d'achat</option>
              <option value="Pistol">Pistol Round</option>
              <option value="Eco / Semi-buy">Eco / Semi-buy</option>
              <option value="Force buy">Force buy</option>
              <option value="Full buy">Full buy</option>
            </select>

            {/* Side Filter */}
            <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setSideFilter('all')}
                className={`px-2.5 py-1 rounded text-xs ${
                  sideFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSideFilter('T-Side')}
                className={`px-2.5 py-1 rounded text-xs ${
                  sideFilter === 'T-Side' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-orange-400'
                }`}
              >
                T
              </button>
              <button
                onClick={() => setSideFilter('CT-Side')}
                className={`px-2.5 py-1 rounded text-xs ${
                  sideFilter === 'CT-Side' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-sky-400'
                }`}
              >
                CT
              </button>
            </div>

            {/* Add Strat Button */}
            <button
              onClick={() => handleOpenCreate()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer une Strat</span>
            </button>
          </div>

          {/* Strat List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Chargement du Strat Book...</div>
          ) : filteredStrats.length === 0 ? (
            <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-xl text-center">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Aucune stratégie trouvée pour {selectedMap}</p>
              <p className="text-xs text-slate-500 mt-1">Créez votre première exécution ou cliquez sur la carte.</p>
              <button
                onClick={() => handleOpenCreate()}
                className="mt-4 px-3 py-1.5 rounded bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Créer une stratégie
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStrats.map((strat) => {
                const isSelected = selectedStrat?.id === strat.id;
                return (
                  <div
                    key={strat.id}
                    onClick={() => setSelectedStrat(strat)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                              strat.side === 'T-Side'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            }`}
                          >
                            {strat.side}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700 font-mono">
                            {strat.buy_phase}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] border border-amber-500/20">
                            {strat.category}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white tactical-font">{strat.title}</h4>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(strat);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStrat(strat.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {strat.description && (
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{strat.description}</p>
                    )}

                    {/* Assigned Roles Checklist (If selected or expanded) */}
                    {isSelected && strat.assigned_roles && Object.keys(strat.assigned_roles).length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 tactical-font">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Assignations & Rôles Spécifiques :</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(strat.assigned_roles).map(([role, task]) => {
                            if (!task) return null;
                            return (
                              <div
                                key={role}
                                className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-xs"
                              >
                                <span className="font-bold text-amber-400 font-mono">{role} : </span>
                                <span className="text-slate-300">{task}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tactical Pins Pill List */}
                    {strat.pins && strat.pins.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-mono">Utilitaires liés :</span>
                        {strat.pins.map((p, i) => (
                          <span
                            key={p.id || i}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] border border-slate-800 font-mono"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{p.title}</span>
                            <span className="text-slate-500">({p.throw_type})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create / Edit Strat */}
      {isModalOpen && editingStrat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white tactical-font">
                  {editingStrat.id ? 'Modifier la Stratégie' : 'Nouvelle Stratégie Tactique'} : {editingStrat.map_name}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveStrat} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Titre de la Stratégie *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Fast A Triple Smoke & Palace Push"
                    value={editingStrat.title || ''}
                    onChange={(e) => setEditingStrat({ ...editingStrat, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Map */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Map</label>
                  <select
                    value={editingStrat.map_name || selectedMap}
                    onChange={(e) => setEditingStrat({ ...editingStrat, map_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {maps.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Side */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Côté (Side)</label>
                  <select
                    value={editingStrat.side || 'T-Side'}
                    onChange={(e) => setEditingStrat({ ...editingStrat, side: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="T-Side">T-Side (Attaque)</option>
                    <option value="CT-Side">CT-Side (Défense)</option>
                  </select>
                </div>

                {/* Buy Phase */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phase d'achat</label>
                  <select
                    value={editingStrat.buy_phase || 'Full buy'}
                    onChange={(e) => setEditingStrat({ ...editingStrat, buy_phase: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pistol">Pistol Round</option>
                    <option value="Eco / Semi-buy">Eco / Semi-buy</option>
                    <option value="Force buy">Force buy</option>
                    <option value="Full buy">Full buy</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Catégorie</label>
                  <select
                    value={editingStrat.category || 'Execution'}
                    onChange={(e) => setEditingStrat({ ...editingStrat, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Execution">Exécution de site</option>
                    <option value="Mid Control">Prise de Mid / Map Control</option>
                    <option value="Default">Default / Setup passif</option>
                    <option value="Retake Setup">Setup de Retake</option>
                    <option value="Anti-Eco">Anti-Eco</option>
                    <option value="Utility Setups">Repères d'utilitaires purs</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Description & Schéma d'Exécution
                </label>
                <textarea
                  rows={3}
                  placeholder="Déroulement tactique, timing des utilitaires, prise de repères et replis en cas d'échec..."
                  value={editingStrat.description || ''}
                  onChange={(e) => setEditingStrat({ ...editingStrat, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Assigned Roles */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <label className="block text-xs font-semibold text-amber-400 uppercase tactical-font">
                  Assignations par Rôle
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['IGL', 'Entry', 'Support', 'AWP / Sniper', 'Lurker'].map((role) => (
                    <div key={role} className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 font-mono mb-1">{role} :</span>
                      <input
                        type="text"
                        placeholder={`Mission pour ${role}...`}
                        value={editingStrat.assigned_roles?.[role] || ''}
                        onChange={(e) =>
                          setEditingStrat({
                            ...editingStrat,
                            assigned_roles: {
                              ...(editingStrat.assigned_roles || {}),
                              [role]: e.target.value
                            }
                          })
                        }
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Pins Section */}
              <div className="space-y-3 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 uppercase tactical-font">
                    Repères d'Utilitaires (Pins sur Radar)
                  </span>
                  <button
                    type="button"
                    onClick={addPinToEditingStrat}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold"
                  >
                    <Plus className="w-3 h-3 text-amber-400" />
                    <span>Ajouter un repère</span>
                  </button>
                </div>

                {editingStrat.pins && editingStrat.pins.length > 0 ? (
                  <div className="space-y-2">
                    {editingStrat.pins.map((pin, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 block">Titre</label>
                          <input
                            type="text"
                            value={pin.title}
                            onChange={(e) => {
                              const updated = [...(editingStrat.pins || [])];
                              updated[idx].title = e.target.value;
                              setEditingStrat({ ...editingStrat, pins: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-slate-500 block">Type</label>
                          <select
                            value={pin.type}
                            onChange={(e) => {
                              const updated = [...(editingStrat.pins || [])];
                              updated[idx].type = e.target.value;
                              setEditingStrat({ ...editingStrat, pins: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            <option value="smoke">Smoke</option>
                            <option value="flash">Flash</option>
                            <option value="molotov">Molotov</option>
                            <option value="he">HE</option>
                            <option value="retake">Retake</option>
                            <option value="callout">Callout</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 block">Lancer (Throw Type)</label>
                          <select
                            value={pin.throw_type || 'Jumpthrow'}
                            onChange={(e) => {
                              const updated = [...(editingStrat.pins || [])];
                              updated[idx].throw_type = e.target.value;
                              setEditingStrat({ ...editingStrat, pins: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                          >
                            <option value="Left-click">Left-click</option>
                            <option value="Jumpthrow">Jumpthrow</option>
                            <option value="W-jumpthrow">W-jumpthrow</option>
                            <option value="Run-throw">Run-throw</option>
                            <option value="Right-click">Right-click</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-slate-500 block">Pos X / Y (%)</label>
                          <div className="flex space-x-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={pin.x}
                              onChange={(e) => {
                                const updated = [...(editingStrat.pins || [])];
                                updated[idx].x = parseFloat(e.target.value) || 0;
                                setEditingStrat({ ...editingStrat, pins: updated });
                              }}
                              className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={pin.y}
                              onChange={(e) => {
                                const updated = [...(editingStrat.pins || [])];
                                updated[idx].y = parseFloat(e.target.value) || 0;
                                setEditingStrat({ ...editingStrat, pins: updated });
                              }}
                              className="w-1/2 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-slate-200"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => removePinFromEditingStrat(idx)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Aucun repère associé pour l'instant. Cliquez sur le radar pour définir l'emplacement.
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer la Strat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
