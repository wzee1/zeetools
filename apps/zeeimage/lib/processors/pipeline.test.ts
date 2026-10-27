import { describe, expect, it } from 'vitest';
import { formatOutputFilename, getFileExtension } from './client-worker';
import { computeCrc32, createZipArchive } from '../zip';
import { encodeIco } from '../ico';
import { PRESETS } from '../presets';

describe('formatOutputFilename', () => {
  it('correctly formats template tokens', () => {
    const filename = formatOutputFilename(
      'hero-image.png',
      '[name]-[width]x[height].[ext]',
      1920,
      1080,
      'image/webp'
    );
    expect(filename).toBe('hero-image-1920x1080.webp');
  });

  it('handles custom suffix templates', () => {
    const filename = formatOutputFilename(
      'avatar.jpeg',
      '[name]-optimized.[ext]',
      512,
      512,
      'image/png'
    );
    expect(filename).toBe('avatar-optimized.png');
  });

  it('resolves correct extensions for image formats', () => {
    expect(getFileExtension('image/webp')).toBe('webp');
    expect(getFileExtension('image/jpeg')).toBe('jpg');
    expect(getFileExtension('image/png')).toBe('png');
    expect(getFileExtension('image/avif')).toBe('avif');
    expect(getFileExtension('image/x-icon')).toBe('ico');
  });
});

describe('zip packaging', () => {
  it('computes accurate CRC-32 values', () => {
    const data = new TextEncoder().encode('123456789');
    // Standard test vector: CRC32("123456789") == 0xcbf43926 (3421780262)
    const crc = computeCrc32(data);
    expect(crc).toBe(0xcbf43926);
  });

  it('builds a valid in-memory ZIP blob', async () => {
    const testData = new TextEncoder().encode('hello world');
    const zipBlob = await createZipArchive([
      { name: 'test.txt', data: testData },
    ]);

    expect(zipBlob.type).toBe('application/zip');
    expect(zipBlob.size).toBeGreaterThan(0);

    // Verify ZIP magic header 0x04034b50 (PK\x03\x04)
    const buffer = await zipBlob.arrayBuffer();
    const view = new DataView(buffer);
    const magic = view.getUint32(0, true);
    expect(magic).toBe(0x04034b50);
  });
});

describe('ico encoding', () => {
  it('encodes multiple layers into valid Windows ICO format', () => {
    const fakePng16 = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const fakePng32 = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02]);

    const ico = encodeIco([
      { width: 16, height: 16, pngData: fakePng16 },
      { width: 32, height: 32, pngData: fakePng32 },
    ]);

    const view = new DataView(ico.buffer);
    // Reserved = 0
    expect(view.getUint16(0, true)).toBe(0);
    // Type 1 = ICO
    expect(view.getUint16(2, true)).toBe(1);
    // Image count = 2
    expect(view.getUint16(4, true)).toBe(2);

    // First entry width = 16, height = 16
    expect(view.getUint8(6)).toBe(16);
    expect(view.getUint8(7)).toBe(16);

    // Second entry width = 32, height = 32
    expect(view.getUint8(22)).toBe(32);
    expect(view.getUint8(23)).toBe(32);
  });
});

describe('presets', () => {
  it('provides web-optimized default preset', () => {
    const webOpt = PRESETS.find((p) => p.id === 'web-optimized');
    expect(webOpt).toBeDefined();
    expect(webOpt?.options.format).toBe('image/webp');
    expect(webOpt?.options.quality).toBe(82);
  });
});
