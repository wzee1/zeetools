import { describe, expect, it } from 'vitest';
import { heicUnsupportedMessage, skippedFilesMessage } from './ingest-messages';
import { pluralize } from './format';
import { describeFailure, failureSummary } from './processors/failure';

describe('copy helpers', () => {
  it('pluralises counts', () => {
    expect(pluralize(1, 'asset')).toBe('1 asset');
    expect(pluralize(0, 'asset')).toBe('0 assets');
    expect(pluralize(2, 'asset')).toBe('2 assets');
  });

  it('words the skipped-file message for one and many', () => {
    expect(skippedFilesMessage(1)).toBe("Skipped 1 file that isn't a supported image.");
    expect(skippedFilesMessage(3)).toBe("Skipped 3 files that aren't supported images.");
  });

  it('words the HEIC message for one and many', () => {
    expect(heicUnsupportedMessage(1)).toContain("HEIC isn't supported in this browser");
    expect(heicUnsupportedMessage(2)).toMatch(/^2 HEIC files were skipped/);
  });

  it('describes failures', () => {
    expect(describeFailure('The source image could not be decoded.')).toBe("Couldn't read this image");
    expect(describeFailure('Canvas export failed')).toBe('Canvas export failed');
    expect(failureSummary(['The source image could not be decoded.', 'The source image could not be decoded.'])).toBe(
      "2 failed: Couldn't read this image"
    );
  });
});
