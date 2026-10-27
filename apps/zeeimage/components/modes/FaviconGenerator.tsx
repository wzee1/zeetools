'use client';

import { useState } from 'react';
import BlobImage from '@/components/shared/BlobImage';
import { generateFaviconPackage, FaviconPackageResult } from '@/lib/ico';
import { createZipArchive } from '@/lib/zip';
import { buildFaviconBundle, type FaviconTarget } from '@/lib/favicon-targets';
import { downloadBlob } from '@zeetools/ui/lib/export';
import Dropzone from '@/components/zee-ui/dropzone';
import Button from '@zeetools/ui/components/ui/actions/button';
import { Card } from '@zeetools/ui/components/ui/display/card';
import PageHeader from '@zeetools/ui/components/brand/page-header';
import DownloadIcon from '@zeetools/ui/components/icons/actions/download-icon';
import CopyButton from '@zeetools/ui/components/ui/actions/copy-button';
import Segmented from '@zeetools/ui/components/ui/navigation/segmented';
import BrowserTabPreview from '@/components/modes/BrowserTabPreview';
import RefreshIcon from '@zeetools/ui/components/icons/actions/refresh-icon';
import Stagger from '@zeetools/ui/components/motion/stagger';
import StaggerItem from '@zeetools/ui/components/motion/stagger-item';
import { CARD, FOOTER, SECTION, BODY } from '@/lib/card-classes';
import { formatBytes } from '@/lib/format';

const TARGETS: { id: FaviconTarget; label: string }[] = [
  { id: 'html', label: 'HTML' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'react', label: 'React' },
];

/** What the code section shows for each target, and where the files go. */
const TARGET_COPY: Record<FaviconTarget, { codeTitle: string; copyLabel: string; zipName: string }> = {
  html: { codeTitle: 'HTML Header Tags', copyLabel: 'Copy HTML', zipName: 'favicon-package' },
  nextjs: { codeTitle: 'app/manifest.ts', copyLabel: 'Copy Code', zipName: 'favicon-nextjs' },
  react: { codeTitle: 'index.html Head Tags', copyLabel: 'Copy HTML', zipName: 'favicon-react' },
};

export default function FaviconGenerator() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const appName = 'My Web App';
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [packageResult, setPackageResult] = useState<FaviconPackageResult | null>(null);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [target, setTarget] = useState<FaviconTarget>('html');

  const [error, setError] = useState<string | null>(null);

  const handleFileDrop = async (files: File[]) => {
    if (!files.length) return;
    const file = files[0];
    setSourceFile(file);
    setError(null);
    setIsGenerating(true);

    try {
      const result = await generateFaviconPackage(file, appName);
      setPackageResult(result);
    } catch (err) {
      console.error('Favicon generation error:', err);
      setSourceFile(null);
      setError("Couldn't create icons from that file. Try a PNG or SVG.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!packageResult || isZipping) return;
    setIsZipping(true);

    try {
      const { entries } = buildFaviconBundle(packageResult, target, appName);
      const zipBlob = await createZipArchive(entries);
      downloadBlob(zipBlob, `${TARGET_COPY[target].zipName}-${Date.now()}.zip`);
    } catch (err) {
      console.error('ZIP packaging failed:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    setSourceFile(null);
    setPackageResult(null);
    setError(null);
  };

  const showResult = Boolean(sourceFile && packageResult);
  const snippet = packageResult ? buildFaviconBundle(packageResult, target, appName).snippet : '';

  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader title="Favicon & App Icon Studio">
        Drop 1 high-resolution SVG or square PNG to automatically create a standard multi-layer{' '}
        <code className="font-mono text-foreground">.ico</code> file (16px, 32px, 48px), Apple Touch Icons,
        PWA Chrome manifest icons, and HTML meta tags. Generated on your device; nothing is uploaded.
      </PageHeader>

      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <Card className={CARD}>
          {error && !isGenerating && (
            <p role="alert" className="border-b border-border px-5 py-4 text-sm text-danger sm:px-8">
              {error}
            </p>
          )}

          {!showResult && !isGenerating && (
            <Dropzone
              onFiles={handleFileDrop}
              multiple={false}
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              hint="Drop a high-res SVG or PNG (512×512 recommended for crisp icon rendering)"
            />
          )}

          {isGenerating && (
            <p role="status" className="flex min-h-72 flex-1 items-center justify-center px-5 py-16 text-center text-sm text-muted shell:min-h-0">
              Generating multi-resolution icon bundle...
            </p>
          )}

          {showResult && packageResult && (
            <>
              <div className={BODY}>
                {/* Mock Browser Tab Preview */}
                <section className={SECTION}>
                  <BrowserTabPreview icon={packageResult.items.find((i) => i.filename === 'favicon-32x32.png')?.blob} title={appName} />
                </section>

                {/* Icon Layers: hairline-split cells */}
                <div className="overflow-hidden border-t border-border">
                  <div className="-mr-px -mb-px grid grid-cols-2 sm:grid-cols-3 @min-[52rem]:grid-cols-6">
                    {packageResult.items.map((item) => {
                      if (item.filename.endsWith('.webmanifest')) return null;

                      return (
                        <div
                          key={item.filename}
                          className="flex min-w-0 flex-col items-center border-r border-b border-border p-5 text-center"
                        >
                          <div className="flex size-20 items-center justify-center rounded-control border border-border bg-surface p-2">
                            <BlobImage
                              blob={item.blob}
                              alt={item.filename}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <span className="mt-4 max-w-full truncate text-sm text-foreground">
                            {item.filename}
                          </span>
                          <span className="mt-0.5 font-mono text-xs tabular-nums text-muted">{formatBytes(item.blob.size)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* HTML tags | bundle text */}
                <div className="grid border-t border-border @2xl:grid-cols-2">
                  <section className={`${SECTION} min-w-0 space-y-4`}>
                    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                      <h4 className="text-base font-normal text-foreground">{TARGET_COPY[target].codeTitle}</h4>
                      <CopyButton text={snippet} label={TARGET_COPY[target].copyLabel} />
                    </div>
                    <pre className="overflow-x-auto rounded-control border border-border bg-surface p-4 font-mono text-xs leading-relaxed text-muted">
                      {snippet}
                    </pre>
                  </section>

                  <section className={`${SECTION} min-w-0 space-y-4 border-t border-border @2xl:border-t-0 @2xl:border-l`}>
                    <h4 className="text-base font-normal text-foreground">Ready-to-Deploy Favicon Bundle</h4>
                    <Segmented<FaviconTarget> aria-label="Framework" value={target} onChange={setTarget} options={TARGETS} />
                    {target === 'html' && (
                      <p className="text-sm leading-relaxed text-muted">
                        Includes multi-layer <code className="text-foreground">favicon.ico</code>, Apple Touch Icon, PWA Chrome icons, and <code className="text-foreground">site.webmanifest</code>.
                      </p>
                    )}
                    {target === 'nextjs' && (
                      <p className="text-sm leading-relaxed text-muted">
                        For the App Router: unzip into your project root. <code className="text-foreground">favicon.ico</code>, <code className="text-foreground">icon.png</code>, <code className="text-foreground">apple-icon.png</code> and <code className="text-foreground">manifest.ts</code> go in <code className="text-foreground">app/</code>, the PWA Chrome icons in <code className="text-foreground">public/</code>. Next.js writes the head tags itself.
                      </p>
                    )}
                    {target === 'react' && (
                      <p className="text-sm leading-relaxed text-muted">
                        For Vite or Create React App: unzip into your project root, so every icon and <code className="text-foreground">site.webmanifest</code> land in <code className="text-foreground">public/</code>, then add the tags to <code className="text-foreground">index.html</code>.
                      </p>
                    )}
                  </section>
                </div>
              </div>

              <div className={FOOTER}>
                <Button variant="secondary" className="h-10 px-4" onClick={handleReset}>
                  <RefreshIcon />
                  <span>Choose Another</span>
                </Button>

                <Button
                  variant="primary"
                  className="h-10 px-4"
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                >
                  <DownloadIcon />
                  <span>{isZipping ? 'Packaging...' : 'Download Favicon ZIP'}</span>
                </Button>
              </div>
            </>
          )}
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
