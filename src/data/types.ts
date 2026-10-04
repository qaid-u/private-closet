export type ID = string;

export interface ColorInfo {
  hex: string;
  lab: [number, number, number];
  name: string;
  share: number;
}

export type Category = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';
export type Pattern = 'solid' | 'striped' | 'check' | 'floral' | 'graphic' | 'other';
export type Fit = 'fitted' | 'regular' | 'relaxed' | 'oversized';
export type ItemStatus = 'clean' | 'dirty' | 'at-cleaner' | 'needs-repair' | 'in-storage';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ClothingItem {
  id: ID;
  isSample?: boolean;
  name: string;
  category: Category;
  subtype: string; // e.g. 'shirt', 'chinos'
  colors: ColorInfo[];
  pattern: Pattern;
  styleTags: string[]; // minimal, classic, street, sporty, creative
  formality: 0 | 1 | 2 | 3 | 4; // 0 loungewear .. 4 formal
  warmth: 0 | 1 | 2 | 3; // 0 very light .. 3 heavy
  waterResistant?: boolean;
  fit: Fit;
  neckline?: 'crew' | 'v' | 'open-collar' | 'high' | 'scoop' | 'none';
  length?: 'cropped' | 'regular' | 'long';
  rise?: 'low' | 'mid' | 'high';
  material?: string;
  seasons: Season[];
  brand?: string;
  size?: string;
  price?: number;
  purchaseDate?: string;
  store?: string;
  care?: string;
  notes?: string;
  status: ItemStatus;
  favorite: boolean;
  imageOriginalId?: ID;
  imageCutoutId: ID; // blobs in image store
  tagConfidence?: Record<string, number>;
  embedding?: Float32Array;
  createdAt: number;
  updatedAt: number;
}

export interface StyleProfile {
  id: 'current';
  displayName?: string;
  skin?: {
    depth: 'light' | 'medium' | 'deep';
    swatchHex: string;
    undertone: 'warm' | 'cool' | 'neutral' | 'unsure';
    source: 'manual' | 'selfie';
  };
  hair?: {
    colorHex: string;
    colorName: string;
    length: 'short' | 'medium' | 'long';
    texture: 'straight' | 'wavy' | 'curly' | 'coily';
  };
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond' | 'unsure';
  heightCm?: number;
  heightUnit: 'cm' | 'ftin';
  proportions?: string[];
  fitPreference?: number; // 0 fitted .. 1 relaxed
  taste?: {
    quizAnswers: { pairId: string; choice: 'a' | 'b' | 'both' | 'neither' }[];
    tags: string[];
  };
  comfortRules: { id: string; label: string; kind: 'builtin' | 'custom'; rule?: Record<string, unknown> }[];
  advanced?: { weightKg?: number }; // collapsed, never displayed in summaries, tailoring only
  completeness: number; // 0 to 100
  updatedAt: number;
}

export interface Outfit {
  id: ID;
  name: string;
  itemIds: ID[];
  occasion?: string;
  season?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  favorite: boolean;
  wornCount: number;
  createdAt: number;
}

export interface WearLog {
  id: ID;
  date: string; // YYYY-MM-DD
  outfitId?: ID;
  itemIds: ID[];
  context?: {
    tempC?: number;
    condition?: string;
    occasion?: string;
  };
}

export interface Feedback {
  id: ID;
  outfitSignature: string;
  kind: 'up' | 'down' | 'not-me';
  reasons: string[];
  note?: string;
  at: number;
}

export interface Preferences {
  id: 'current';
  weights: Record<string, number>;
  hueAffinity: Record<string, number>;
  itemAffinity: Record<ID, number>;
  pairAffinity: Record<string, number>;
  formalityBias: number;
}

export interface AppSettings {
  id: 'current';
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  weatherMode: 'manual' | 'auto';
  excludeStyleFromBackup: boolean;
  lock: {
    enabled: boolean;
    autoLockSec: number;
    biometric: boolean;
  };
  onboardingDone: boolean;
  lastBackupAt?: number;
}

export interface StoredImageBlob {
  id: ID;
  blob?: Blob;
  data?: Uint8Array;
  mimeType: string;
  createdAt: number;
}
