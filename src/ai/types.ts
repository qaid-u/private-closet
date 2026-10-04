import { ColorInfo, Category, Pattern, Season } from '../data/types';

export interface AIModelInfo {
  id: string;
  name: string;
  version: string;
  sizeBytes: number;
  sizeFormatted: string;
  isSimulated: boolean;
  isInstalled: boolean;
  purpose: string;
}

export interface BackgroundRemovalResult {
  cutout: Blob;
  confidence: number;
  isSimulated: boolean;
}

export interface BackgroundRemover {
  remove(img: Blob, opts?: { signal?: AbortSignal }): Promise<BackgroundRemovalResult>;
}

export interface ItemTaggingResult {
  category: Category;
  subtype: string;
  colors: ColorInfo[];
  pattern: Pattern;
  styleTags: string[];
  seasons: Season[];
  confidence: Record<string, number>;
  isSimulated: boolean;
}

export interface ItemTagger {
  tag(cutout: Blob, hints?: { fileName?: string }): Promise<ItemTaggingResult>;
}

export interface SelfieAnalysisResult {
  lighting: 'good' | 'low' | 'uneven';
  skin?: {
    depth: 'light' | 'medium' | 'deep';
    swatchHex: string;
    undertone: 'warm' | 'cool' | 'neutral' | 'unsure';
    confidence: number;
  };
  hair?: {
    colorHex: string;
    colorName: string;
    confidence: number;
  };
  faceShape?: {
    shape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond' | 'unsure';
    confidence: number;
  };
  isSimulated: boolean;
}

export interface SelfieAnalyzer {
  analyze(photo: Blob, opts?: { signal?: AbortSignal }): Promise<SelfieAnalysisResult>;
}

export interface Embedder {
  embedImage(cutout: Blob): Promise<Float32Array>;
  embedText(q: string): Promise<Float32Array>;
}

export interface ParsedStyleRequest {
  occasion?: string;
  mood?: string;
  avoid?: string[];
  include?: string[];
  tempHintC?: number;
  isSimulated: boolean;
}

export interface StyleAssistant {
  parseRequest(text: string): Promise<ParsedStyleRequest>;
}

export interface ModelManager {
  list(): AIModelInfo[];
  install(id: string, onProgress: (p: number) => void, signal?: AbortSignal): Promise<void>;
  remove(id: string): Promise<void>;
  isInstalled(id: string): boolean;
}
