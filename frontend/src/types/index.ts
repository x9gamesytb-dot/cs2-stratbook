export interface TacticalPin {
  id?: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  type: 'smoke' | 'flash' | 'molotov' | 'he' | 'retake' | 'position' | 'boost' | 'callout' | string;
  side: 'T-Side' | 'CT-Side' | string;
  title: string;
  description?: string;
  throw_type?: 'Left-click' | 'Jumpthrow' | 'Run-throw' | 'W-jumpthrow' | 'Right-click' | string;
  player_role?: string;
  image_url?: string;
}

export interface DrawingPoint {
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
}

export type DrawingToolType =
  | 'select'
  | 'pen'
  | 'arrow'
  | 'line'
  | 'circle'
  | 'smoke'
  | 'flash'
  | 'molotov'
  | 'he'
  | 'c4'
  | 'role_entry'
  | 'role_igl'
  | 'role_snipe'
  | 'role_bombe'
  | 'role_fixe'
  | 'role_lurk'
  | 'eraser';

export interface DrawingElement {
  id: string;
  tool: DrawingToolType;
  color: string;
  width: number;
  points: DrawingPoint[];
  label?: string;
  role?: string;
}

export interface Strat {
  id: number;
  map_name: string;
  title: string;
  buy_phase: 'Pistol' | 'Eco / Semi-buy' | 'Force buy' | 'Full buy' | string;
  side: 'T-Side' | 'CT-Side' | string;
  category: 'Execution' | 'Mid Control' | 'Default' | 'Retake Setup' | 'Anti-Eco' | 'Utility Setups' | string;
  description: string;
  assigned_roles: Record<string, string>;
  callouts: string[];
  pins: TacticalPin[];
  drawing_data?: DrawingElement[];
  created_at?: string;
  updated_at?: string;
}

export interface MapInfo {
  name: string;
  radar_image: string;
  strats_count?: number;
}
