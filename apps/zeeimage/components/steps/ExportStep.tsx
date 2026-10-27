'use client';

import { useCallback, useMemo, useState } from 'react';
import { ProcessResult, ProcessOptions } from '@/lib/processors/strategy';
import { formatOutputFilename, resolveOutputFormat } from '@/lib/processors/client-worker';
import { useZipExporter } from '@/hooks/use-zip-exporter';
import { downloadBlob } from '@zeetools/ui/lib/export';
import Tick from '@/components/motion/tick';
import { FOOTER, SCROLLER, SECTION } from '@/lib/card-classes';
import { formatBytes, pluralize } from '@/lib/format';
import Button from '@zeetools/ui/components/ui/actions/button';
import ResultThumb from './ResultThumb';
import Kbd from '@zeetools/ui/components/ui/display/kbd';
import DownloadIcon from '@zeetools/ui/components/icons/actions/download-icon';
import RefreshIcon from '@zeetools/ui/components/icons/actions/refresh-icon';
import CheckIcon from '@zeetools/ui/components/icons/status/check-icon';

interface ExportStepProps {
  results: ProcessResult[];
  options: ProcessOptions;
  onReset: () => void;
}

/** Step 4, as the card's content: the summary, the individual downloads as hairline rows, and the ZIP action. */
export default function ExportStep({ results, options, onReset }: ExportStepProps) {
  const { isExporting, exportProgress, exportZip } = useZipExporter();
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  const successfulResults = useMemo(
    () => results.filter((r) => !r.error && r.processedBlob.size > 0),
    [results]
  );

  const totalOrigSize = successfulResults.reduce((sum, r) => sum + r.originalSize, 0);
  const totalNewSize = successfulResults.reduce((sum, r) => sum + r.processedSize, 0);
  const totalSavedBytes = Math.max(0, totalOrigSize - totalNewSize);
  const overallSavingsPct =
    totalOrigSize > 0 ? Math.round((totalSavedBytes / totalOrigSize) * 100) : 0;

  const handleDownloadSingle = useCallback(
    (res: ProcessResult) => {
      const filename = formatOutputFilename(
        res.originalFile.name,
        options.filenameTemplate,
        res.dimensions.width,
        res.dimensions.height,
        resolveOutputFormat(res.processedBlob, options.format)
      );
      downloadBlob(res.processedBlob, filename);
      setDownloadedIds((prev) => new Set(prev).add(res.id));
    },
    [options]
  );

  const handleDownloadAllZip = () => {
    exportZip(successfulResults, options, `zeeimage-optimized-${successfulResults.length}-files.zip`);
  };

  return (
    <>
      {/* Summary */}
      <section className={`${SECTION} flex flex-col gap-5 @2xl:flex-row @2xl:items-center @2xl:justify-between`}>
        <div className="flex items-start gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-control border border-primary-text/40 bg-success-surface text-primary-text">
            <CheckIcon className="size-4" />
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-normal text-foreground">Batch Successfully Optimized</h3>
            <p className="text-sm leading-relaxed text-muted">
              {pluralize(successfulResults.length, 'asset')} processed with zero server uploads and zero privacy leaks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs tabular-nums text-muted">
          <span>
            Original <span className="text-foreground">{formatBytes(totalOrigSize)}</span>
          </span>
          <span aria-hidden>→</span>
          <span>
            Optimized <span className="text-foreground"><Tick value={formatBytes(totalNewSize)} /></span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="size-2.5 rounded-full border-2 border-primary-text" />
            <Tick value={`-${overallSavingsPct}% Saved (${formatBytes(totalSavedBytes)})`} />
          </span>
        </div>
      </section>

      {/* Individual downloads */}
      <section className="flex flex-col border-t border-border shell:min-h-0 shell:flex-1">
        <h4 className="px-5 pt-6 pb-4 text-base font-normal text-foreground sm:px-8">
          Individual Asset Downloads
        </h4>

        <div className={SCROLLER}>
          {successfulResults.map((res) => {
            const outputName = formatOutputFilename(
              res.originalFile.name,
              options.filenameTemplate,
              res.dimensions.width,
              res.dimensions.height,
              resolveOutputFormat(res.processedBlob, options.format)
            );

            const isDownloaded = downloadedIds.has(res.id);
            const savings =
              res.originalSize > 0
                ? Math.round(((res.originalSize - res.processedSize) / res.originalSize) * 100)
                : 0;

            return (
              <div
                key={res.id}
                className="flex items-center justify-between gap-4 border-t border-border px-5 py-3 transition-colors duration-200 ease-out hover:bg-surface sm:px-8"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-background">
                    <ResultThumb blob={res.processedBlob} alt={outputName} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground" title={outputName}>
                      {outputName}
                    </p>
                    <p className="mt-0.5 font-mono text-xs tabular-nums text-muted">
                      {formatBytes(res.processedSize)} ({savings > 0 ? `-${savings}` : `+${Math.abs(savings)}`}%)
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => handleDownloadSingle(res)}
                  className="shrink-0"
                >
                  {isDownloaded ? <CheckIcon className="text-success" /> : <DownloadIcon />}
                  <span>{isDownloaded ? 'Saved' : 'Save'}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      <div className={FOOTER}>
        <div className="flex items-center gap-2 text-xs text-muted @max-[40rem]:hidden">
          <span>Press</span>
          <Kbd hotkey="mod+s" />
          <span>to download ZIP archive</span>
        </div>

        <div className="flex flex-col-reverse gap-3 @min-[34rem]:flex-row @min-[34rem]:items-center">
          <Button variant="secondary" className="h-10 px-4" onClick={onReset}>
            <RefreshIcon />
            <span>Start New Batch</span>
          </Button>

          <Button
            variant="primary"
            className="h-10 px-4"
            onClick={handleDownloadAllZip}
            disabled={isExporting || successfulResults.length === 0}
          >
            <DownloadIcon />
            <span>
              {isExporting
                ? `Packaging ZIP (${exportProgress}%)...`
                : `Download All as ZIP (${successfulResults.length})`}
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
