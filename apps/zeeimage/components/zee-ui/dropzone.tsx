'use client';

import { motion } from 'motion/react';
import { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import UploadIcon from '@zeetools/ui/components/icons/actions/upload-icon';
import Kbd from '@zeetools/ui/components/ui/display/kbd';
import { spring, springSnappy } from '@zeetools/ui/lib/motion';
import { cn } from '@zeetools/ui/lib/utils';

export interface DropzoneHandle {
  openPicker: () => void;
}

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  hint?: string;
  /**
   * `surface`: the dropzone is the card's own surface and fills it (an empty card).
   * `strip`: a compact row at the top of a card that already holds content.
   * Neither draws a box of its own: while dragging or focused, the card's border turns green (see CARD).
   */
  variant?: 'surface' | 'strip';
}

interface WebkitEntry {
  isFile: boolean;
  isDirectory: boolean;
  file?: (success: (file: File) => void, error: () => void) => void;
  createReader?: () => WebkitDirectoryReader;
}

interface WebkitDirectoryReader {
  readEntries: (success: (entries: WebkitEntry[]) => void, error: () => void) => void;
}

/**
 * Traverses entries recursively for directory drops.
 */
async function getFilesFromEntry(entry: WebkitEntry): Promise<File[]> {
  if (entry.isFile && entry.file) {
    return new Promise<File[]>((resolve) => {
      entry.file!( (file: File) => resolve([file]), () => resolve([]));
    });
  } else if (entry.isDirectory && entry.createReader) {
    const reader = entry.createReader();
    const readEntries = async (): Promise<WebkitEntry[]> => {
      return new Promise((resolve) => {
        reader.readEntries((entries: WebkitEntry[]) => resolve(entries), () => resolve([]));
      });
    };

    let entries: WebkitEntry[] = [];
    let batch: WebkitEntry[];
    do {
      batch = await readEntries();
      entries = entries.concat(batch);
    } while (batch.length > 0);

    const nested = await Promise.all(entries.map((e) => getFilesFromEntry(e)));
    return nested.flat();
  }
  return [];
}

const Dropzone = forwardRef<DropzoneHandle, DropzoneProps>(
  ({ onFiles, accept = 'image/*', multiple = true, className, hint, variant = 'surface' }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const strip = variant === 'strip';

    useImperativeHandle(ref, () => ({
      openPicker: () => {
        inputRef.current?.click();
      },
    }));

    const handleFiles = useCallback(
      (fileList: File[]) => {
        if (!fileList.length) return;
        onFiles(multiple ? fileList : fileList.slice(0, 1));
      },
      [multiple, onFiles]
    );

    const onDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);

      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const filePromises: Promise<File[]>[] = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.webkitGetAsEntry) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
              filePromises.push(getFilesFromEntry(entry));
              continue;
            }
          }
          const file = item.getAsFile();
          if (file) filePromises.push(Promise.resolve([file]));
        }

        const gathered = (await Promise.all(filePromises)).flat();
        if (gathered.length > 0) {
          handleFiles(gathered);
          return;
        }
      }

      handleFiles(Array.from(e.dataTransfer.files));
    };

    return (
      <motion.div
        data-dropzone
        data-dragging={dragging || undefined}
        initial="rest"
        animate={dragging ? 'drag' : 'rest'}
        whileHover={dragging ? undefined : 'hover'}
        whileTap="tap"
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) =>
          (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), inputRef.current?.click())
        }
        onPaste={(e) => handleFiles(Array.from(e.clipboardData.files))}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
        }}
        onDrop={onDrop}
        className={cn(
          'group relative cursor-pointer outline-none transition-colors duration-200 ease-out hover:bg-surface/60 data-[dragging]:bg-surface',
          strip
            ? 'flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border px-5 py-4 sm:px-8'
            : 'flex min-h-72 flex-col items-center justify-center gap-4 px-5 py-16 text-center shell:min-h-0 shell:flex-1',
          className
        )}
      >
        <div className={cn('flex items-center gap-4', !strip && 'flex-col')}>
          <motion.span
            variants={{
              rest: { y: 0, scale: 1 },
              hover: { y: 0, scale: 1 },
              drag: { y: -4, scale: 1.08 },
              tap: { y: 0, scale: 0.96 },
            }}
            transition={{ ...spring, scale: springSnappy }}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-control border border-border-strong bg-surface-raised text-muted transition-[border-color,color] duration-200 ease-out group-hover:text-foreground group-data-[dragging]:border-primary group-data-[dragging]:text-primary-text',
              strip ? 'size-9' : 'size-14'
            )}
          >
            <UploadIcon className={strip ? 'size-4' : 'size-6'} />
          </motion.span>

          <div className={cn('space-y-1.5', strip && 'min-w-0')}>
            <p className="text-base font-normal text-foreground">
              Drop images or whole folders here, or{' '}
              <span className="underline decoration-border-strong underline-offset-4 transition-colors duration-200 ease-out group-hover:decoration-foreground">
                browse
              </span>
            </p>
            {!strip && (
              <p className="text-sm text-muted">
                {hint || 'PNG, JPEG, WebP, AVIF, SVG, BMP, ICO, HEIC / HEIF supported'}
              </p>
            )}
          </div>
        </div>

        <div className={cn('flex items-center gap-2 text-xs text-muted', strip && '@max-[40rem]:hidden')}>
          <span>Press</span>
          <Kbd hotkey="mod+o" />
          <span>to select files anytime</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
        />
      </motion.div>
    );
  }
);

Dropzone.displayName = 'Dropzone';

export default Dropzone;
