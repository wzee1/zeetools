import { ProcessOptions } from '../processors/strategy';
import { computeTargetDimensions } from '../processors/dimensions';
import { FALLBACK_ENCODE, needsFallback, resolveEncodeParams } from '../processors/encode';

export interface WorkerInputMessage {
  id: string;
  file: File;
  options: ProcessOptions;
}

export interface WorkerSuccessMessage {
  id: string;
  success: true;
  processedBlob: Blob;
  dimensions: { width: number; height: number };
  originalDimensions: { width: number; height: number };
  processedSize: number;
  durationMs: number;
}

export interface WorkerErrorMessage {
  id: string;
  success: false;
  error: string;
}

export type WorkerOutputMessage = WorkerSuccessMessage | WorkerErrorMessage;

self.onmessage = async (e: MessageEvent<WorkerInputMessage>) => {
  const startTime = performance.now();
  const { id, file, options } = e.data;

  try {
    const bitmap = await createImageBitmap(file);
    const origWidth = bitmap.width;
    const origHeight = bitmap.height;

    const { width: targetWidth, height: targetHeight } = computeTargetDimensions(
      origWidth,
      origHeight,
      options
    );

    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get OffscreenCanvas 2D context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();

    const { type, quality } = resolveEncodeParams(options);

    let processedBlob: Blob;
    try {
      processedBlob = await canvas.convertToBlob({ type, quality });
    } catch {
      processedBlob = await canvas.convertToBlob(FALLBACK_ENCODE);
    }
    if (needsFallback(processedBlob, type)) {
      processedBlob = await canvas.convertToBlob(FALLBACK_ENCODE);
    }

    const durationMs = Math.round(performance.now() - startTime);

    const response: WorkerSuccessMessage = {
      id,
      success: true,
      processedBlob,
      dimensions: { width: targetWidth, height: targetHeight },
      originalDimensions: { width: origWidth, height: origHeight },
      processedSize: processedBlob.size,
      durationMs,
    };

    self.postMessage(response);
  } catch (err: unknown) {
    const errorResponse: WorkerErrorMessage = {
      id,
      success: false,
      error: (err as Error)?.message || 'Image processing failed in worker',
    };
    self.postMessage(errorResponse);
  }
};
