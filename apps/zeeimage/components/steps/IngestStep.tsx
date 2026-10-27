'use client';

import { useRef } from 'react';
import Dropzone, { type DropzoneHandle } from '@/components/zee-ui/dropzone';
import Button from '@zeetools/ui/components/ui/actions/button';
import Kbd from '@zeetools/ui/components/ui/display/kbd';
import { IngestedAsset } from '@/hooks/use-image-pipeline';
import TrashIcon from '@zeetools/ui/components/icons/actions/trash-icon';
import ChevronRightIcon from '@zeetools/ui/components/icons/navigation/chevron-right-icon';
import PlusIcon from '@zeetools/ui/components/icons/actions/plus-icon';
import Tick from '@/components/motion/tick';
import { FOOTER, SCROLLER } from '@/lib/card-classes';
import { formatBytes } from '@/lib/format';

interface IngestStepProps {
  assets: IngestedAsset[];
  onAddFiles: (files: File[]) => void;
  onRemoveAsset: (id: string) => void;
  onClearAssets: () => void;
  onProceedToConfig: () => void;
  dropzoneRef?: React.RefObject<DropzoneHandle | null>;
}

/** Step 1, as the card's content: an empty card is the dropzone; with images the dropzone is a strip above the queue. */
export default function IngestStep({
  assets,
  onAddFiles,
  onRemoveAsset,
  onClearAssets,
  onProceedToConfig,
  dropzoneRef,
}: IngestStepProps) {
  const localRef = useRef<DropzoneHandle>(null);
  const activeRef = dropzoneRef || localRef;
  const hasAssets = assets.length > 0;

  return (
    <>
      <Dropzone ref={activeRef} onFiles={onAddFiles} variant={hasAssets ? 'strip' : 'surface'} />

      {hasAssets && (
        <>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 pt-6 pb-4 sm:px-8">
            <h3 className="text-base font-normal text-foreground">
              Queued Assets (<Tick value={assets.length} />)
            </h3>
            <span className="font-mono text-xs tabular-nums text-muted">
              Total:{' '}
              {formatBytes(assets.reduce((sum, item) => sum + item.size, 0))}
            </span>
          </div>

          <div className={SCROLLER}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 border-t border-border px-5 py-5 sm:grid-cols-3 sm:px-8 md:grid-cols-4 @min-[52rem]:grid-cols-5">
              {assets.map((asset) => (
                <div key={asset.id} className="group relative min-w-0">
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-control border border-border bg-surface">
                    {asset.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- data:/blob: thumbnail of a local file; next/image cannot optimise it in a static export
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.file.name}
                        width={160}
                        height={160}
                        decoding="async"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-muted">Preview</div>
                    )}

                    <button
                      onClick={() => onRemoveAsset(asset.id)}
                      className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-control bg-black/70 text-white opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 hover:bg-danger-solid focus-visible:opacity-100 pointer-coarse:opacity-100"
                      title="Remove asset"
                      aria-label="Remove asset"
                    >
                      <TrashIcon className="size-3" />
                    </button>
                  </div>

                  <div className="mt-2 min-w-0 space-y-0.5">
                    <p className="truncate text-xs text-foreground" title={asset.file.name}>
                      {asset.file.name}
                    </p>
                    <p className="font-mono text-xs tabular-nums text-muted">
                      {asset.width > 0 ? `${asset.width}×${asset.height} • ` : ''}
                      {formatBytes(asset.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={FOOTER}>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="h-10 px-4" onClick={() => activeRef.current?.openPicker()}>
                <PlusIcon />
                Add More
              </Button>
              <Button
                variant="ghost"
                className="h-10 px-4 text-danger enabled:hover:text-danger"
                onClick={onClearAssets}
              >
                <TrashIcon />
                Clear All
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 @min-[34rem]:justify-end">
              <div className="flex items-center gap-1.5 text-xs text-muted @max-[40rem]:hidden">
                <span>Press</span>
                <Kbd hotkey="mod+enter" />
                <span>to proceed</span>
              </div>

              <Button variant="primary" className="h-10 px-4 @max-[34rem]:flex-1" onClick={onProceedToConfig}>
                <span>Configure Batch</span>
                <ChevronRightIcon />
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
