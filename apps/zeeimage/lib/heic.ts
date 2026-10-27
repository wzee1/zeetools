/**
 * HEIC/HEIF support. There is no converter here on purpose: a HEIC/HEIF file is accepted only when the
 * browser can decode it natively (Safari), and is turned away at ingest otherwise.
 */

export function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

type Decoder = (file: File) => Promise<{ close: () => void }>;

/** True when the browser can decode this file itself. Anything that is not HEIC/HEIF is not this module's concern. */
export async function canDecodeHeic(
  file: File,
  decode: Decoder = (f) => createImageBitmap(f)
): Promise<boolean> {
  if (!isHeicFile(file)) return true;
  try {
    (await decode(file)).close();
    return true;
  } catch {
    return false;
  }
}
