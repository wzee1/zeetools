/**
 * Client-Side HEIC/HEIF Decoding Utility.
 * Checks for native browser support (Safari / Apple WebKit) first,
 * with graceful fallback handling.
 */

function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

/**
 * Ensures the image file is decodable. If HEIC and not natively decodable,
 * attempts conversion to a standard PNG/JPEG blob.
 */
export async function normalizeImageFile(file: File): Promise<{ file: File; converted: boolean }> {
  if (!isHeicFile(file)) {
    return { file, converted: false };
  }

  // 1. Check if browser can decode it natively
  try {
    const testBitmap = await createImageBitmap(file);
    testBitmap.close();
    return { file, converted: false };
  } catch {
    // Native decode failed, try client-side converter
  }

  // 2. Try window.heic2any if loaded or dynamically import
  try {
    if (typeof window !== 'undefined') {
      const anyWindow = window as unknown as {
        heic2any?: (opts: { blob: Blob; toType: string; quality: number }) => Promise<Blob | Blob[]>;
      };
      if (typeof anyWindow.heic2any === 'function') {
        const resultBlob = await anyWindow.heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.92,
        });
        const convertedBlob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
        const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
        const convertedFile = new File([convertedBlob], newName, { type: 'image/jpeg' });
        return { file: convertedFile, converted: true };
      }
    }
  } catch (err) {
    console.warn('HEIC fallback conversion error:', err);
  }

  // Return original file; pipeline will attempt standard loading
  return { file, converted: false };
}
