/**
 * Keeping EXIF metadata through a re-encode. A canvas never writes metadata, so when "Strip EXIF & Metadata" is off
 * the EXIF block (a small TIFF structure) is read from the original file and written into the encoded output.
 * Supported in and out: JPEG (APP1 segment), PNG (eXIf chunk) and WebP (EXIF chunk). Other formats (AVIF, ICO,
 * HEIC input) have no block to copy or no place to put it, so their output stays without metadata.
 *
 * The copy is adjusted to the new image: the browser already applied the Orientation tag when it decoded the
 * pixels, so Orientation is reset to 1 (or viewers would rotate the photo a second time); the pixel dimensions are
 * set to the output size; and the embedded thumbnail (IFD1) is dropped, since it shows the original.
 */
import { computeCrc32 } from './zip';

const ascii = (bytes: Uint8Array, at: number, text: string) =>
  at + text.length <= bytes.length && [...text].every((ch, i) => bytes[at + i] === ch.charCodeAt(0));

const EXIF_HEADER = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // "Exif\0\0"
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

type Container = 'jpeg' | 'png' | 'webp';

/** The file's container, from its first bytes (not its name or MIME type). */
export function detectContainer(bytes: Uint8Array): Container | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg';
  if (PNG_SIGNATURE.every((b, i) => bytes[i] === b)) return 'png';
  if (ascii(bytes, 0, 'RIFF') && ascii(bytes, 8, 'WEBP')) return 'webp';
  return null;
}

/** Strips a leading "Exif\0\0" (JPEG's APP1 prefix, which some WebP writers copy too) and checks for a TIFF header. */
function asTiff(data: Uint8Array): Uint8Array | null {
  const body = EXIF_HEADER.every((b, i) => data[i] === b) ? data.subarray(EXIF_HEADER.length) : data;
  const ii = body[0] === 0x49 && body[1] === 0x49 && body[2] === 0x2a && body[3] === 0x00;
  const mm = body[0] === 0x4d && body[1] === 0x4d && body[2] === 0x00 && body[3] === 0x2a;
  return ii || mm ? body : null;
}

/** The raw EXIF (TIFF) block of a JPEG, PNG or WebP file, or null when it has none. */
export function readExif(bytes: Uint8Array): Uint8Array | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  switch (detectContainer(bytes)) {
    case 'jpeg': {
      let at = 2;
      while (at + 4 <= bytes.length && bytes[at] === 0xff) {
        const marker = bytes[at + 1];
        if (marker === 0xda || marker === 0xd9) break; // start of scan / end of image: no more headers
        const length = view.getUint16(at + 2);
        if (marker === 0xe1) {
          const tiff = asTiff(bytes.subarray(at + 4, at + 2 + length));
          if (tiff) return tiff;
        }
        at += 2 + length;
      }
      return null;
    }
    case 'png': {
      for (let at = 8; at + 12 <= bytes.length; ) {
        const length = view.getUint32(at);
        if (ascii(bytes, at + 4, 'eXIf')) return asTiff(bytes.subarray(at + 8, at + 8 + length));
        if (ascii(bytes, at + 4, 'IEND')) break;
        at += 12 + length;
      }
      return null;
    }
    case 'webp': {
      for (let at = 12; at + 8 <= bytes.length; ) {
        const size = view.getUint32(at + 4, true);
        if (ascii(bytes, at, 'EXIF')) return asTiff(bytes.subarray(at + 8, at + 8 + size));
        at += 8 + size + (size & 1);
      }
      return null;
    }
    default:
      return null;
  }
}

const TAG_ORIENTATION = 0x0112;
const TAG_EXIF_IFD = 0x8769;
const TAG_PIXEL_X = 0xa002;
const TAG_PIXEL_Y = 0xa003;
const TYPE_SHORT = 3;
const TYPE_LONG = 4;

/**
 * A copy of the TIFF block fitted to the output: Orientation 1, the new pixel size, and no thumbnail IFD.
 * Returns null when the structure doesn't parse, so a damaged block is dropped rather than copied.
 */
export function fitExif(tiff: Uint8Array, size: { width: number; height: number }): Uint8Array | null {
  const out = tiff.slice();
  const view = new DataView(out.buffer);
  const little = out[0] === 0x49;
  const u16 = (at: number) => view.getUint16(at, little);
  const u32 = (at: number) => view.getUint32(at, little);
  const inside = (at: number, length: number) => at >= 8 && at + length <= out.length;

  /** Calls back for each entry of the IFD at `offset`, and returns where its next-IFD pointer sits. */
  const walk = (offset: number, visit: (entry: number, tag: number, type: number) => void): number | null => {
    if (!inside(offset, 2)) return null;
    const count = u16(offset);
    if (!inside(offset + 2, count * 12 + 4)) return null;
    for (let i = 0; i < count; i++) {
      const entry = offset + 2 + i * 12;
      visit(entry, u16(entry), u16(entry + 2));
    }
    return offset + 2 + count * 12;
  };
  const setValue = (entry: number, type: number, value: number) => {
    if (type === TYPE_SHORT) view.setUint16(entry + 8, value, little);
    else if (type === TYPE_LONG) view.setUint32(entry + 8, value, little);
  };

  let exifIfd = 0;
  const next = walk(u32(4), (entry, tag, type) => {
    if (tag === TAG_ORIENTATION) setValue(entry, type, 1);
    if (tag === TAG_EXIF_IFD) exifIfd = u32(entry + 8);
  });
  if (next === null) return null;
  view.setUint32(next, 0, little); // no IFD1: the thumbnail would show the original

  if (exifIfd) {
    walk(exifIfd, (entry, tag, type) => {
      if (tag === TAG_PIXEL_X) setValue(entry, type, size.width);
      if (tag === TAG_PIXEL_Y) setValue(entry, type, size.height);
    });
  }
  return out;
}

const be32 = (value: number) => [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
const le32 = (value: number) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
const le24 = (value: number) => [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff];
const chars = (text: string) => [...text].map((ch) => ch.charCodeAt(0));

function concat(parts: (Uint8Array | number[])[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/** The encoded image with the TIFF block written in, or the image unchanged when its container can't carry it. */
export function writeExif(image: Uint8Array, tiff: Uint8Array): Uint8Array {
  const view = new DataView(image.buffer, image.byteOffset, image.byteLength);
  switch (detectContainer(image)) {
    case 'jpeg': {
      // An APP1 segment straight after the start-of-image marker; its length field is 16 bits.
      const length = 2 + EXIF_HEADER.length + tiff.length;
      if (length > 0xffff) return image;
      return concat([image.subarray(0, 2), [0xff, 0xe1, length >> 8, length & 0xff], EXIF_HEADER, tiff, image.subarray(2)]);
    }
    case 'png': {
      // An eXIf chunk before the first IDAT, as the PNG spec asks.
      let at = 8;
      while (at + 12 <= image.length && !ascii(image, at + 4, 'IDAT')) at += 12 + view.getUint32(at);
      if (at + 12 > image.length) return image;
      const body = concat([chars('eXIf'), tiff]);
      const chunk = concat([be32(tiff.length), body, be32(computeCrc32(body))]);
      return concat([image.subarray(0, at), chunk, image.subarray(at)]);
    }
    case 'webp': {
      // EXIF needs the extended format: a VP8X header chunk with the EXIF flag, and the EXIF chunk after the image.
      const chunks: Uint8Array[] = [];
      let header: Uint8Array | null = null;
      for (let at = 12; at + 8 <= image.length; ) {
        const size = view.getUint32(at + 4, true);
        const chunk = image.slice(at, at + 8 + size + (size & 1));
        if (ascii(chunk, 0, 'VP8X')) header = chunk;
        else if (!ascii(chunk, 0, 'EXIF')) chunks.push(chunk);
        at += chunk.length;
      }
      if (header) {
        header[8] |= 0x08;
      } else {
        const frame = chunks.find((chunk) => ascii(chunk, 0, 'VP8 ') || ascii(chunk, 0, 'VP8L'));
        const dims = frame && webpFrameSize(frame);
        if (!dims) return image;
        const flags = 0x08 | (dims.alpha ? 0x10 : 0);
        header = concat([chars('VP8X'), le32(10), [flags, 0, 0, 0], le24(dims.width - 1), le24(dims.height - 1)]);
      }
      const exif = concat([chars('EXIF'), le32(tiff.length), tiff, tiff.length & 1 ? [0] : []]);
      const body = concat([chars('WEBP'), header, ...chunks, exif]);
      return concat([chars('RIFF'), le32(body.length), body]);
    }
    default:
      return image;
  }
}

/** The canvas size (and, for lossless, the alpha bit) of a simple WebP's single VP8 or VP8L chunk. */
function webpFrameSize(chunk: Uint8Array): { width: number; height: number; alpha: boolean } | null {
  const view = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  if (ascii(chunk, 0, 'VP8L') && chunk[8] === 0x2f && chunk.length >= 13) {
    const bits = view.getUint32(9, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1, alpha: ((bits >>> 28) & 1) === 1 };
  }
  if (ascii(chunk, 0, 'VP8 ') && chunk[11] === 0x9d && chunk[12] === 0x01 && chunk[13] === 0x2a && chunk.length >= 18) {
    return { width: view.getUint16(14, true) & 0x3fff, height: view.getUint16(16, true) & 0x3fff, alpha: false };
  }
  return null;
}

/** The encoded output with the original file's EXIF kept (fitted to the output), or the output as it was. */
export async function keepExif(original: Blob, encoded: Blob, size: { width: number; height: number }): Promise<Blob> {
  const tiff = readExif(new Uint8Array(await original.arrayBuffer()));
  const fitted = tiff && fitExif(tiff, size);
  if (!fitted) return encoded;
  const image = new Uint8Array(await encoded.arrayBuffer());
  const out = writeExif(image, fitted);
  // A new array (not `image`) is always built by concat on a plain ArrayBuffer, which is what Blob accepts.
  return out === image ? encoded : new Blob([out as Uint8Array<ArrayBuffer>], { type: encoded.type });
}
