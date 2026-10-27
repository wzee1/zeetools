import { describe, expect, it } from 'vitest';
import { computeTargetDimensions } from './dimensions';
import { resolveEncodeParams } from './encode';

describe('computeTargetDimensions', () => {
  it('percentage scales both sides and never returns 0', () => {
    expect(computeTargetDimensions(1000, 500, { scaleMode: 'percentage', scale: 0.5 })).toEqual({ width: 500, height: 250 });
    expect(computeTargetDimensions(1000, 500, { scale: 0.25 })).toEqual({ width: 250, height: 125 });
    expect(computeTargetDimensions(3, 3, { scaleMode: 'percentage', scale: 0.1 })).toEqual({ width: 1, height: 1 });
  });

  it('percentage treats missing scale as 100% and scale 0 as the 1px minimum', () => {
    expect(computeTargetDimensions(800, 600, { scaleMode: 'percentage' })).toEqual({ width: 800, height: 600 });
    expect(computeTargetDimensions(800, 600, { scaleMode: 'percentage', scale: 0 })).toEqual({ width: 1, height: 1 });
  });

  it('fit-width keeps the aspect ratio unless disabled', () => {
    expect(computeTargetDimensions(2000, 1000, { scaleMode: 'fit-width', width: 500 })).toEqual({ width: 500, height: 250 });
    expect(
      computeTargetDimensions(2000, 1000, { scaleMode: 'fit-width', width: 500, height: 400, maintainAspectRatio: false })
    ).toEqual({ width: 500, height: 400 });
    expect(
      computeTargetDimensions(2000, 1000, { scaleMode: 'fit-width', width: 500, maintainAspectRatio: false })
    ).toEqual({ width: 500, height: 1000 });
  });

  it('fit-height keeps the aspect ratio unless disabled', () => {
    expect(computeTargetDimensions(2000, 1000, { scaleMode: 'fit-height', height: 250 })).toEqual({ width: 500, height: 250 });
    expect(
      computeTargetDimensions(2000, 1000, { scaleMode: 'fit-height', height: 250, width: 300, maintainAspectRatio: false })
    ).toEqual({ width: 300, height: 250 });
    expect(
      computeTargetDimensions(2000, 1000, { scaleMode: 'fit-height', height: 250, maintainAspectRatio: false })
    ).toEqual({ width: 2000, height: 250 });
  });

  it('exact stretches to the requested box, or fits inside it with aspect ratio', () => {
    expect(
      computeTargetDimensions(2000, 1000, { scaleMode: 'exact', width: 300, height: 300, maintainAspectRatio: false })
    ).toEqual({ width: 300, height: 300 });
    expect(
      computeTargetDimensions(2000, 1000, { scaleMode: 'exact', width: 300, height: 300, maintainAspectRatio: true })
    ).toEqual({ width: 300, height: 150 });
  });

  it('falls back to the original size when width or height is missing', () => {
    expect(computeTargetDimensions(640, 480, { scaleMode: 'fit-width' })).toEqual({ width: 640, height: 480 });
    expect(computeTargetDimensions(640, 480, { scaleMode: 'fit-height' })).toEqual({ width: 640, height: 480 });
    expect(computeTargetDimensions(640, 480, { scaleMode: 'exact', maintainAspectRatio: false })).toEqual({ width: 640, height: 480 });
    expect(computeTargetDimensions(640, 480, { scaleMode: 'exact', width: 320, maintainAspectRatio: false })).toEqual({ width: 320, height: 480 });
    expect(computeTargetDimensions(640, 480, { scaleMode: 'exact', width: 320, maintainAspectRatio: true })).toEqual({ width: 320, height: 240 });
  });
});

describe('resolveEncodeParams', () => {
  it('converts quality to 0..1 within bounds and defaults the format', () => {
    expect(resolveEncodeParams({ format: 'image/jpeg', quality: 50 })).toEqual({ type: 'image/jpeg', quality: 0.5 });
    expect(resolveEncodeParams({ format: 'image/jpeg', quality: 500 }).quality).toBe(1);
    expect(resolveEncodeParams({ format: 'image/jpeg', quality: 0 }).quality).toBe(0.82);
    expect(resolveEncodeParams({ format: 'image/jpeg', quality: -5 }).quality).toBe(0.01);
  });

  it('forces quality 1 for lossless WebP only', () => {
    expect(resolveEncodeParams({ format: 'image/webp', quality: 40, lossless: true }).quality).toBe(1);
    expect(resolveEncodeParams({ format: 'image/jpeg', quality: 40, lossless: true }).quality).toBe(0.4);
  });
});
