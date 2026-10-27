export type ImageFormat =
  | 'image/webp'
  | 'image/jpeg'
  | 'image/png'
  | 'image/x-icon'
  | 'image/avif';

export type ScaleMode = 'percentage' | 'fit-width' | 'fit-height' | 'exact';

export interface ProcessOptions {
  width?: number;
  height?: number;
  scale?: number; // e.g. 0.5, 0.75, 1.0
  scaleMode?: ScaleMode;
  maintainAspectRatio?: boolean;
  format: ImageFormat;
  quality: number; // 1 to 100
  lossless?: boolean;
  stripMetadata: boolean;
  filenameTemplate: string;
}

export interface ProcessResult {
  id: string;
  originalFile: File;
  processedBlob: Blob;
  originalSize: number;
  processedSize: number;
  dimensions: { width: number; height: number };
  originalDimensions?: { width: number; height: number };
  durationMs?: number;
  error?: string;
}

export interface ImageProcessorStrategy {
  readonly name: string;
  process(file: File, options: ProcessOptions): Promise<ProcessResult>;
  processBatch(
    files: File[],
    options: ProcessOptions,
    onProgress: (completed: number, total: number, result?: ProcessResult) => void
  ): Promise<ProcessResult[]>;
}
