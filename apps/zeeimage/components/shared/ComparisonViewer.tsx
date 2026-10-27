'use client';

import { useState, useRef, useCallback } from 'react';
import BlobImage from '@/components/shared/BlobImage';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';
import CloseIcon from '@zeetools/ui/components/icons/actions/close-icon';
import Kbd from '@zeetools/ui/components/ui/display/kbd';
import { formatBytes } from '@/lib/format';
import { ProcessResult } from '@/lib/processors/strategy';

interface ComparisonViewerProps {
  originalFile: File;
  processedResult: ProcessResult;
  onClose: () => void;
}

export default function ComparisonViewer({
  originalFile,
  processedResult,
  onClose,
}: ComparisonViewerProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);


  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const origSize = originalFile.size;
  const newSize = processedResult.processedSize;
  const diffPercent = origSize > 0 ? Math.round(((origSize - newSize) / origSize) * 100) : 0;

  // Portaled to the body: the card around the caller is a layout container, which would trap a fixed overlay.
  return createPortal(
    // The caller's AnimatePresence keeps this mounted while the backdrop and panel exit.
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-panel border border-border glass"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-normal text-foreground truncate max-w-sm">
              {originalFile.name}
            </h3>
            <div className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted">
              <span>
                {formatBytes(origSize)} → {formatBytes(newSize)}
              </span>
              <span className="text-foreground">
                {diffPercent > 0 ? `-${diffPercent}% Saved` : `+${Math.abs(diffPercent)}%`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted">
              <span>Press</span>
              <Kbd hotkey="esc" />
              <span>to close</span>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-control p-1 text-muted hover:bg-surface hover:text-foreground transition-colors ease-out"
              aria-label="Close Comparison"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
        </div>

        {/* Interactive Split Canvas */}
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          className="relative flex-1 select-none overflow-hidden cursor-ew-resize flex items-center justify-center bg-surface p-6"
        >
          {/* Processed Layer (Background / Right) */}
          <div className="relative max-h-full max-w-full">
            <BlobImage
              blob={processedResult.processedBlob}
              alt="Processed"
              className="max-h-[65vh] max-w-full object-contain pointer-events-none rounded-control"
            />

            {/* Original Layer (Clipped / Left) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <BlobImage
                blob={originalFile}
                alt="Original"
                className="max-h-[65vh] max-w-full object-contain pointer-events-none rounded-control"
              />
            </div>

            {/* Slider Line & Handle */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.6)] pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-control border border-border-strong bg-surface-raised shadow-md text-[10px] font-semibold text-foreground">
                ◀▶
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-3 left-3 z-20 rounded-control bg-black/60 px-2 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur">
              Original ({formatBytes(origSize)})
            </div>
            <div className="absolute bottom-3 right-3 z-20 rounded-control bg-black/60 px-2 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur">
              Optimized ({formatBytes(newSize)})
            </div>
          </div>
        </div>

        {/* Footer Guide */}
        <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-xs text-muted bg-surface/40">
          <span>Drag the divider horizontally to inspect compression details & sharpness.</span>
          <span className="tabular-nums">Position: {sliderPosition}%</span>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
