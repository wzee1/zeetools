import { describe, expect, it } from 'vitest';
import { DEFAULT_SVG_SIZE, isSvgFile, parseSvgSize, svgRenderSize } from './svg';

describe('parseSvgSize', () => {
  it('uses width and height when both are set', () => {
    expect(parseSvgSize('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 10 10"/>')).toEqual({
      width: 512,
      height: 256,
    });
    expect(parseSvgSize("<svg width='64px' height='48px'></svg>")).toEqual({ width: 64, height: 48 });
  });

  it('falls back to the viewBox', () => {
    expect(parseSvgSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect/></svg>')).toEqual({
      width: 512,
      height: 512,
    });
    expect(parseSvgSize('<svg viewBox="0,0,300,150"/>')).toEqual({ width: 300, height: 150 });
  });

  it('ignores relative lengths and uses the viewBox', () => {
    expect(parseSvgSize('<svg width="100%" height="100%" viewBox="0 0 24 24"/>')).toEqual({ width: 24, height: 24 });
  });

  it('defaults to 512×512 when there is no size at all', () => {
    expect(parseSvgSize('<svg/>')).toEqual(DEFAULT_SVG_SIZE);
    expect(parseSvgSize('not even markup')).toEqual({ width: 512, height: 512 });
  });
});

describe('svgRenderSize', () => {
  it('keeps the own size by default', () => {
    expect(svgRenderSize({ width: 300, height: 150 })).toEqual({ width: 300, height: 150 });
  });

  it('scales the longest side to the requested edge, keeping the ratio', () => {
    expect(svgRenderSize({ width: 24, height: 12 }, 512)).toEqual({ width: 512, height: 256 });
  });

  it('caps very large SVGs', () => {
    expect(svgRenderSize({ width: 20000, height: 10000 })).toEqual({ width: 4096, height: 2048 });
  });
});

describe('isSvgFile', () => {
  it('matches by type or extension', () => {
    expect(isSvgFile(new File([''], 'a.svg'))).toBe(true);
    expect(isSvgFile(new File([''], 'a', { type: 'image/svg+xml' }))).toBe(true);
    expect(isSvgFile(new File([''], 'a.png', { type: 'image/png' }))).toBe(false);
  });
});
