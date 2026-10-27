import { pluralize } from '@/lib/format';

export const HEIC_UNSUPPORTED =
  "HEIC isn't supported in this browser. Open it in Safari, or convert it to JPEG first.";

/** The message for files skipped at ingest because they are not images. */
export function skippedFilesMessage(count: number): string {
  return count === 1
    ? "Skipped 1 file that isn't a supported image."
    : `Skipped ${pluralize(count, 'file')} that aren't supported images.`;
}

/** The message for HEIC/HEIF files this browser cannot decode. */
export function heicUnsupportedMessage(count: number): string {
  return count === 1 ? HEIC_UNSUPPORTED : `${count} HEIC files were skipped. ${HEIC_UNSUPPORTED}`;
}
