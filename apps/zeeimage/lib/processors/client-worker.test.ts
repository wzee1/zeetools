import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ClientWorkerProcessor,
  formatOutputFilename,
  resolveOutputFormat,
} from './client-worker';
import type { ProcessOptions } from './strategy';
import type { WorkerInputMessage } from '../workers/image-resizer.worker';

const OPTIONS: ProcessOptions = {
  format: 'image/webp',
  quality: 80,
  stripMetadata: true,
  filenameTemplate: '[name].[ext]',
};

class FakeWorker {
  static instances: FakeWorker[] = [];
  static mode: 'ok' | 'crash' | 'error' = 'ok';
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;
  terminated = false;
  handled = 0;

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(msg: WorkerInputMessage) {
    this.handled++;
    queueMicrotask(() => {
      if (FakeWorker.mode === 'crash') {
        this.onerror?.({ message: 'boom' } as ErrorEvent);
      } else if (FakeWorker.mode === 'error') {
        this.onmessage?.({ data: { id: msg.id, success: false, error: 'bad image' } } as MessageEvent);
      } else {
        const blob = new Blob(['x'], { type: 'image/webp' });
        this.onmessage?.({
          data: {
            id: msg.id,
            success: true,
            processedBlob: blob,
            dimensions: { width: 1, height: 1 },
            originalDimensions: { width: 2, height: 2 },
            processedSize: blob.size,
            durationMs: 1,
          },
        } as MessageEvent);
      }
    });
  }

  terminate() {
    this.terminated = true;
  }
}

const files = (n: number) => Array.from({ length: n }, (_, i) => new File(['abc'], `f${i}.png`, { type: 'image/png' }));

beforeEach(() => {
  FakeWorker.instances = [];
  FakeWorker.mode = 'ok';
  vi.stubGlobal('Worker', FakeWorker);
  vi.stubGlobal('navigator', { hardwareConcurrency: 2 });
});

afterEach(() => vi.unstubAllGlobals());

describe('ClientWorkerProcessor.processBatch', () => {
  it('reuses one worker per lane and terminates them all at the end', async () => {
    const progress = vi.fn();
    const results = await new ClientWorkerProcessor().processBatch(files(6), OPTIONS, progress);

    expect(results).toHaveLength(6);
    expect(results.every((r) => !r.error)).toBe(true);
    expect(FakeWorker.instances).toHaveLength(2);
    expect(FakeWorker.instances.reduce((n, w) => n + w.handled, 0)).toBe(6);
    expect(FakeWorker.instances.every((w) => w.terminated)).toBe(true);
    expect(progress).toHaveBeenLastCalledWith(6, 6, expect.anything());
  });

  it('keeps result order and records per-file worker errors without stopping the batch', async () => {
    FakeWorker.mode = 'error';
    const results = await new ClientWorkerProcessor().processBatch(files(3), OPTIONS, () => {});
    expect(results.map((r) => r.originalFile.name)).toEqual(['f0.png', 'f1.png', 'f2.png']);
    expect(results.every((r) => r.error === 'bad image')).toBe(true);
    expect(FakeWorker.instances.every((w) => w.terminated)).toBe(true);
  });

  it('falls back to the main thread when a worker crashes', async () => {
    FakeWorker.mode = 'crash';
    // jsdom has no createImageBitmap, so the main-thread path reports an error for each file.
    const results = await new ClientWorkerProcessor().processBatch(files(2), OPTIONS, () => {});
    expect(results).toHaveLength(2);
    expect(results.every((r) => typeof r.error === 'string')).toBe(true);
    expect(FakeWorker.instances.every((w) => w.terminated)).toBe(true);
  });

  it('returns immediately for an empty batch', async () => {
    expect(await new ClientWorkerProcessor().processBatch([], OPTIONS, () => {})).toEqual([]);
    expect(FakeWorker.instances).toHaveLength(0);
  });
});

describe('output naming from the produced bytes', () => {
  it('prefers the blob type over the requested format', () => {
    const webpBlob = new Blob(['x'], { type: 'image/webp' });
    expect(resolveOutputFormat(webpBlob, 'image/x-icon')).toBe('image/webp');
    expect(resolveOutputFormat(new Blob(['x']), 'image/png')).toBe('image/png');
  });

  it('names an ICO request that produced WebP bytes as .webp', () => {
    const blob = new Blob(['x'], { type: 'image/webp' });
    expect(formatOutputFilename('logo.png', '[name]-[width]x[height].[ext]', 32, 32, resolveOutputFormat(blob, 'image/x-icon'))).toBe(
      'logo-32x32.webp'
    );
  });
});
