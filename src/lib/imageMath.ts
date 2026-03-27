export type PageFormat = 'A4' | 'LETTER';
export type TargetDpi = 150 | 220;

export const PAGE_FORMATS: Record<PageFormat, { wMm: number; hMm: number }> = {
  A4:     { wMm: 210, hMm: 297 },
  LETTER: { wMm: 216, hMm: 279 },
};

export interface TargetDimensions {
  readonly width: number;
  readonly height: number;
  readonly isLandscape: boolean;
  readonly scaleFactor: number;
}

export interface TransformConfig {
  readonly targetDpi: TargetDpi;
  readonly pageFormat: PageFormat;
  readonly jpegQuality: number;
}

export function computeTargetDimensions(
  srcWidth: number,
  srcHeight: number,
  format: PageFormat,
  dpi: TargetDpi
): TargetDimensions {
  const { wMm, hMm } = PAGE_FORMATS[format];
  const isLandscape = srcWidth > srcHeight;

  // On adapte l'orientation de la page à l'image source
  // Si portrait : 210 x 297 mm
  // Si paysage : 297 x 210 mm
  const [pageWMm, pageHMm] = isLandscape
    ? [hMm, wMm]
    : [wMm, hMm];

  const maxWidth  = Math.round((pageWMm / 25.4) * dpi);
  const maxHeight = Math.round((pageHMm / 25.4) * dpi);

  // ratio <= 1 : jamais d'upscale
  const scaleFactor = Math.min(
    maxWidth  / srcWidth,
    maxHeight / srcHeight,
    1
  );

  return {
    width:       Math.round(srcWidth  * scaleFactor),
    height:      Math.round(srcHeight * scaleFactor),
    isLandscape,
    scaleFactor,
  };
}

export function estimateCanvasRamBytes(width: number, height: number): number {
  return width * height * 4; // RGBA = 4 bytes/pixel
}
