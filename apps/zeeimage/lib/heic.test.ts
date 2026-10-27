import { describe, expect, it, vi } from 'vitest';
import { canDecodeHeic, isHeicFile } from './heic';

const heic = new File(['x'], 'photo.heic', { type: 'image/heic' });

describe('canDecodeHeic', () => {
  it('accepts HEIC when the browser can decode it', async () => {
    const close = vi.fn();
    expect(await canDecodeHeic(heic, async () => ({ close }))).toBe(true);
    expect(close).toHaveBeenCalled();
  });

  it('rejects HEIC when the browser cannot decode it', async () => {
    expect(await canDecodeHeic(heic, async () => Promise.reject(new Error('nope')))).toBe(false);
  });

  it('does not probe other formats', async () => {
    const decode = vi.fn();
    expect(await canDecodeHeic(new File(['x'], 'a.png', { type: 'image/png' }), decode)).toBe(true);
    expect(decode).not.toHaveBeenCalled();
  });
});

describe('isHeicFile', () => {
  it('matches by type or extension', () => {
    expect(isHeicFile(new File([''], 'a.HEIF'))).toBe(true);
    expect(isHeicFile(new File([''], 'a', { type: 'image/heif' }))).toBe(true);
    expect(isHeicFile(new File([''], 'a.jpg'))).toBe(false);
  });
});
