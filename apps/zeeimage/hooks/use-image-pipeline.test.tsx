import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useImagePipeline } from '@/hooks/use-image-pipeline';

afterEach(() => vi.unstubAllGlobals());

async function ingestTwo() {
  // jsdom cannot decode images, so ingestion takes the object-URL thumbnail path (as SVGs do).
  let n = 0;
  const createObjectURL = vi.fn(() => `blob:thumb-${n++}`);
  const revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }));

  const hook = renderHook(() => useImagePipeline());
  await act(async () => {
    await hook.result.current.addFiles([
      new File(['<svg/>'], 'a.svg', { type: 'image/svg+xml' }),
      new File(['<svg/>'], 'b.svg', { type: 'image/svg+xml' }),
    ]);
  });
  return { hook, revokeObjectURL };
}

describe('useImagePipeline steps', () => {
  it('keeps the queue in view after files are added', async () => {
    const { hook } = await ingestTwo();
    expect(hook.result.current.activeStep).toBe(1);
  });
});

describe('useImagePipeline thumbnails', () => {
  it('revokes a blob: thumbnail when its asset is removed', async () => {
    const { hook, revokeObjectURL } = await ingestTwo();
    expect(hook.result.current.assets).toHaveLength(2);

    act(() => hook.result.current.removeAsset(hook.result.current.assets[0].id));

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:thumb-0');
    expect(hook.result.current.assets).toHaveLength(1);
  });

  it('revokes every blob: thumbnail on clear', async () => {
    const { hook, revokeObjectURL } = await ingestTwo();
    act(() => hook.result.current.clearAssets());
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:thumb-0');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:thumb-1');
    expect(hook.result.current.assets).toHaveLength(0);
  });
});
