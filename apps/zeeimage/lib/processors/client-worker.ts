import {
  ImageProcessorStrategy,
  ProcessOptions,
  ProcessResult,
} from './strategy';
import { computeTargetDimensions } from './dimensions';
import { FALLBACK_ENCODE, resolveEncodeParams } from './encode';
import { WorkerInputMessage, WorkerOutputMessage } from '../workers/image-resizer.worker';

export function getFileExtension(format: string): string {
  switch (format) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/avif':
      return 'avif';
    case 'image/x-icon':
      return 'ico';
    default:
      return 'webp';
  }
}

export function formatOutputFilename(
  originalName: string,
  template: string,
  width: number,
  height: number,
  format: string
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const ext = getFileExtension(format);

  return template
    .replace(/\[name\]/g, baseName)
    .replace(/\[width\]/g, String(width))
    .replace(/\[height\]/g, String(height))
    .replace(/\[ext\]/g, ext);
}

/**
 * Extension of the bytes actually produced. The canvas silently falls back to
 * another format when it cannot encode the requested one (e.g. image/x-icon),
 * so the blob type wins over the requested format.
 */
export function resolveOutputFormat(blob: Blob, requestedFormat: string): string {
  return blob.type || requestedFormat;
}

function createWorker(): Worker | null {
  if (typeof window === 'undefined') return null;
  try {
    return new Worker(new URL('../workers/image-resizer.worker.ts', import.meta.url), {
      type: 'module',
    });
  } catch (err) {
    console.warn('Worker initialization failed, fallback will be used:', err);
    return null;
  }
}

function createId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Sends one file to a (reusable) worker and resolves with its result. */
function runInWorker(worker: Worker, file: File, options: ProcessOptions, id: string): Promise<ProcessResult> {
  return new Promise<ProcessResult>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
      worker.onmessage = null;
      worker.onerror = null;
      const data = e.data;
      if (data.success) {
        resolve({
          id: data.id,
          originalFile: file,
          processedBlob: data.processedBlob,
          originalSize: file.size,
          processedSize: data.processedSize,
          dimensions: data.dimensions,
          originalDimensions: data.originalDimensions,
          durationMs: data.durationMs,
        });
      } else {
        reject(new WorkerProcessingError(data.error));
      }
    };
    worker.onerror = (event) => {
      worker.onmessage = null;
      worker.onerror = null;
      reject(new WorkerCrashError(event.message));
    };
    const msg: WorkerInputMessage = { id, file, options };
    worker.postMessage(msg);
  });
}

/** The worker ran but reported a processing error for this file. */
class WorkerProcessingError extends Error {}
/** The worker itself failed (load/crash); the main thread should retry. */
class WorkerCrashError extends Error {}

async function processInMainThread(file: File, options: ProcessOptions, id: string): Promise<ProcessResult> {
  const startTime = performance.now();
  const bitmap = await createImageBitmap(file);
  const origWidth = bitmap.width;
  const origHeight = bitmap.height;
  const { width: targetWidth, height: targetHeight } = computeTargetDimensions(
    origWidth,
    origHeight,
    options
  );

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), type, quality);
    });

  const { type, quality } = resolveEncodeParams(options);
  let processedBlob: Blob;
  try {
    processedBlob = await toBlob(type, quality);
  } catch {
    processedBlob = await toBlob(FALLBACK_ENCODE.type, FALLBACK_ENCODE.quality);
  }

  return {
    id,
    originalFile: file,
    processedBlob,
    originalSize: file.size,
    processedSize: processedBlob.size,
    dimensions: { width: targetWidth, height: targetHeight },
    originalDimensions: { width: origWidth, height: origHeight },
    durationMs: Math.round(performance.now() - startTime),
  };
}

/**
 * Client-side processor. `processBatch` runs one reusable worker per
 * concurrency lane; if a worker cannot start or crashes, the file is
 * processed on the main thread instead.
 */
export class ClientWorkerProcessor implements ImageProcessorStrategy {
  readonly name = 'Client Web Worker (OffscreenCanvas)';

  private maxConcurrency: number = 4;

  constructor() {
    if (typeof window !== 'undefined') {
      this.maxConcurrency = Math.max(2, Math.min(16, navigator.hardwareConcurrency || 4));
    }
  }

  /**
   * Processes one file with the given worker (or the main thread when there is
   * none). Returns the worker to keep using, or null if it was terminated.
   */
  private async run(
    worker: Worker | null,
    file: File,
    options: ProcessOptions
  ): Promise<{ result: ProcessResult; worker: Worker | null }> {
    const id = createId();
    if (!worker) {
      return { result: await processInMainThread(file, options, id), worker: null };
    }
    try {
      return { result: await runInWorker(worker, file, options, id), worker };
    } catch (err) {
      if (err instanceof WorkerCrashError) {
        worker.terminate();
        return { result: await processInMainThread(file, options, id), worker: null };
      }
      throw err;
    }
  }

  async process(file: File, options: ProcessOptions): Promise<ProcessResult> {
    const worker = createWorker();
    try {
      return (await this.run(worker, file, options)).result;
    } finally {
      worker?.terminate();
    }
  }

  async processBatch(
    files: File[],
    options: ProcessOptions,
    onProgress: (completed: number, total: number, result?: ProcessResult) => void
  ): Promise<ProcessResult[]> {
    const total = files.length;
    if (total === 0) return [];

    const results: ProcessResult[] = [];
    let completed = 0;
    let nextIndex = 0;

    const laneCount = Math.min(this.maxConcurrency, total);

    const lanes = Array.from({ length: laneCount }, async () => {
      let worker = createWorker();
      try {
        while (nextIndex < total) {
          const currentIndex = nextIndex++;
          const file = files[currentIndex];
          let result: ProcessResult;
          try {
            const outcome = await this.run(worker, file, options);
            result = outcome.result;
            worker = outcome.worker;
          } catch (err: unknown) {
            result = {
              id: `err_${currentIndex}`,
              originalFile: file,
              processedBlob: new Blob(),
              originalSize: file.size,
              processedSize: 0,
              dimensions: { width: 0, height: 0 },
              error: (err as Error)?.message || 'Processing failed',
            };
          }
          results[currentIndex] = result;
          completed++;
          onProgress(completed, total, result);
        }
      } finally {
        worker?.terminate();
      }
    });

    await Promise.all(lanes);
    return results;
  }
}
