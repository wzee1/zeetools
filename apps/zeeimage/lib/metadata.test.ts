import { describe, expect, it } from 'vitest';
import { detectContainer, fitExif, readExif, writeExif } from './metadata';
import { computeCrc32 } from './zip';

const chars = (text: string) => [...text].map((ch) => ch.charCodeAt(0));
const le16 = (v: number) => [v & 0xff, (v >> 8) & 0xff];
const le32 = (v: number) => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff];
const be32 = (v: number) => [(v >>> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff];
const entry = (tag: number, type: number, value: number) =>
  [...le16(tag), ...le16(type), ...le32(1), ...(type === 3 ? [...le16(value), 0, 0] : le32(value))];

/**
 * A little-endian TIFF block like a phone writes: IFD0 at 8 (Orientation 6, a pointer to the Exif IFD at 38,
 * and IFD1 next at 68), the Exif IFD with a 4000x3000 pixel size, and an empty IFD1 standing in for the thumbnail.
 */
const TIFF = new Uint8Array([
  ...chars('II'), 0x2a, 0x00, ...le32(8),
  ...le16(2), ...entry(0x0112, 3, 6), ...entry(0x8769, 4, 38), ...le32(68),
  ...le16(2), ...entry(0xa002, 4, 4000), ...entry(0xa003, 3, 3000), ...le32(0),
  ...le16(0), ...le32(0),
]);

/** Reads a tag's value from IFD0 or, with `exif`, the Exif IFD, the way a viewer would. */
function tag(tiff: Uint8Array, id: number, exif = false): number | undefined {
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  const find = (offset: number, wanted: number) => {
    for (let i = 0; i < view.getUint16(offset, true); i++) {
      const at = offset + 2 + i * 12;
      if (view.getUint16(at, true) !== wanted) continue;
      return view.getUint16(at + 2, true) === 3 ? view.getUint16(at + 8, true) : view.getUint32(at + 8, true);
    }
  };
  const ifd0 = view.getUint32(4, true);
  return exif ? find(find(ifd0, 0x8769)!, id) : find(ifd0, id);
}
const nextIfd = (tiff: Uint8Array) => new DataView(tiff.buffer, tiff.byteOffset).getUint32(8 + 2 + 2 * 12, true);

const jpegWith = (...segments: number[][]) => new Uint8Array([0xff, 0xd8, ...segments.flat(), 0xff, 0xda, 0, 2, 0xff, 0xd9]);
const APP0 = [0xff, 0xe0, 0x00, 0x06, ...chars('JFIF')];
const app1 = (tiff: Uint8Array) => {
  const length = 2 + 6 + tiff.length;
  return [0xff, 0xe1, length >> 8, length & 0xff, ...chars('Exif'), 0, 0, ...tiff];
};
const pngChunk = (type: string, data: number[]) => [...be32(data.length), ...chars(type), ...data, 0, 0, 0, 0];
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...pngChunk('IHDR', Array(13).fill(0)), ...pngChunk('IDAT', [1]), ...pngChunk('IEND', [])]);

/** A simple lossless WebP: one VP8L chunk for a 100x50 image with alpha. */
function webpLossless(): Uint8Array {
  const bits = 99 | (49 << 14) | (1 << 28);
  const vp8l = [...chars('VP8L'), ...le32(5), 0x2f, ...le32(bits), 0];
  return new Uint8Array([...chars('RIFF'), ...le32(4 + vp8l.length), ...chars('WEBP'), ...vp8l]);
}

describe('readExif', () => {
  it('finds the block in a JPEG APP1 segment, past other segments', () => {
    expect(readExif(jpegWith(APP0, app1(TIFF)))).toEqual(TIFF);
  });

  it('returns null for a JPEG without EXIF and for formats it does not know', () => {
    expect(readExif(jpegWith(APP0))).toBeNull();
    expect(readExif(new Uint8Array([0, 0, 1, 0]))).toBeNull();
  });
});

describe('fitExif', () => {
  const fitted = fitExif(TIFF, { width: 1600, height: 1200 })!;

  it('resets Orientation, because the decoded pixels are already upright', () => {
    expect(tag(TIFF, 0x0112)).toBe(6);
    expect(tag(fitted, 0x0112)).toBe(1);
  });

  it('writes the output size into both pixel-dimension tags, SHORT and LONG', () => {
    expect(tag(fitted, 0xa002, true)).toBe(1600);
    expect(tag(fitted, 0xa003, true)).toBe(1200);
  });

  it('drops the thumbnail IFD, and leaves the original untouched', () => {
    expect(nextIfd(TIFF)).toBe(68);
    expect(nextIfd(fitted)).toBe(0);
  });

  it('rejects a block whose IFD points outside it', () => {
    const broken = TIFF.slice();
    broken.set(le32(9999), 4);
    expect(fitExif(broken, { width: 1, height: 1 })).toBeNull();
  });
});

describe('writeExif', () => {
  it('puts an APP1 segment straight after the JPEG start marker, readable again', () => {
    const out = writeExif(jpegWith(APP0), TIFF);
    expect([...out.subarray(0, 4)]).toEqual([0xff, 0xd8, 0xff, 0xe1]);
    expect(readExif(out)).toEqual(TIFF);
  });

  it('puts an eXIf chunk with a valid CRC before the first PNG IDAT', () => {
    const out = writeExif(PNG, TIFF);
    const at = 8 + 25; // after the signature and IHDR
    expect(String.fromCharCode(...out.subarray(at + 4, at + 8))).toBe('eXIf');
    const crc = new DataView(out.buffer).getUint32(at + 8 + TIFF.length);
    expect(crc).toBe(computeCrc32(out.subarray(at + 4, at + 8 + TIFF.length)));
    expect(String.fromCharCode(...out.subarray(at + 12 + TIFF.length + 4, at + 12 + TIFF.length + 8))).toBe('IDAT');
    expect(readExif(out)).toEqual(TIFF);
  });

  it('turns a simple WebP into the extended format with the EXIF and alpha flags and the right size', () => {
    const out = writeExif(webpLossless(), TIFF);
    const view = new DataView(out.buffer);
    expect(detectContainer(out)).toBe('webp');
    expect(String.fromCharCode(...out.subarray(12, 16))).toBe('VP8X');
    expect(out[20]).toBe(0x08 | 0x10);
    expect(view.getUint32(24, true) & 0xffffff).toBe(99); // width - 1
    expect(view.getUint32(27, true) & 0xffffff).toBe(49); // height - 1
    expect(view.getUint32(4, true)).toBe(out.length - 8);
    expect(readExif(out)).toEqual(TIFF);
  });

  it('only sets the flag on a WebP that already has a VP8X header, and replaces an old EXIF chunk', () => {
    const once = writeExif(webpLossless(), TIFF);
    const twice = writeExif(once, TIFF);
    expect(twice.length).toBe(once.length);
    expect(readExif(twice)).toEqual(TIFF);
  });

  it('leaves a JPEG alone when the block is too big for one segment', () => {
    const image = jpegWith(APP0);
    expect(writeExif(image, new Uint8Array(70000))).toBe(image);
  });
});
