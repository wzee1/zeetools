'use client';

import { useState, useCallback } from 'react';
import { ProcessResult, ProcessOptions } from '../lib/processors/strategy';
import { formatOutputFilename, resolveOutputFormat, uniqueFilenames } from '../lib/processors/client-worker';
import { createZipArchive, ZipEntry } from '../lib/zip';
import { downloadBlob } from '@zeetools/ui/lib/export';

export function useZipExporter() {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const exportZip = useCallback(
    async (
      results: ProcessResult[],
      options: ProcessOptions,
      zipFilename: string = 'zeeimage-bundle.zip'
    ) => {
      if (results.length === 0 || isExporting) return;

      setIsExporting(true);
      setExportProgress(0);

      try {
        const done = results.filter((res) => !res.error && res.processedBlob.size > 0);
        const names = uniqueFilenames(
          done.map((res) =>
            formatOutputFilename(
              res.originalFile.name,
              options.filenameTemplate,
              res.dimensions.width,
              res.dimensions.height,
              resolveOutputFormat(res.processedBlob, options.format)
            )
          )
        );
        const entries: ZipEntry[] = done.map((res, i) => ({ name: names[i], data: res.processedBlob }));

        const zipBlob = await createZipArchive(entries, (processed, total) => {
          setExportProgress(Math.round((processed / total) * 100));
        });

        downloadBlob(zipBlob, zipFilename);
      } catch (err) {
        console.error('ZIP packaging failed:', err);
      } finally {
        setIsExporting(false);
      }
    },
    [isExporting]
  );

  return {
    isExporting,
    exportProgress,
    exportZip,
  };
}
