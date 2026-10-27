import type { ProcessOptions } from './strategy';

export interface Dimensions {
  width: number;
  height: number;
}

const clampPx = (value: number): number => Math.max(1, Math.round(value));

/**
 * Pure target-size calculation shared by the worker and the main-thread fallback.
 * Missing/zero width or height fall back to the original dimension.
 */
export function computeTargetDimensions(
  origWidth: number,
  origHeight: number,
  options: Pick<ProcessOptions, 'scaleMode' | 'scale' | 'width' | 'height' | 'maintainAspectRatio'>
): Dimensions {
  const scaleMode = options.scaleMode || 'percentage';
  const keepAspect = options.maintainAspectRatio !== false;

  switch (scaleMode) {
    case 'percentage': {
      const factor = typeof options.scale === 'number' ? options.scale : 1;
      return { width: clampPx(origWidth * factor), height: clampPx(origHeight * factor) };
    }
    case 'fit-width': {
      const width = clampPx(options.width || origWidth);
      const height = keepAspect
        ? clampPx((origHeight / origWidth) * width)
        : options.height || origHeight;
      return { width, height };
    }
    case 'fit-height': {
      const height = clampPx(options.height || origHeight);
      const width = keepAspect
        ? clampPx((origWidth / origHeight) * height)
        : options.width || origWidth;
      return { width, height };
    }
    case 'exact': {
      const reqW = options.width || origWidth;
      const reqH = options.height || origHeight;
      if (options.maintainAspectRatio) {
        const ratio = Math.min(reqW / origWidth, reqH / origHeight);
        return { width: clampPx(origWidth * ratio), height: clampPx(origHeight * ratio) };
      }
      return { width: clampPx(reqW), height: clampPx(reqH) };
    }
    default:
      return { width: origWidth, height: origHeight };
  }
}
