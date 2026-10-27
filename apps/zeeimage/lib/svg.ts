/**
 * SVG decoding. `createImageBitmap` cannot decode SVG blobs in Chrome (and not at all in workers), so SVGs are
 * drawn from an HTMLImageElement onto a canvas on the main thread, and the result goes into the usual pipeline.
 */

export interface SvgSize {
  width: number;
  height: number;
}

export const DEFAULT_SVG_SIZE: SvgSize = { width: 512, height: 512 };

/** Largest side an SVG is rasterised at on its own, so a huge viewBox cannot exhaust memory. */
const MAX_SIDE = 4096;

export function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
}

/** A plain length ("512", "512px"). Percentages, ems and the like have no pixel size of their own. */
function parseLength(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = /^\s*([0-9]*\.?[0-9]+)\s*(px)?\s*$/i.exec(raw);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return value > 0 ? value : null;
}

function attribute(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return match ? (match[1] ?? match[2]) : undefined;
}

/** The SVG's own size: width/height when both are set, else its viewBox, else 512×512. */
export function parseSvgSize(text: string): SvgSize {
  const tag = /<svg\b[^>]*>/i.exec(text)?.[0] ?? '';

  const width = parseLength(attribute(tag, 'width'));
  const height = parseLength(attribute(tag, 'height'));
  if (width && height) return { width, height };

  const viewBox = attribute(tag, 'viewBox')?.trim().split(/[\s,]+/).map(Number);
  if (viewBox && viewBox.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return { width: viewBox[2], height: viewBox[3] };
  }

  return DEFAULT_SVG_SIZE;
}

export async function readSvgSize(file: File): Promise<SvgSize> {
  return parseSvgSize(await file.text());
}

/** Output size: the SVG's own size, or scaled so its longest side is `longEdge`, never past MAX_SIDE. */
export function svgRenderSize(size: SvgSize, longEdge?: number): SvgSize {
  const target = Math.min(longEdge ?? Math.max(size.width, size.height), MAX_SIDE);
  const scale = target / Math.max(size.width, size.height);
  return {
    width: Math.max(1, Math.round(size.width * scale)),
    height: Math.max(1, Math.round(size.height * scale)),
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('The SVG could not be decoded.'));
    img.src = url;
  });
}

/** Draws an SVG onto a canvas at its own size, or with its longest side at `longEdge`. */
export async function rasterizeSvg(file: File, longEdge?: number): Promise<HTMLCanvasElement> {
  const size = await readSvgSize(file);
  const { width, height } = svgRenderSize(size, longEdge);

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** An SVG as a PNG file (same name, .png) that the regular decode path can read. Also returns the SVG's own size. */
export async function svgToPngFile(file: File): Promise<{ file: File; size: SvgSize }> {
  const canvas = await rasterizeSvg(file);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), 'image/png');
  });
  return {
    file: new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.png', { type: 'image/png' }),
    size: { width: canvas.width, height: canvas.height },
  };
}
