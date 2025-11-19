
export interface Resources {
  credits: number;
  energy: number;
  stability: number;
}

export interface CountryProperties {
  ADMIN: string;
  ISO_A2: string;
  GDP_MD_EST?: number;
  POP_EST?: number;
  bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  [key: string]: any;
}

export type Language = 'en' | 'zh';

export interface Protocol {
  id: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  effectType: 'income_credit' | 'income_energy' | 'cost_reduction' | 'threat_reduction' | 'stability_regen' | 'event_luck';
  value: number;
}

export interface Skill {
  id: string;
  branch: 'dominion' | 'manipulation' | 'adaptation';
  tier: 1 | 2 | 3 | 4 | 5;
  icon: string;
  position: { x: number; y: number }; // Coordinates for the visual map
  cost: { credits: number; energy: number };
  parentId: string | null; // The ID of the skill required to unlock this
  type: 'passive' | 'active';
  effectType?: string; // e.g. 'income_credit', 'cost_reduction', 'unlock_ability'
  value?: number;
  cooldown?: number; // For active skills
}

export interface Toast {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
}

export interface GameState {
  turn: number;
  resources: Resources;
  threat: number;
  selectedCountry: CountryProperties | null;
  controlledRegions: string[]; // List of ISO codes
  rebelliousRegions: string[]; // List of ISO codes currently rebelling
  nuclearPlants: string[]; // List of ISO codes with Nuclear Plants
  activeProtocols: string[]; // List of Protocol IDs
  unlockedSkills: string[]; // List of Skill IDs
  abilityCooldowns: Record<string, number>; // Skill ID -> Turns remaining
  history: string[];
  gameOver: boolean;
  hasActedThisTurn: boolean; // New flag to track player activity
}

export interface GameEventOption {
  label: string;
  description: string;
  cost?: Partial<Resources>;
  reward?: Partial<Resources>;
  effectDescription: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  countryName: string;
  options: GameEventOption[];
  severity: 'low' | 'medium' | 'critical';
}
