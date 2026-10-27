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
