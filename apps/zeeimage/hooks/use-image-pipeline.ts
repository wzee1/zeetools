'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  ProcessOptions,
  ProcessResult,
  ImageProcessorStrategy,
} from '../lib/processors/strategy';
import { ClientWorkerProcessor } from '../lib/processors/client-worker';
import { DEFAULT_PROCESS_OPTIONS } from '../lib/presets';
import { canDecodeHeic } from '../lib/heic';
import { isSvgFile, readSvgSize } from '../lib/svg';
import { heicUnsupportedMessage, skippedFilesMessage } from '../lib/ingest-messages';

export interface IngestedAsset {
  id: string;
  file: File;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

/** Only blob: URLs hold memory; data: thumbnails need no cleanup. */
function revokeThumbnail(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
}

/** How many files are decoded at once while ingesting: enough to keep the decoder busy, few enough to stay responsive. */
const INGEST_CONCURRENCY = 4;

/** Reads one file's size and makes its thumbnail. `'heic'` when the browser cannot decode it, `null` on failure. */
async function ingestFile(file: File): Promise<IngestedAsset | 'heic' | null> {
  try {
    if (!(await canDecodeHeic(file))) return 'heic';
    let width = 0;
    let height = 0;
    let thumbnailUrl = '';

    if (isSvgFile(file)) {
      // createImageBitmap cannot decode SVG: read its size from the markup and show it as it is.
      ({ width, height } = await readSvgSize(file));
      thumbnailUrl = URL.createObjectURL(file);
    } else {
      try {
        const bitmap = await createImageBitmap(file);
        width = bitmap.width;
        height = bitmap.height;

        // Create small thumbnail for memory efficiency
        const thumbMax = 160;
        const thumbRatio = Math.min(thumbMax / width, thumbMax / height, 1);
        const tw = Math.max(1, Math.round(width * thumbRatio));
        const th = Math.max(1, Math.round(height * thumbRatio));

        const canvas = document.createElement('canvas');
        canvas.width = tw;
        canvas.height = th;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, tw, th);
          thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        }
        bitmap.close();
      } catch {
        // Fallback to object URL if bitmap creation fails
        thumbnailUrl = URL.createObjectURL(file);
      }
    }

    return {
      id: `ast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      file,
      thumbnailUrl,
      width,
      height,
      size: file.size,
      type: file.type || 'image/*',
    };
  } catch (err) {
    console.error('Failed to ingest file:', file.name, err);
    return null;
  }
}

export function useImagePipeline(processor?: ImageProcessorStrategy) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [assets, setAssets] = useState<IngestedAsset[]>([]);
  const [options, setOptions] = useState<ProcessOptions>(DEFAULT_PROCESS_OPTIONS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0,
  });
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const processorRef = useRef<ImageProcessorStrategy>(processor || new ClientWorkerProcessor());

  const [ingestProgress, setIngestProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0,
  });
  // Counts across overlapping drops, so a second drop mid-ingest extends the same bar instead of resetting it.
  const ingestCounter = useRef({ completed: 0, total: 0 });
  // Bumped by "Clear All", so files still decoding from an earlier drop do not land in the emptied queue.
  const ingestGeneration = useRef(0);

  const addFiles = useCallback(async (incomingFiles: File[]) => {
    const validExtensions = /\.(jpe?g|png|webp|gif|svg|bmp|ico|heic|heif)$/i;
    const filteredFiles = incomingFiles.filter(
      (f) => validExtensions.test(f.name) || f.type.startsWith('image/')
    );

    const skipped = incomingFiles.length - filteredFiles.length;
    if (skipped > 0) toast.error(skippedFilesMessage(skipped));
    if (filteredFiles.length === 0) return;

    const generation = ingestGeneration.current;
    const counter = ingestCounter.current;
    counter.total += filteredFiles.length;
    setIngestProgress({ ...counter });

    // Decoded out of order by a few at a time, but added to the queue in drop order as soon as the next one is ready.
    const slots: (IngestedAsset | 'heic' | null | undefined)[] = new Array(filteredFiles.length);
    let flushed = 0;
    let heicRejected = 0;
    const flush = () => {
      const ready: IngestedAsset[] = [];
      while (flushed < slots.length && slots[flushed] !== undefined) {
        const slot = slots[flushed++];
        if (slot === 'heic') heicRejected++;
        else if (slot) ready.push(slot);
      }
      if (ready.length === 0) return;
      if (generation !== ingestGeneration.current) ready.forEach((a) => revokeThumbnail(a.thumbnailUrl));
      else setAssets((prev) => [...prev, ...ready]);
    };

    let next = 0;
    const work = async () => {
      while (next < filteredFiles.length) {
        const index = next++;
        slots[index] = await ingestFile(filteredFiles[index]);
        counter.completed++;
        setIngestProgress({ ...counter });
        flush();
      }
    };
    await Promise.all(Array.from({ length: Math.min(INGEST_CONCURRENCY, filteredFiles.length) }, work));

    if (heicRejected > 0 && generation === ingestGeneration.current) toast.error(heicUnsupportedMessage(heicRejected));

    // The bar empties once every drop in flight is done. The queue stays in view; "Configure Batch" (or ⌘↵) moves on.
    if (counter.completed >= counter.total) {
      counter.completed = 0;
      counter.total = 0;
      setIngestProgress({ completed: 0, total: 0 });
    }
  }, []);

  const removeAsset = useCallback(
    (id: string) => {
      const removed = assets.find((a) => a.id === id);
      if (removed) revokeThumbnail(removed.thumbnailUrl);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    },
    [assets]
  );

  const clearAssets = useCallback(() => {
    assets.forEach((a) => revokeThumbnail(a.thumbnailUrl));
    ingestGeneration.current++;
    setAssets([]);
    setResults([]);
    setActiveStep(1);
  }, [assets]);

  const updateOptions = useCallback((partial: Partial<ProcessOptions>) => {
    setOptions((prev) => ({ ...prev, ...partial }));
  }, []);

  const startBatchProcessing = useCallback(async () => {
    if (assets.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setActiveStep(3);
    setProgress({ completed: 0, total: assets.length });
    setResults([]);

    const files = assets.map((a) => a.file);
    const activeProcessor = processorRef.current;

    try {
      const batchResults = await activeProcessor.processBatch(
        files,
        options,
        (completed, total, latestResult) => {
          setProgress({ completed, total });
          if (latestResult) {
            setResults((prev) => [...prev, latestResult]);
          }
        }
      );

      // The results table stays in view; "View Export" moves on.
      setResults(batchResults);
      setIsProcessing(false);
    } catch (err) {
      console.error('Batch processing error:', err);
      setIsProcessing(false);
    }
  }, [assets, isProcessing, options]);

  return {
    activeStep,
    setActiveStep,
    assets,
    addFiles,
    ingestProgress,
    removeAsset,
    clearAssets,
    options,
    updateOptions,
    isProcessing,
    progress,
    results,
    selectedAssetId,
    setSelectedAssetId,
    startBatchProcessing,
  };
}
