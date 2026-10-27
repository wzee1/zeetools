import { describe, expect, it } from 'vitest';
import { createZipArchive } from './zip';
import { encodeIco } from './ico';
import { PRESETS } from './presets';

async function bytesOf(blob: Blob): Promise<DataView> {
  return new DataView(await blob.arrayBuffer());
}

describe('createZipArchive', () => {
  it('writes a valid central directory for Uint8Array and Blob entries', async () => {
    const progress: number[] = [];
    const zip = await createZipArchive(
      [
        { name: 'a.txt', data: new TextEncoder().encode('hello') },
        { name: 'é.bin', data: new Blob([new Uint8Array([1, 2, 3])]) },
      ],
      (done, total) => progress.push(done * 10 + total)
    );
    const view = await bytesOf(zip);
    const eocd = view.byteLength - 22;

    expect(view.getUint32(eocd, true)).toBe(0x06054b50);
    expect(view.getUint16(eocd + 10, true)).toBe(2); // total entries
    expect(view.getUint32(view.getUint32(eocd + 16, true), true)).toBe(0x02014b50);
    expect(progress).toEqual([12, 22]);
  });

  it('stores the CRC and sizes of each entry', async () => {
    const zip = await createZipArchive([{ name: 'n', data: new TextEncoder().encode('123456789') }]);
    const view = await bytesOf(zip);
    expect(view.getUint32(14, true)).toBe(0xcbf43926);
    expect(view.getUint32(18, true)).toBe(9);
    expect(view.getUint32(22, true)).toBe(9);
  });

  it('produces an empty but valid archive for no entries', async () => {
    const view = await bytesOf(await createZipArchive([]));
    expect(view.byteLength).toBe(22);
    expect(view.getUint16(10, true)).toBe(0);
  });
});

describe('encodeIco', () => {
  it('encodes 256px layers as 0 and lays out data offsets after the directory', () => {
    const ico = encodeIco([{ width: 256, height: 256, pngData: new Uint8Array([9, 9, 9]) }]);
    const view = new DataView(ico.buffer);
    expect(view.getUint8(6)).toBe(0);
    expect(view.getUint8(7)).toBe(0);
    expect(view.getUint32(14, true)).toBe(3);
    expect(view.getUint32(18, true)).toBe(22);
    expect(Array.from(ico.slice(22))).toEqual([9, 9, 9]);
  });
});

describe('PRESETS', () => {
  it('has unique ids and a filename template with [ext] in each', () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const preset of PRESETS) {
      expect(preset.options.filenameTemplate).toContain('[ext]');
    }
  });
});
