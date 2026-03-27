import { describe, it, expect } from 'vitest';
import { computeTargetDimensions } from './imageMath';

describe('computeTargetDimensions', () => {

  // Cas 1 : Photo portrait haute résolution — doit être réduite
  it('downscales a 4000×6000 portrait to A4@150dpi', () => {
    const result = computeTargetDimensions(4000, 6000, 'A4', 150);
    // A4 Portrait @ 150 DPI = 1240 x 1754 px
    // ratioW = 1240/4000 = 0.31
    // ratioH = 1754/6000 = 0.2923
    // scaleFactor = 0.2923
    expect(result.width).toBe(1169);   // 4000 * 0.2923...
    expect(result.height).toBe(1754);  // 6000 * 0.2923...
    expect(result.width).toBeLessThanOrEqual(1240);
    expect(result.height).toBeLessThanOrEqual(1754);
  });

  // Cas 2 : Photo paysage — détection orientation et rotation de la page
  it('detects landscape and swaps A4 dimensions', () => {
    const result = computeTargetDimensions(6000, 4000, 'A4', 150);
    // A4 Landscape @ 150 DPI = 1754 x 1240 px
    expect(result.width).toBeGreaterThan(result.height);
    expect(result.width).toBeLessThanOrEqual(1754);
    expect(result.height).toBeLessThanOrEqual(1240);
  });

  // Cas 3 : JAMAIS d'upscale (screenshot 800×600)
  it('never upscales a small image', () => {
    const result = computeTargetDimensions(800, 600, 'A4', 150);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
    expect(result.scaleFactor).toBe(1);
  });

  // Cas 4 : Image carrée — ratio préservé
  it('preserves aspect ratio for square image', () => {
    const result = computeTargetDimensions(4000, 4000, 'A4', 150);
    expect(result.width).toBe(result.height);
  });

  // Cas 5 : Panoramique extrême (8:1) — pas d'explosion buffer
  it('caps panoramic image on longest side', () => {
    const result = computeTargetDimensions(8000, 1000, 'A4', 150);
    // Landscape A4 @ 150 DPI max width = 1754
    expect(result.width).toBeLessThanOrEqual(1754);
  });

  // Cas 6 : 220 DPI — valeurs plus élevées mais même logique
  it('produces larger dimensions at 220dpi without upscaling small files', () => {
    const at150 = computeTargetDimensions(4000, 6000, 'A4', 150);
    const at220 = computeTargetDimensions(4000, 6000, 'A4', 220);
    expect(at220.width).toBeGreaterThan(at150.width);
    expect(at220.height).toBeGreaterThan(at150.height);
  });

});
