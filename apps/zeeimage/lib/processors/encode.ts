import type { ProcessOptions } from './strategy';

export interface EncodeParams {
  type: string;
  quality: number;
}

/** Used when the browser cannot encode the requested format. */
export const FALLBACK_ENCODE: EncodeParams = { type: 'image/webp', quality: 0.85 };

/** Resolves the MIME type and 0..1 quality passed to the canvas encoder. */
export function resolveEncodeParams(
  options: Pick<ProcessOptions, 'format' | 'quality' | 'lossless'>
): EncodeParams {
  const type = options.format || 'image/webp';
  let quality = Math.min(1, Math.max(0.01, (options.quality || 82) / 100));
  if (options.lossless && type === 'image/webp') {
    quality = 1;
  }
  return { type, quality };
}

/**
 * True when the encoder handed back another format than the one asked for. A canvas does not throw on a type
 * it cannot encode (AVIF in most browsers): it quietly returns a PNG, so the result has to be checked instead
 * of trusting a try/catch. ICO is left alone: the batch encodes it as PNG on purpose, and lib/ico.ts builds
 * real .ico files.
 */
export function needsFallback(blob: Blob, requestedType: string): boolean {
  return requestedType !== 'image/x-icon' && blob.type !== requestedType;
}

const support = new Map<string, Promise<boolean>>();

/** Encodes a 1×1 canvas once per type and checks what comes back; the answer is cached for the page's life. */
export function canEncode(type: string): Promise<boolean> {
  let probe = support.get(type);
  if (!probe) {
    probe = probeEncode(type).catch(() => false);
    support.set(type, probe);
  }
  return probe;
}

async function probeEncode(type: string): Promise<boolean> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(1, 1);
    canvas.getContext('2d')?.fillRect(0, 0, 1, 1);
    const blob = await canvas.convertToBlob({ type });
    return blob.type === type;
  }
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type));
  return blob?.type === type;
}

/** Forgets the cached answers. Tests only. */
export function resetEncodeSupport(): void {
  support.clear();
}
