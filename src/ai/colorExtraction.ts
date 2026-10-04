import { ColorInfo } from '../data/types';

/**
 * Converts RGB to CIE L*a*b* color coordinates
 */
export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // Normalize RGB to 0-1
  let R = r / 255;
  let G = g / 255;
  let B = b / 255;

  // Gamma correction
  R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
  G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
  B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

  // Convert to XYZ with D65 illuminant
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) * 100;
  let Y = (R * 0.2126 + G * 0.7152 + B * 0.0722) * 100;
  let Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) * 100;

  X = X / 95.047;
  Y = Y / 100.0;
  Z = Z / 108.883;

  X = X > 0.008856 ? Math.cbrt(X) : 7.787 * X + 16 / 116;
  Y = Y > 0.008856 ? Math.cbrt(Y) : 7.787 * Y + 16 / 116;
  Z = Z > 0.008856 ? Math.cbrt(Z) : 7.787 * Z + 16 / 116;

  const L = Math.round((116 * Y - 16) * 10) / 10;
  const a = Math.round((500 * (X - Y)) * 10) / 10;
  const bVal = Math.round((200 * (Y - Z)) * 10) / 10;

  return [L, a, bVal];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculates Euclidean distance in RGB color space
 */
function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) + Math.pow(c1[1] - c2[1], 2) + Math.pow(c1[2] - c2[2], 2)
  );
}

/**
 * Determines approximate color name from RGB values
 */
export function getColorName(r: number, g: number, b: number): string {
  const [L] = rgbToLab(r, g, b);
  if (L > 90) return 'White';
  if (L < 20) return 'Black';

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  if (diff < 20) {
    if (L > 65) return 'Light Grey';
    if (L > 40) return 'Mid Grey';
    return 'Dark Charcoal';
  }

  if (r > g && r > b) {
    if (g > 150 && b < 100) return 'Warm Terracotta';
    if (g < 100 && b < 100) return 'Burgundy';
    return 'Warm Rust';
  }
  if (g > r && g > b) {
    if (r > 80) return 'Olive';
    return 'Sage Green';
  }
  if (b > r && b > g) {
    if (L < 35) return 'Navy';
    return 'Slate Blue';
  }

  return 'Warm Neutral';
}

/**
 * Performs real k-means clustering on a set of RGB pixel arrays.
 * Extracts dominant color clusters with share percentages and Lab values.
 */
export function extractDominantColorsFromPixels(
  pixels: [number, number, number][],
  k = 3,
  iterations = 6
): ColorInfo[] {
  if (pixels.length === 0) {
    return [{ hex: '#FAF8F5', lab: [98, 0, 1], name: 'Off-White', share: 1.0 }];
  }

  // Initialize centroids spread across sample pixels
  const step = Math.floor(pixels.length / k);
  const centroids: [number, number, number][] = [];
  for (let i = 0; i < k; i++) {
    centroids.push([...pixels[i * step || 0]]);
  }

  let clusters: [number, number, number][][] = Array.from({ length: k }, () => []);

  for (let iter = 0; iter < iterations; iter++) {
    clusters = Array.from({ length: k }, () => []);

    // Assign each pixel to closest centroid
    for (const pixel of pixels) {
      let minDist = Infinity;
      let closestIdx = 0;
      for (let c = 0; c < k; c++) {
        const dist = colorDistance(pixel, centroids[c]);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = c;
        }
      }
      clusters[closestIdx].push(pixel);
    }

    // Recompute centroids
    for (let c = 0; c < k; c++) {
      if (clusters[c].length > 0) {
        const sum = clusters[c].reduce(
          (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
          [0, 0, 0]
        );
        centroids[c] = [
          Math.round(sum[0] / clusters[c].length),
          Math.round(sum[1] / clusters[c].length),
          Math.round(sum[2] / clusters[c].length),
        ];
      }
    }
  }

  // Calculate percentage shares and sort descending
  const total = pixels.length;
  const results: ColorInfo[] = centroids
    .map((c, i) => {
      const share = Math.round((clusters[i].length / total) * 100) / 100;
      return {
        hex: rgbToHex(c[0], c[1], c[2]),
        lab: rgbToLab(c[0], c[1], c[2]),
        name: getColorName(c[0], c[1], c[2]),
        share,
      };
    })
    .filter((res) => res.share > 0.05)
    .sort((a, b) => b.share - a.share);

  return results.length > 0
    ? results
    : [{ hex: '#1C1B1A', lab: [11, 0, 0], name: 'Charcoal', share: 1.0 }];
}
