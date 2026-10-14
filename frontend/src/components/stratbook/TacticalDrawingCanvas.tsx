import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TacticalPin, DrawingElement, DrawingToolType, DrawingPoint } from '../../types';
import {
  MousePointer,
  MapPin,
  Pencil,
  MoveRight,
  Minus,
  Circle,
  Cloud,
  Zap,
  Flame,
  Bomb,
  Shield,
  RotateCcw,
  RotateCw,
  Trash2,
  Save,
  Check,
  Eye,
  Crosshair,
  Crown,
  Anchor,
  Target
} from 'lucide-react';

interface TacticalDrawingCanvasProps {
  mapName: string;
  stratId?: number;
  stratTitle?: string;
  stratSide?: string;
  pins: TacticalPin[];
  drawingData?: DrawingElement[];
  onSaveDrawing?: (elements: DrawingElement[]) => void;
  onUpdatePins?: (updatedPins: TacticalPin[]) => void;
  onRadarClick?: (coords: { x: number; y: number }) => void;
  onPinClick?: (pin: TacticalPin) => void;
}

export const TacticalDrawingCanvas: React.FC<TacticalDrawingCanvasProps> = ({
  mapName,
  stratId,
  stratTitle,
  stratSide,
  pins = [],
  drawingData = [],
  onSaveDrawing,
  onUpdatePins,
  onRadarClick,
  onPinClick,
}) => {
  // Elements state (drawings, shapes, stamps, roles)
  const [elements, setElements] = useState<DrawingElement[]>(drawingData);
  const [history, setHistory] = useState<DrawingElement[][]>([drawingData]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Pins state (isolated strictly to this strategy)
  const [localPins, setLocalPins] = useState<TacticalPin[]>(pins);

  // Selection states
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Dragging states & movement detection
  const [isDraggingElement, setIsDraggingElement] = useState<boolean>(false);
  const [dragStartPoint, setDragStartPoint] = useState<DrawingPoint | null>(null);
  const [dragOriginalPoints, setDragOriginalPoints] = useState<DrawingPoint[]>([]);
  const hasMovedElementRef = useRef<boolean>(false);

  const [isDraggingPin, setIsDraggingPin] = useState<boolean>(false);
  const [dragStartPinPoint, setDragStartPinPoint] = useState<DrawingPoint | null>(null);
  const [dragOriginalPinCoords, setDragOriginalPinCoords] = useState<{ x: number; y: number } | null>(null);
  const hasMovedPinRef = useRef<boolean>(false);

  // Active tool & drawing mode
  const [currentTool, setCurrentTool] = useState<DrawingToolType | 'add_pin'>('arrow');
  const [currentColor, setCurrentColor] = useState<string>('#f97316'); // Default T-Side Orange
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPoints, setCurrentPoints] = useState<DrawingPoint[]>([]);

  // Feedback states
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [hoveredPin, setHoveredPin] = useState<TacticalPin | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const prevStratIdRef = useRef<number | undefined>(stratId);

  // Sync data from props: Only reset selection when switching to a DIFFERENT strategy!
  useEffect(() => {
    if (prevStratIdRef.current !== stratId) {
      prevStratIdRef.current = stratId;
      const initialDrawings = drawingData || [];
      setElements(initialDrawings);
      setHistory([initialDrawings]);
      setHistoryIndex(0);
      setLocalPins(pins || []);
      setSelectedElementId(null);
      setSelectedPinId(null);
      setHoveredPin(null);
      setIsDraggingElement(false);
      setIsDraggingPin(false);
    } else {
      // Strat is the same: update local state while preserving selectedElementId and selectedPinId!
      if (drawingData) {
        setElements(drawingData);
      }
      if (pins) {
        setLocalPins(pins);
      }
    }
  }, [stratId, drawingData, pins]);

  // Radar Image mapping
  const getMapRadarImage = (name: string): string => {
    const clean = name.toLowerCase().replace(/\s+/g, '');
    switch (clean) {
      case 'mirage':
        return '/maps/de_mirage_radar_psd.png';
      case 'inferno':
        return '/maps/de_inferno_radar_psd.png';
      case 'nuke':
        return '/maps/de_nuke_radar_psd.png';
      case 'anubis':
        return '/maps/de_anubis_radar_psd.png';
      case 'ancient':
        return '/maps/de_ancient_radar_psd.png';
      case 'dust2':
      case 'dustii':
        return '/maps/de_dust2_radar_psd.png';
      case 'vertigo':
        return '/maps/de_vertigo_radar_psd.png';
      default:
        return '/maps/de_mirage_radar_psd.png';
    }
  };

  /**
   * Exact zero-offset SVG coordinate calculator.
   * Maps mouse pixels directly into the 0..100 viewBox via SVG Matrix Transformation.
   */
  const getSvgCoordinates = useCallback((e: React.MouseEvent<any> | MouseEvent): DrawingPoint => {
    if (!svgRef.current) return { x: 50, y: 50 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return {
        x: Math.round(Math.max(0, Math.min(100, transformed.x)) * 100) / 100,
        y: Math.round(Math.max(0, Math.min(100, transformed.y)) * 100) / 100,
      };
    }
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.round(Math.max(0, Math.min(100, x)) * 100) / 100,
      y: Math.round(Math.max(0, Math.min(100, y)) * 100) / 100,
    };
  }, []);

  // Commit updated elements array to history and trigger auto-save
  const commitElementsUpdate = useCallback(
    (newElements: DrawingElement[]) => {
      setElements(newElements);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      if (onSaveDrawing) {
        onSaveDrawing(newElements);
      }
    },
    [history, historyIndex, onSaveDrawing]
  );

  // Commit updated pins array and trigger auto-save
  const commitPinsUpdate = useCallback(
    (newPins: TacticalPin[]) => {
      setLocalPins(newPins);
      if (onUpdatePins) {
        onUpdatePins(newPins);
      }
    },
    [onUpdatePins]
  );

  // Keyboard shortcut listener to delete selected item (drawing element OR pin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

        // If a pin is selected, delete it directly from the map
        if (selectedPinId) {
          e.preventDefault();
          const remainingPins = localPins.filter((p) => p.id !== selectedPinId);
          commitPinsUpdate(remainingPins);
          setSelectedPinId(null);
          setHoveredPin(null);
          return;
        }

        // If a drawing element is selected, delete it
        if (selectedElementId) {
          e.preventDefault();
          const remaining = elements.filter((el) => el.id !== selectedElementId);
          commitElementsUpdate(remaining);
          setSelectedElementId(null);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedPinId, elements, localPins, commitElementsUpdate, commitPinsUpdate]);

  // Click on SVG radar surface: draw, place stamp, place pin, or deselect
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Left click only
    const point = getSvgCoordinates(e);

    // 1. If Add Pin tool is selected: add a tactical pin directly to the current strat
    if (currentTool === 'add_pin') {
      if (!stratId) {
        alert('Sélectionnez d\'abord une stratégie à droite pour lui ajouter ce repère.');
        return;
      }
      const newPin: TacticalPin = {
        id: `pin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        x: point.x,
        y: point.y,
        type: 'smoke',
        side: stratSide || 'T-Side',
        title: `Smoke ${localPins.length + 1}`,
        description: 'Repère à renseigner...',
        throw_type: 'Jumpthrow',
        player_role: 'Support',
      };
      const updated = [...localPins, newPin];
      commitPinsUpdate(updated);
      setSelectedPinId(newPin.id || null);
      setSelectedElementId(null);
      return;
    }

    // 2. If Select Tool is active: clicking empty space deselects everything
    if (currentTool === 'select') {
      setSelectedElementId(null);
      setSelectedPinId(null);
      return;
    }

    // 3. Player Role Stamps Placement
    if (['role_entry', 'role_igl', 'role_snipe', 'role_bombe', 'role_fixe', 'role_lurk'].includes(currentTool)) {
      const roleName = currentTool.replace('role_', '');
      const defaultRoleColors: Record<string, string> = {
        entry: '#f97316',
        igl: '#eab308',
        snipe: '#38bdf8',
        bombe: '#ef4444',
        fixe: '#22c55e',
        lurk: '#a855f7',
      };
      const stampElement: DrawingElement = {
        id: `role-${roleName}-${Date.now()}`,
        tool: currentTool,
        color: currentColor || defaultRoleColors[roleName] || '#f97316',
        width: 4,
        points: [point],
        role: roleName,
        label: roleName.toUpperCase(),
      };
      commitElementsUpdate([...elements, stampElement]);
      setSelectedElementId(stampElement.id);
      setSelectedPinId(null);
      return;
    }

    // 4. Utility Stamps Placement (smoke, flash, molotov, he, c4)
    if (['smoke', 'flash', 'molotov', 'he', 'c4'].includes(currentTool)) {
      const utilityColors: Record<string, string> = {
        smoke: '#cbd5e1',
        flash: '#facc15',
        molotov: '#ef4444',
        he: '#fb923c',
        c4: '#dc2626',
      };
      const stampElement: DrawingElement = {
        id: `util-${currentTool}-${Date.now()}`,
        tool: currentTool,
        color: utilityColors[currentTool] || currentColor,
        width: strokeWidth,
        points: [point],
      };
      commitElementsUpdate([...elements, stampElement]);
      setSelectedElementId(stampElement.id);
      setSelectedPinId(null);
      return;
    }

    // 5. Vector Path Tools (arrow, pen, line, circle)
    setIsDrawing(true);
    setCurrentPoints([point, point]);
    setSelectedElementId(null);
    setSelectedPinId(null);
  };

  // Dragging selected element or pin, or drawing path
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    // A. Dragging a Pin
    if (isDraggingPin && selectedPinId && dragStartPinPoint && dragOriginalPinCoords) {
      const currentPos = getSvgCoordinates(e);
      const dx = currentPos.x - dragStartPinPoint.x;
      const dy = currentPos.y - dragStartPinPoint.y;

      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        hasMovedPinRef.current = true;
      }

      const newX = Math.round(Math.max(1, Math.min(99, dragOriginalPinCoords.x + dx)) * 100) / 100;
      const newY = Math.round(Math.max(1, Math.min(99, dragOriginalPinCoords.y + dy)) * 100) / 100;

      setLocalPins((prev) =>
        prev.map((p) => (p.id === selectedPinId ? { ...p, x: newX, y: newY } : p))
      );
      return;
    }

    // B. Dragging a Drawing Element / Role Badge
    if (isDraggingElement && selectedElementId && dragStartPoint) {
      const currentPos = getSvgCoordinates(e);
      const dx = currentPos.x - dragStartPoint.x;
      const dy = currentPos.y - dragStartPoint.y;

      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        hasMovedElementRef.current = true;
      }

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId) return el;
          return {
            ...el,
            points: dragOriginalPoints.map((p) => ({
              x: Math.round(Math.max(1, Math.min(99, p.x + dx)) * 100) / 100,
              y: Math.round(Math.max(1, Math.min(99, p.y + dy)) * 100) / 100,
            })),
          };
        })
      );
      return;
    }

    // C. Actively drawing a new shape
    if (!isDrawing) return;
    const point = getSvgCoordinates(e);

    if (currentTool === 'pen') {
      setCurrentPoints((prev) => [...prev, point]);
    } else {
      setCurrentPoints((prev) => [prev[0], point]);
    }
  };

  // Mouse up: finalize drag or path WITHOUT deselecting the item
  const handleMouseUp = () => {
    // 1. Finalize pin drag: preserve selectedPinId!
    if (isDraggingPin) {
      setIsDraggingPin(false);
      setDragStartPinPoint(null);
      setDragOriginalPinCoords(null);
      if (hasMovedPinRef.current) {
        commitPinsUpdate(localPins);
      }
      return;
    }

    // 2. Finalize element drag: preserve selectedElementId!
    if (isDraggingElement) {
      setIsDraggingElement(false);
      setDragStartPoint(null);
      if (hasMovedElementRef.current) {
        commitElementsUpdate(elements);
      }
      return;
    }

    // 3. Finalize new drawn shape
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPoints.length < 2) {
      setCurrentPoints([]);
      return;
    }

    const p1 = currentPoints[0];
    const p2 = currentPoints[currentPoints.length - 1];
    const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

    if (dist < 1.5 && currentTool !== 'pen') {
      setCurrentPoints([]);
      return;
    }

    const newElement: DrawingElement = {
      id: `elem-${Date.now()}`,
      tool: currentTool as DrawingToolType,
      color: currentColor,
      width: strokeWidth,
      points: currentPoints,
    };

    commitElementsUpdate([...elements, newElement]);
    setSelectedElementId(newElement.id);
    setSelectedPinId(null);
    setCurrentPoints([]);
  };

  // Pin interaction handlers
  const handlePinMouseDown = (e: React.MouseEvent, pin: TacticalPin) => {
    e.stopPropagation();
    setSelectedPinId(pin.id || null);
    setSelectedElementId(null);
    hasMovedPinRef.current = false;
    setIsDraggingPin(true);
    const startPt = getSvgCoordinates(e);
    setDragStartPinPoint(startPt);
    setDragOriginalPinCoords({ x: pin.x, y: pin.y });
  };

  const handleDeleteSelectedPin = () => {
    if (!selectedPinId) return;
    const remaining = localPins.filter((p) => p.id !== selectedPinId);
    commitPinsUpdate(remaining);
    setSelectedPinId(null);
    setHoveredPin(null); // Clear lingering tooltip immediately
  };

  const handleEditPinField = (field: keyof TacticalPin, value: any) => {
    if (!selectedPinId) return;
    const updated = localPins.map((p) => (p.id === selectedPinId ? { ...p, [field]: value } : p));
    commitPinsUpdate(updated);
  };

  // Element interaction handlers
  const handleElementMouseDown = (e: React.MouseEvent, elem: DrawingElement) => {
    e.stopPropagation();
    setSelectedElementId(elem.id);
    setSelectedPinId(null);
    hasMovedElementRef.current = false;
    setIsDraggingElement(true);
    const startPt = getSvgCoordinates(e);
    setDragStartPoint(startPt);
    setDragOriginalPoints([...elem.points]);
  };

  const handleDeleteSelectedElement = () => {
    if (!selectedElementId) return;
    const updated = elements.filter((el) => el.id !== selectedElementId);
    commitElementsUpdate(updated);
    setSelectedElementId(null);
  };

  // History controls
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedElementId(null);
      if (onSaveDrawing) onSaveDrawing(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      setSelectedElementId(null);
      if (onSaveDrawing) onSaveDrawing(history[newIndex]);
    }
  };

  const handleClear = () => {
    if (elements.length === 0 && localPins.length === 0) return;
    if (window.confirm('Effacer tous les tracés et repères pour cette stratégie ?')) {
      commitElementsUpdate([]);
      commitPinsUpdate([]);
      setSelectedElementId(null);
      setSelectedPinId(null);
      setHoveredPin(null);
    }
  };

  // Manual save trigger
  const handleManualSave = () => {
    if (onSaveDrawing) onSaveDrawing(elements);
    if (onUpdatePins) onUpdatePins(localPins);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const selectedPin = localPins.find((p) => p.id === selectedPinId);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur flex flex-col">
      {/* Top Header & Strat Sync Badge */}
      <div className="px-4 py-3 bg-[#0a0f1d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white uppercase tactical-font tracking-wider">
                {mapName}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">
                Radar Source 2
              </span>
              {stratSide && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    stratSide === 'T-Side' ? 'bg-orange-500/20 text-orange-400' : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  {stratSide}
                </span>
              )}
            </div>
            {stratTitle ? (
              <p className="text-[11px] text-slate-300 truncate max-w-xs sm:max-w-md">
                Schéma & Repères liés à : <strong className="text-amber-300">{stratTitle}</strong>
              </p>
            ) : (
              <p className="text-[11px] text-amber-400/80">
                Sélectionnez une stratégie à droite pour voir et modifier ses repères et tracés
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {onSaveDrawing && (
            <button
              type="button"
              onClick={handleManualSave}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                saveSuccess
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/40'
              }`}
              title="Sauvegarder explicitement les schémas et repères pour cette stratégie"
            >
              {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saveSuccess ? 'Enregistré !' : 'Enregistrer'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tactical Toolbar */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Group 1: Select & Add Pin Mode */}
        <div className="flex items-center space-x-1.5 border-r border-slate-800 pr-2.5">
          <button
            type="button"
            onClick={() => setCurrentTool('select')}
            className={`px-2.5 py-1.5 rounded-md flex items-center space-x-1.5 transition-all font-semibold ${
              currentTool === 'select'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Sélectionner un tracé ou un repère pour le déplacer ou le supprimer"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span className="text-[11px]">Sélectionner</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTool('add_pin')}
            className={`px-2.5 py-1.5 rounded-md flex items-center space-x-1.5 transition-all font-semibold border ${
              currentTool === 'add_pin'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-amber-400 border-amber-500/40 hover:bg-slate-800'
            }`}
            title="Cliquez n'importe où sur le radar pour poser un repère tactique (Smoke, Flash, Molo, HE)"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[11px]">+ Poser Repère</span>
          </button>
        </div>

        {/* Group 2: Player Role Stamps */}
        <div className="flex items-center space-x-1 border-r border-slate-800 pr-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase mr-0.5">Rôles :</span>
          {[
            { id: 'role_entry', label: 'ENTRY', title: 'Entry Fragger', icon: <Flame className="w-3 h-3 text-orange-400" /> },
            { id: 'role_igl', label: 'IGL', title: 'In-Game Leader', icon: <Crown className="w-3 h-3 text-amber-400" /> },
            { id: 'role_snipe', label: 'SNIPE', title: 'Sniper / AWP', icon: <Crosshair className="w-3 h-3 text-sky-400" /> },
            { id: 'role_bombe', label: 'BOMBE', title: 'Porteur C4', icon: <Bomb className="w-3 h-3 text-red-400" /> },
            { id: 'role_fixe', label: 'FIXE', title: 'Anchor / Fixe de site', icon: <Anchor className="w-3 h-3 text-emerald-400" /> },
            { id: 'role_lurk', label: 'LURK', title: 'Lurker', icon: <Eye className="w-3 h-3 text-purple-400" /> },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setCurrentTool(r.id as DrawingToolType)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold flex items-center space-x-1 transition-all border ${
                currentTool === r.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
              title={`Tampon rôle ${r.title}`}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Group 3: Utility Stamps */}
        <div className="flex items-center space-x-1 border-r border-slate-800 pr-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase mr-0.5">Utils :</span>
          {[
            { id: 'smoke', label: 'Smoke', icon: <Cloud className="w-3 h-3 text-slate-200" /> },
            { id: 'flash', label: 'Flash', icon: <Zap className="w-3 h-3 text-amber-300" /> },
            { id: 'molotov', label: 'Molo', icon: <Flame className="w-3 h-3 text-red-300" /> },
            { id: 'he', label: 'HE', icon: <Bomb className="w-3 h-3 text-orange-300" /> },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentTool(s.id as DrawingToolType)}
              className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition-all border ${
                currentTool === s.id
                  ? 'bg-slate-700 text-white border-amber-400 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Group 4: Tactical Paths & Shapes */}
        <div className="flex items-center space-x-1">
          {[
            { id: 'arrow', label: 'Flèche', icon: <MoveRight className="w-3.5 h-3.5" /> },
            { id: 'pen', label: 'Tracé', icon: <Pencil className="w-3.5 h-3.5" /> },
            { id: 'line', label: 'Ligne', icon: <Minus className="w-3.5 h-3.5" /> },
            { id: 'circle', label: 'Zone', icon: <Circle className="w-3.5 h-3.5" /> },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCurrentTool(t.id as DrawingToolType)}
              className={`p-1.5 rounded-md flex items-center space-x-1 transition-all ${
                currentTool === t.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800'
              }`}
              title={t.label}
            >
              {t.icon}
              <span className="hidden sm:inline text-[11px]">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Group 5: Palette & Undo/Redo */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* Color Palette */}
          <div className="flex items-center space-x-1.5">
            {[
              { color: '#f97316', label: 'T-Side' },
              { color: '#38bdf8', label: 'CT-Side' },
              { color: '#facc15', label: 'Flash / Info' },
              { color: '#ef4444', label: 'Danger / Molotov' },
              { color: '#22c55e', label: 'Support / Fixe' },
              { color: '#a855f7', label: 'Lurker' },
              { color: '#ffffff', label: 'Neutre' },
            ].map((c) => (
              <button
                key={c.color}
                type="button"
                onClick={() => setCurrentColor(c.color)}
                style={{ backgroundColor: c.color }}
                className={`w-4 h-4 rounded-full transition-transform ${
                  currentColor === c.color ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
              title="Annuler (Undo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
              title="Rétablir (Redo)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800"
              title="Effacer tout"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toolbar when a PIN is selected directly from map */}
      {selectedPin && (
        <div className="px-4 py-2.5 bg-slate-950 border-b border-amber-500/40 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-amber-400 font-bold font-mono">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>REPÈRE :</span>
            </div>

            {/* Quick Title Input */}
            <input
              type="text"
              value={selectedPin.title || ''}
              onChange={(e) => handleEditPinField('title', e.target.value)}
              placeholder="Nom du repère..."
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 text-xs font-semibold focus:outline-none focus:border-amber-500 w-36 sm:w-48"
            />

            {/* Type selector */}
            <select
              value={selectedPin.type || 'smoke'}
              onChange={(e) => handleEditPinField('type', e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="smoke">Smoke</option>
              <option value="flash">Flash</option>
              <option value="molotov">Molotov</option>
              <option value="he">Grenade HE</option>
              <option value="retake">Retake Setup</option>
              <option value="position">Position</option>
            </select>

            {/* Throw type selector */}
            <select
              value={selectedPin.throw_type || 'Jumpthrow'}
              onChange={(e) => handleEditPinField('throw_type', e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="Jumpthrow">Jumpthrow</option>
              <option value="Left-click">Left-click</option>
              <option value="Run-throw">Run-throw</option>
              <option value="W-jumpthrow">W-jumpthrow</option>
              <option value="Right-click">Right-click</option>
            </select>

            {/* Role selector */}
            <select
              value={selectedPin.player_role || 'Support'}
              onChange={(e) => handleEditPinField('player_role', e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="Support">Support</option>
              <option value="Entry">Entry</option>
              <option value="IGL">IGL</option>
              <option value="AWP / Sniper">AWP</option>
              <option value="Lurker">Lurker</option>
            </select>

            <span className="text-slate-500 text-[11px]">(Glissez pour déplacer)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSelectedPin();
              }}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-xs font-bold transition-all cursor-pointer"
              title="Supprimer ce repère de la stratégie (Touche Suppr)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer (Suppr)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPinId(null);
                setHoveredPin(null);
              }}
              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Floating Toolbar when a DRAWING ELEMENT is selected */}
      {selectedElement && !selectedPin && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-300 font-mono">
              Tracé sélectionné :{' '}
              <strong className="text-amber-400 uppercase">
                {selectedElement.role || selectedElement.label || selectedElement.tool}
              </strong>
            </span>
            <span className="text-slate-500 text-[11px]">(Glissez pour déplacer)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSelectedElement();
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 text-[11px] font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Supprimer (Suppr)</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(null);
              }}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px] cursor-pointer"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* Notice if Add Pin tool is selected */}
      {currentTool === 'add_pin' && (
        <div className="px-4 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-center text-xs text-amber-300 font-semibold animate-in fade-in">
          📍 Mode Poser Repère activé : Cliquez sur la carte à l'emplacement exact où lancer l'utilitaire.
        </div>
      )}

      {/* Strictly Square Radar Viewport (Zero-offset) */}
      <div className="relative w-full aspect-square max-w-[620px] mx-auto bg-[#0a0f1d] overflow-hidden select-none cursor-crosshair">
        {/* Official CS2 Radar Background Image */}
        <img
          src={getMapRadarImage(mapName)}
          alt={`Radar CS2 ${mapName}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-90 contrast-125 brightness-95"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Ambient Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20" />

        {/* SVG Vector Drawing, Roles, and Interactive Strategy Pins Layer */}
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Arrowhead Markers */}
          <defs>
            {['#f97316', '#38bdf8', '#facc15', '#ef4444', '#22c55e', '#a855f7', '#ffffff', '#cbd5e1'].map((c) => (
              <marker
                key={c}
                id={`arrow-${c.replace('#', '')}`}
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={c} />
              </marker>
            ))}
          </defs>

          {/* 1. Drawing Elements (Paths, Lines, Circles, Stamps, Roles) */}
          {elements.map((elem) => {
            const isSelected = selectedElementId === elem.id;

            // Freehand Pen
            if (elem.tool === 'pen' && elem.points.length > 1) {
              const d = elem.points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
              return (
                <g
                  key={elem.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(elem.id);
                    setSelectedPinId(null);
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, elem)}
                >
                  <path d={d} fill="none" stroke="transparent" strokeWidth={elem.width * 0.8} />
                  <path
                    d={d}
                    fill="none"
                    stroke={isSelected ? '#fbbf24' : elem.color}
                    strokeWidth={elem.width * 0.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isSelected ? 1 : 0.9}
                  />
                </g>
              );
            }

            // Directional Arrow
            if (elem.tool === 'arrow' && elem.points.length >= 2) {
              const p1 = elem.points[0];
              const p2 = elem.points[elem.points.length - 1];
              const markerId = `arrow-${(isSelected ? '#fbbf24' : elem.color).replace('#', '')}`;
              return (
                <g
                  key={elem.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(elem.id);
                    setSelectedPinId(null);
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, elem)}
                >
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={elem.width * 0.9} />
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isSelected ? '#fbbf24' : elem.color}
                    strokeWidth={elem.width * 0.3}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                    opacity={isSelected ? 1 : 0.95}
                  />
                  {isSelected && (
                    <circle cx={p1.x} cy={p1.y} r="1.5" fill="#fbbf24" stroke="#000" strokeWidth="0.3" />
                  )}
                </g>
              );
            }

            // Line of Sight
            if (elem.tool === 'line' && elem.points.length >= 2) {
              const p1 = elem.points[0];
              const p2 = elem.points[elem.points.length - 1];
              return (
                <g
                  key={elem.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(elem.id);
                    setSelectedPinId(null);
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, elem)}
                >
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={elem.width * 0.8} />
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={isSelected ? '#fbbf24' : elem.color}
                    strokeWidth={elem.width * 0.25}
                    strokeDasharray="1.5,1.5"
                    strokeLinecap="round"
                    opacity={isSelected ? 1 : 0.85}
                  />
                </g>
              );
            }

            // Tactical Zone / Circle
            if (elem.tool === 'circle' && elem.points.length >= 2) {
              const p1 = elem.points[0];
              const p2 = elem.points[1];
              const r = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
              return (
                <g
                  key={elem.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(elem.id);
                    setSelectedPinId(null);
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, elem)}
                >
                  <circle
                    cx={p1.x}
                    cy={p1.y}
                    r={Math.max(r, 2)}
                    fill={elem.color}
                    fillOpacity={isSelected ? 0.25 : 0.15}
                    stroke={isSelected ? '#fbbf24' : elem.color}
                    strokeWidth={elem.width * 0.25}
                    strokeDasharray="2,1"
                  />
                </g>
              );
            }

            // Player Role Stamps (Entry, IGL, Snipe, Bombe, Fixe, Lurk)
            if (elem.tool.startsWith('role_') && elem.points.length >= 1) {
              const pt = elem.points[0];
              const roleTag = (elem.role || elem.label || 'ROLE').toUpperCase();
              return (
                <g
                  key={elem.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-grab active:cursor-grabbing"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(elem.id);
                    setSelectedPinId(null);
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, elem)}
                >
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="4.8"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.6"
                      strokeDasharray="1.2,0.8"
                    />
                  )}
                  <circle cx="0" cy="0" r="3.6" fill="#090d16" stroke={elem.color} strokeWidth="0.65" />
                  <circle cx="0" cy="-2.0" r="0.7" fill={elem.color} />
                  <text
                    x="0"
                    y="1.2"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="1.8"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    {roleTag.length > 5 ? roleTag.slice(0, 4) : roleTag}
                  </text>
                </g>
              );
            }

            // Utility Stamps
            if (['smoke', 'flash', 'molotov', 'he', 'c4'].includes(elem.tool) && elem.points.length >= 1) {
              const pt = elem.points[0];
              return (
                <g
                  key={elem.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="cursor-grab active:cursor-grabbing"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(elem.id);
                    setSelectedPinId(null);
                  }}
                  onMouseDown={(e) => handleElementMouseDown(e, elem)}
                >
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="4.2"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                    />
                  )}
                  {elem.tool === 'smoke' && (
                    <circle cx="0" cy="0" r="4.5" fill="#94a3b8" fillOpacity="0.4" stroke="#cbd5e1" strokeWidth="0.5" />
                  )}
                  {elem.tool === 'molotov' && (
                    <circle cx="0" cy="0" r="3.8" fill="#ef4444" fillOpacity="0.35" stroke="#f87171" strokeWidth="0.5" />
                  )}
                  {elem.tool === 'c4' && (
                    <rect x="-2.2" y="-2.2" width="4.4" height="4.4" rx="0.8" fill="#dc2626" stroke="#ffffff" strokeWidth="0.4" />
                  )}
                  <circle cx="0" cy="0" r="2.2" fill={elem.color} stroke="#ffffff" strokeWidth="0.4" />
                </g>
              );
            }

            return null;
          })}

          {/* 2. Strategy's OWN Tactical Pins (Drag & Drop + Delete Directement sur la Carte) */}
          {localPins.map((pin, index) => {
            const isSelected = selectedPinId === pin.id;
            const pinColor =
              pin.type === 'smoke'
                ? '#64748b'
                : pin.type === 'flash'
                ? '#facc15'
                : pin.type === 'molotov'
                ? '#ef4444'
                : '#0284c7';

            const uniqueKey = pin.id || `pin-${pin.x}-${pin.y}-${index}`;

            return (
              <g
                key={uniqueKey}
                transform={`translate(${pin.x}, ${pin.y})`}
                className="cursor-grab active:cursor-grabbing"
                onMouseDown={(e) => handlePinMouseDown(e, pin)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPinId(pin.id || null);
                  setSelectedElementId(null);
                  if (onPinClick) onPinClick(pin);
                }}
                onMouseEnter={() => setHoveredPin(pin)}
                onMouseLeave={() => setHoveredPin(null)}
              >
                {/* Selection Halo */}
                {isSelected && (
                  <circle cx="0" cy="0" r="4.2" fill="none" stroke="#fbbf24" strokeWidth="0.7" strokeDasharray="1.2,0.8" />
                )}
                {/* Pin Base Circle */}
                <circle cx="0" cy="0" r="3.0" fill="#090d16" stroke={pinColor} strokeWidth="0.65" />
                {/* Pin Center Accent */}
                <circle cx="0" cy="0" r="1.6" fill={pinColor} />
                <circle cx="0" cy="0" r="0.6" fill="#ffffff" />
                {/* Pin Mini Label (Strictly inside this pin's group, removed automatically when pin is deleted) */}
                <text
                  x="0"
                  y="4.8"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="1.6"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] select-none"
                >
                  {pin.title || pin.type}
                </text>
              </g>
            );
          })}

          {/* 3. Drawing Preview */}
          {isDrawing && currentPoints.length > 0 && (
            <g opacity={0.75}>
              {currentTool === 'pen' && currentPoints.length > 1 && (
                <path
                  d={currentPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
                  fill="none"
                  stroke={currentColor}
                  strokeWidth={strokeWidth * 0.25}
                  strokeLinecap="round"
                />
              )}
              {currentTool === 'arrow' && currentPoints.length >= 2 && (
                <line
                  x1={currentPoints[0].x}
                  y1={currentPoints[0].y}
                  x2={currentPoints[1].x}
                  y2={currentPoints[1].y}
                  stroke={currentColor}
                  strokeWidth={strokeWidth * 0.3}
                  markerEnd={`url(#arrow-${currentColor.replace('#', '')})`}
                />
              )}
              {currentTool === 'line' && currentPoints.length >= 2 && (
                <line
                  x1={currentPoints[0].x}
                  y1={currentPoints[0].y}
                  x2={currentPoints[1].x}
                  y2={currentPoints[1].y}
                  stroke={currentColor}
                  strokeWidth={strokeWidth * 0.25}
                  strokeDasharray="1.5,1.5"
                />
              )}
              {currentTool === 'circle' && currentPoints.length >= 2 && (
                <circle
                  cx={currentPoints[0].x}
                  cy={currentPoints[0].y}
                  r={Math.max(
                    Math.sqrt(
                      Math.pow(currentPoints[1].x - currentPoints[0].x, 2) +
                      Math.pow(currentPoints[1].y - currentPoints[0].y, 2)
                    ),
                    2
                  )}
                  fill={currentColor}
                  fillOpacity={0.2}
                  stroke={currentColor}
                  strokeWidth={strokeWidth * 0.25}
                />
              )}
            </g>
          )}
        </svg>

        {/* Hovered Pin Info Tooltip: ONLY rendered if hovered pin actually exists in localPins */}
        {hoveredPin && !selectedPinId && localPins.some((p) => p.id === hoveredPin.id) && (
          <div
            style={{
              left: `${Math.min(80, Math.max(10, hoveredPin.x))}%`,
              top: `${Math.min(80, Math.max(15, hoveredPin.y))}%`,
            }}
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-full mb-3 z-30 bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 shadow-2xl backdrop-blur max-w-xs text-xs animate-in fade-in"
          >
            <div className="flex items-center space-x-1.5 mb-1 font-bold text-amber-400">
              <span className="uppercase">{hoveredPin.title}</span>
            </div>
            {hoveredPin.description && (
              <p className="text-[11px] text-slate-300 leading-relaxed mb-1">{hoveredPin.description}</p>
            )}
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
              <span>{hoveredPin.throw_type || 'Jumpthrow'}</span>
              <span>•</span>
              <span className="text-amber-300">{hoveredPin.player_role || 'Support'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Instructions */}
      <div className="px-4 py-2 bg-[#080d17] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center space-x-3">
          <span className="text-amber-400 font-semibold">{localPins.length} repères liés à cette strat</span>
          <span>•</span>
          <span>{elements.length} tracés & rôles</span>
        </div>
        <div className="text-slate-500">
          Glissez un repère pour le déplacer • Touche Suppr pour supprimer
        </div>
      </div>
    </div>
  );
};

export default TacticalDrawingCanvas;
