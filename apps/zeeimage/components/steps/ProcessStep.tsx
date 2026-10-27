'use client';

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { ProcessResult } from '@/lib/processors/strategy';
import { IngestedAsset } from '@/hooks/use-image-pipeline';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import ComparisonViewer from '@/components/shared/ComparisonViewer';
import Button from '@zeetools/ui/components/ui/actions/button';
import Tick from '@/components/motion/tick';
import { FOOTER, SCROLLER, SECTION } from '@/lib/card-classes';
import { formatBytes } from '@/lib/format';
import { describeFailure, failureSummary } from '@/lib/processors/failure';
import AlertIcon from '@zeetools/ui/components/icons/status/alert-icon';
import EyeIcon from '@zeetools/ui/components/icons/media/eye-icon';
import ChevronRightIcon from '@zeetools/ui/components/icons/navigation/chevron-right-icon';

interface ProcessStepProps {
  assets: IngestedAsset[];
  results: ProcessResult[];
  isProcessing: boolean;
  progress: { completed: number; total: number };
  onProceedToExport: () => void;
}

const th = 'whitespace-nowrap sticky top-0 z-10 border-b border-border bg-surface px-3 py-3 text-xs font-normal text-muted';
const td = 'whitespace-nowrap border-b border-border px-3 py-3';
const first = 'pl-5 sm:pl-8';
const last = 'pr-5 sm:pr-8';

/** Step 3, as the card's content: the progress section, then the queue table as the scrolling surface. */
export default function ProcessStep({
  assets,
  results,
  isProcessing,
  progress,
  onProceedToExport,
}: ProcessStepProps) {
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);

  const concurrency =
    typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;

  const resultMap = new Map<string, ProcessResult>();
  results.forEach((r) => {
    resultMap.set(r.originalFile.name, r);
  });

  const failedErrors = results.flatMap((r) => (r.error ? [r.error] : []));
  const succeeded = results.length - failedErrors.length;

  const percentage =
    progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  const inspectedAsset = inspectIndex !== null ? assets[inspectIndex] : null;
  const inspectedResult =
    inspectedAsset ? resultMap.get(inspectedAsset.file.name) : null;

  // Space opens the first finished result (or closes the open one); Esc closes it.
  const firstComparable = assets.findIndex((asset) => {
    const res = resultMap.get(asset.file.name);
    return Boolean(res && !res.error);
  });
  useKeyboardShortcuts({
    onToggleCompare: () => {
      if (inspectIndex !== null) setInspectIndex(null);
      else if (firstComparable >= 0) setInspectIndex(firstComparable);
    },
    onEscape: inspectIndex !== null ? () => setInspectIndex(null) : undefined,
  });

  return (
    <>
      {/* Overall Progress */}
      <section className={`${SECTION} space-y-5`}>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-normal text-foreground">
              {isProcessing
                ? `Processing ${progress.completed} of ${progress.total} Assets...`
                : `Batch Processing Complete (${succeeded}/${assets.length})`}
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              Concurrently executed across {concurrency} Web Worker threads via OffscreenCanvas.
            </p>
            {!isProcessing && failedErrors.length > 0 && (
              <p role="status" className="text-sm leading-relaxed text-danger">
                {failureSummary(failedErrors)}
              </p>
            )}
          </div>

          <span className="font-mono text-sm tabular-nums text-foreground">
            <Tick value={`${percentage}%`} />
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full overflow-hidden bg-border">
          <div
            className="h-full origin-left bg-primary transition-transform duration-300 ease-out"
            style={{ transform: `scaleX(${percentage / 100})` }}
          />
        </div>
      </section>

      {/* Asset Queue Table */}
      <div className={`${SCROLLER} border-t border-border`}>
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              <th className={`${th} ${first}`}>Preview</th>
              <th className={th}>Asset Name</th>
              <th className={th}>Dimensions</th>
              <th className={th}>Original Size</th>
              <th className={th}>Optimized Size</th>
              <th className={th}>Savings</th>
              <th className={`${th} ${last} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => {
              const res = resultMap.get(asset.file.name);
              const hasResult = Boolean(res);
              const isError = res?.error;

              const origSize = asset.size;
              const newSize = res?.processedSize || 0;
              const savings =
                origSize > 0 && newSize > 0
                  ? Math.round(((origSize - newSize) / origSize) * 100)
                  : 0;

              return (
                <tr
                  key={asset.id}
                  className="group cursor-pointer transition-colors duration-200 ease-out hover:bg-surface"
                  onClick={() => hasResult && !isError && setInspectIndex(index)}
                >
                  <td className={`${td} ${first}`}>
                    <div className="flex size-9 items-center justify-center overflow-hidden rounded-control border border-border bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element -- data:/blob: thumbnail of a local file; next/image cannot optimise it in a static export */}
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.file.name}
                        width={36}
                        height={36}
                        decoding="async"
                        className="size-full object-cover"
                      />
                    </div>
                  </td>

                  <td className={`${td} max-w-xs truncate text-foreground`}>
                    {asset.file.name}
                  </td>

                  <td className={`${td} font-mono tabular-nums text-muted`}>
                    {res?.dimensions
                      ? `${res.dimensions.width}×${res.dimensions.height}`
                      : asset.width > 0
                      ? `${asset.width}×${asset.height}`
                      : '—'}
                  </td>

                  <td className={`${td} font-mono tabular-nums text-muted`}>{formatBytes(origSize)}</td>

                  <td className={td}>
                    {hasResult ? (
                      isError ? (
                        <span className="flex items-center gap-1 text-danger">
                          <AlertIcon className="size-3.5" />
                          Failed
                        </span>
                      ) : (
                        <span className="font-mono tabular-nums text-foreground">
                          <Tick value={formatBytes(newSize)} />
                        </span>
                      )
                    ) : (
                      <span className="text-muted italic">Queued...</span>
                    )}
                  </td>

                  <td className={td}>
                    {hasResult && !isError ? (
                      <span className="font-mono tabular-nums text-foreground">
                        <Tick value={savings > 0 ? `-${savings}%` : `+${Math.abs(savings)}%`} />
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  <td className={`${td} ${last} text-right`}>
                    {hasResult && !isError ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectIndex(index);
                        }}
                      >
                        <EyeIcon className="size-3.5" />
                        Compare
                      </Button>
                    ) : isError ? (
                      <span className="text-xs text-muted">{describeFailure(res?.error ?? '')}</span>
                    ) : (
                      <span className="text-xs text-muted">
                        {isProcessing ? 'Processing' : 'Pending'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={`${FOOTER} @min-[34rem]:justify-end`}>
        <Button
          variant="primary"
          className="h-10 px-4"
          onClick={onProceedToExport}
          disabled={isProcessing || succeeded === 0}
        >
          <span>View Export</span>
          <ChevronRightIcon />
        </Button>
      </div>

      {/* Comparison Viewer Modal */}
      <AnimatePresence>
        {inspectedAsset && inspectedResult && (
          <ComparisonViewer
            key={inspectedResult.id}
            originalFile={inspectedAsset.file}
            processedResult={inspectedResult}
            onClose={() => setInspectIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
