import { describe, it, expect } from 'vitest';
import {
  extractDominantColorsFromPixels,
  rgbToLab,
  rgbToHex,
  backgroundRemover,
  itemTagger,
  selfieAnalyzer,
  styleAssistant,
  modelManager,
  embedder,
} from '../src/ai';

describe('AI Services & Mock Adapters', () => {
  it('performs real k-means clustering on RGB pixel arrays', () => {
    // Two distinct clusters: Navy [30, 40, 60] and Cream [240, 235, 220]
    const pixels: [number, number, number][] = [
      [30, 40, 60],
      [32, 42, 62],
      [28, 38, 58],
      [240, 235, 220],
      [242, 238, 222],
    ];

    const clusters = extractDominantColorsFromPixels(pixels, 2, 5);
    expect(clusters).toHaveLength(2);

    // Assert shares sum to approximately 1.0
    const totalShare = clusters.reduce((acc, c) => acc + c.share, 0);
    expect(totalShare).toBeCloseTo(1.0, 1);

    // Verify Lab color calculation
    const [L, a, b] = rgbToLab(255, 255, 255);
    expect(L).toBeCloseTo(100, 0);
    expect(a).toBeCloseTo(0, 0);
    expect(b).toBeCloseTo(0, 0);

    expect(rgbToHex(255, 0, 128)).toBe('#FF0080');
  });

  it('runs BackgroundRemover with AbortSignal cancellation support', async () => {
    const blob = new Blob(['sample-img'], { type: 'image/png' });

    // Normal execution
    const res = await backgroundRemover.remove(blob);
    expect(res.isSimulated).toBe(true);
    expect(res.confidence).toBeGreaterThan(0.8);

    // Aborted execution
    const controller = new AbortController();
    controller.abort();
    await expect(backgroundRemover.remove(blob, { signal: controller.signal })).rejects.toThrow();
  });

  it('tags garments and extracts color info', async () => {
    const blob = new Blob(['cutout'], { type: 'image/png' });
    const res = await itemTagger.tag(blob, { fileName: 'blue-striped-shirt.png' });

    expect(res.category).toBe('top');
    expect(res.pattern).toBe('striped');
    expect(res.colors.length).toBeGreaterThan(0);
    expect(res.isSimulated).toBe(true);
  });

  it('analyzes selfie and cancels on AbortSignal', async () => {
    const blob = new Blob(['selfie'], { type: 'image/jpeg' });

    const res = await selfieAnalyzer.analyze(blob);
    expect(res.lighting).toBe('good');
    expect(res.skin?.undertone).toBe('warm');
    expect(res.isSimulated).toBe(true);

    const controller = new AbortController();
    controller.abort();
    await expect(selfieAnalyzer.analyze(blob, { signal: controller.signal })).rejects.toThrow();
  });

  it('embedder produces deterministic Float32Array vectors', async () => {
    const v1 = await embedder.embedText('linen shirt');
    const v2 = await embedder.embedText('linen shirt');
    expect(v1).toHaveLength(32);
    expect(v1).toEqual(v2);
  });

  it('styleAssistant parses natural language styling requests into filters', async () => {
    const res = await styleAssistant.parseRequest('I need something cozy for an office meeting in 14C weather');
    expect(res.occasion).toBe('work');
    expect(res.mood).toBe('cozy');
    expect(res.tempHintC).toBe(14);
    expect(res.isSimulated).toBe(true);
  });

  it('modelManager lists models, simulates installation with progress, and removes models', async () => {
    const models = modelManager.list();
    expect(models.length).toBeGreaterThanOrEqual(3);

    const bgModel = models.find((m) => m.id === 'model-bg-remover');
    expect(bgModel).toBeDefined();

    const progressValues: number[] = [];
    await modelManager.install('model-bg-remover', (p) => progressValues.push(p));

    expect(progressValues.length).toBeGreaterThan(0);
    expect(modelManager.isInstalled('model-bg-remover')).toBe(true);

    await modelManager.remove('model-bg-remover');
    expect(modelManager.isInstalled('model-bg-remover')).toBe(false);
  });
});
