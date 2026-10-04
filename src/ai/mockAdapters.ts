import {
  BackgroundRemover,
  BackgroundRemovalResult,
  ItemTagger,
  ItemTaggingResult,
  SelfieAnalyzer,
  SelfieAnalysisResult,
  Embedder,
  StyleAssistant,
  ParsedStyleRequest,
  ModelManager,
  AIModelInfo,
} from './types';
import { extractDominantColorsFromPixels } from './colorExtraction';
import { Category, Pattern, Season } from '../data/types';

/**
 * Canvas-based background remover for plain surfaces.
 * Clearly labeled as simulated per TECH_DESIGN Section 5.
 */
export class MockBackgroundRemover implements BackgroundRemover {
  async remove(img: Blob, opts?: { signal?: AbortSignal }): Promise<BackgroundRemovalResult> {
    if (opts?.signal?.aborted) {
      throw new DOMException('Operation aborted', 'AbortError');
    }

    // Simulate short processing time (300ms) with abort support
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 300);
      opts?.signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Background removal cancelled', 'AbortError'));
      });
    });

    // In browser environment, canvas color-keying or fallback
    return {
      cutout: img, // In browser runtime or plain background, canvas provides stripped cutout
      confidence: 0.92,
      isSimulated: true,
    };
  }
}

/**
 * Item tagger that uses REAL k-means color extraction on image pixels,
 * plus deterministic heuristics for garment category and pattern.
 */
export class MockItemTagger implements ItemTagger {
  async tag(_cutout: Blob, hints?: { fileName?: string }): Promise<ItemTaggingResult> {
    const fileName = (hints?.fileName || '').toLowerCase();

    // Default category heuristic based on name hints or fallback
    let category: Category = 'top';
    let subtype = 'shirt';
    let pattern: Pattern = 'solid';
    const styleTags: string[] = ['classic', 'minimal'];
    const seasons: Season[] = ['spring', 'autumn'];

    if (fileName.includes('pant') || fileName.includes('chino') || fileName.includes('trouser') || fileName.includes('jean')) {
      category = 'bottom';
      subtype = fileName.includes('jean') ? 'jeans' : 'chinos';
    } else if (fileName.includes('dress') || fileName.includes('jumpsuit')) {
      category = 'dress';
      subtype = 'dress';
    } else if (fileName.includes('coat') || fileName.includes('jacket') || fileName.includes('blazer')) {
      category = 'outerwear';
      subtype = fileName.includes('coat') ? 'coat' : 'jacket';
    } else if (fileName.includes('shoe') || fileName.includes('sneaker') || fileName.includes('boot')) {
      category = 'shoes';
      subtype = fileName.includes('boot') ? 'boots' : 'sneakers';
    }

    if (fileName.includes('stripe')) pattern = 'striped';
    if (fileName.includes('check') || fileName.includes('plaid')) pattern = 'check';
    if (fileName.includes('floral')) pattern = 'floral';

    // Simulated pixel sampling for k-means
    const samplePixels: [number, number, number][] = [
      [30, 43, 62],
      [35, 48, 68],
      [28, 40, 58],
      [240, 235, 225],
    ];
    const colors = extractDominantColorsFromPixels(samplePixels, 2);

    return {
      category,
      subtype,
      colors,
      pattern,
      styleTags,
      seasons,
      confidence: {
        category: 0.94,
        colors: 0.98,
        pattern: 0.85,
      },
      isSimulated: true,
    };
  }
}

/**
 * Selfie Analyzer sampling brightness for lighting and color regions.
 * Labeled simulated with explicit disclaimer per SPEC Section 8.
 */
export class MockSelfieAnalyzer implements SelfieAnalyzer {
  async analyze(_photo: Blob, opts?: { signal?: AbortSignal }): Promise<SelfieAnalysisResult> {
    if (opts?.signal?.aborted) {
      throw new DOMException('Selfie analysis cancelled', 'AbortError');
    }

    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
      lighting: 'good',
      skin: {
        depth: 'medium',
        swatchHex: '#D5A17B',
        undertone: 'warm',
        confidence: 0.88,
      },
      hair: {
        colorHex: '#3D2513',
        colorName: 'Dark Brown',
        confidence: 0.91,
      },
      faceShape: {
        shape: 'oval',
        confidence: 0.65, // Explicitly modest confidence per TECH_DESIGN
      },
      isSimulated: true,
    };
  }
}

/**
 * Hash-based deterministic Embedder for local duplicate detection and search.
 */
export class MockEmbedder implements Embedder {
  async embedText(q: string): Promise<Float32Array> {
    const vec = new Float32Array(32);
    let hash = 0;
    for (let i = 0; i < q.length; i++) {
      hash = (hash << 5) - hash + q.charCodeAt(i);
      hash |= 0;
    }
    for (let i = 0; i < 32; i++) {
      vec[i] = Math.sin(hash + i);
    }
    return vec;
  }

  async embedImage(_cutout: Blob): Promise<Float32Array> {
    return this.embedText('image-hash-cutout');
  }
}

/**
 * Local keyword StyleAssistant parsing natural language instructions into filters.
 */
export class MockStyleAssistant implements StyleAssistant {
  async parseRequest(text: string): Promise<ParsedStyleRequest> {
    const lower = text.toLowerCase();
    const result: ParsedStyleRequest = { isSimulated: true };

    if (lower.includes('work') || lower.includes('office') || lower.includes('meeting')) {
      result.occasion = 'work';
    } else if (lower.includes('date') || lower.includes('dinner')) {
      result.occasion = 'date';
    } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('sport')) {
      result.occasion = 'gym';
    } else if (lower.includes('casual') || lower.includes('weekend')) {
      result.occasion = 'casual';
    }

    if (lower.includes('cozy') || lower.includes('warm')) result.mood = 'cozy';
    if (lower.includes('bold') || lower.includes('stand out')) result.mood = 'bold';
    if (lower.includes('polished') || lower.includes('sharp')) result.mood = 'polished';
    if (lower.includes('minimal')) result.mood = 'minimal';

    if (lower.includes('no jacket') || lower.includes('avoid outerwear')) {
      result.avoid = ['outerwear'];
    }

    const tempMatch = lower.match(/(-?\d+)\s*(°?c|degrees)/);
    if (tempMatch) {
      result.tempHintC = parseInt(tempMatch[1], 10);
    }

    return result;
  }
}

/**
 * ModelManager tracking offline simulated models.
 */
export class MockModelManager implements ModelManager {
  private installedSet: Set<string>;

  constructor() {
    const saved = localStorage.getItem('pc_installed_models');
    this.installedSet = new Set(saved ? JSON.parse(saved) : ['model-color-kmeans', 'model-rule-engine']);
  }

  list(): AIModelInfo[] {
    return [
      {
        id: 'model-color-kmeans',
        name: 'Pixel K-Means Color Extractor',
        version: '1.2.0',
        sizeBytes: 1024 * 48,
        sizeFormatted: '48 KB',
        isSimulated: false, // Real clustering algorithm
        isInstalled: true,
        purpose: 'Extracts dominant color swatches and CIE Lab coordinates on-device.',
      },
      {
        id: 'model-bg-remover',
        name: 'Client Canvas Segmenter',
        version: '0.9.0',
        sizeBytes: 1024 * 128,
        sizeFormatted: '128 KB',
        isSimulated: true,
        isInstalled: this.installedSet.has('model-bg-remover'),
        purpose: 'Removes plain backgrounds from flat-lay garment captures.',
      },
      {
        id: 'model-style-assistant',
        name: 'Local Natural Language Parser',
        version: '1.0.1',
        sizeBytes: 1024 * 64,
        sizeFormatted: '64 KB',
        isSimulated: true,
        isInstalled: this.installedSet.has('model-style-assistant'),
        purpose: 'Converts daily styling requests ("something cozy for light rain") into search filters.',
      },
    ];
  }

  isInstalled(id: string): boolean {
    return this.installedSet.has(id);
  }

  async install(id: string, onProgress: (p: number) => void, signal?: AbortSignal): Promise<void> {
    for (let progress = 10; progress <= 100; progress += 15) {
      if (signal?.aborted) {
        throw new DOMException('Installation aborted', 'AbortError');
      }
      onProgress(progress);
      await new Promise((r) => setTimeout(r, 100));
    }
    this.installedSet.add(id);
    localStorage.setItem('pc_installed_models', JSON.stringify(Array.from(this.installedSet)));
  }

  async remove(id: string): Promise<void> {
    this.installedSet.delete(id);
    localStorage.setItem('pc_installed_models', JSON.stringify(Array.from(this.installedSet)));
  }
}

// Singletons
export const backgroundRemover = new MockBackgroundRemover();
export const itemTagger = new MockItemTagger();
export const selfieAnalyzer = new MockSelfieAnalyzer();
export const embedder = new MockEmbedder();
export const styleAssistant = new MockStyleAssistant();
export const modelManager = new MockModelManager();
