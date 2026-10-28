import { afterEach, describe, expect, it, vi } from 'vitest';
import { canEncode, needsFallback, resetEncodeSupport } from './encode';

const blob = (type: string) => new Blob(['x'], { type });

describe('needsFallback', () => {
  it('flags a PNG handed back for an AVIF request', () => {
    expect(needsFallback(blob('image/png'), 'image/avif')).toBe(true);
  });

  it('accepts the format that was asked for', () => {
    expect(needsFallback(blob('image/avif'), 'image/avif')).toBe(false);
    expect(needsFallback(blob('image/webp'), 'image/webp')).toBe(false);
  });

  it('leaves ICO alone, which the batch encodes as PNG on purpose', () => {
    expect(needsFallback(blob('image/png'), 'image/x-icon')).toBe(false);
  });
});

/** An OffscreenCanvas whose encoder only produces `produced`, like a browser without an AVIF encoder. */
function stubOffscreenCanvas(produced: (requested: string) => string) {
  const convertToBlob = vi.fn(async ({ type }: { type: string }) => blob(produced(type)));
  vi.stubGlobal(
    'OffscreenCanvas',
    class {
      getContext() {
        return { fillRect() {} };
      }
      convertToBlob = convertToBlob;
    }
  );
  return convertToBlob;
}

describe('canEncode', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetEncodeSupport();
  });

  it('is false when the canvas quietly returns a PNG', async () => {
    stubOffscreenCanvas(() => 'image/png');
    expect(await canEncode('image/avif')).toBe(false);
  });

  it('is true when the canvas really encodes the type', async () => {
    stubOffscreenCanvas((requested) => requested);
    expect(await canEncode('image/avif')).toBe(true);
  });

  it('probes each type once', async () => {
    const convertToBlob = stubOffscreenCanvas((requested) => requested);
    await canEncode('image/avif');
    await canEncode('image/avif');
    expect(convertToBlob).toHaveBeenCalledTimes(1);
  });

  it('is false when the probe itself fails', async () => {
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext() {
          return null;
        }
        convertToBlob() {
          return Promise.reject(new Error('no encoder'));
        }
      }
    );
    expect(await canEncode('image/avif')).toBe(false);
  });
});
