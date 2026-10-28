"use client";

import { useRef, useState } from "react";
import DownloadIcon from "@zeetools/ui/components/icons/actions/download-icon";
import UploadIcon from "@zeetools/ui/components/icons/actions/upload-icon";
import CheckIcon from "@zeetools/ui/components/icons/status/check-icon";
import Button from "@zeetools/ui/components/ui/actions/button";
import Kbd from "@zeetools/ui/components/ui/display/kbd";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@zeetools/ui/components/ui/overlays/dialog";
import Progress from "@zeetools/ui/components/ui/feedback/progress";
import type { ReceivedFileState } from "@/hooks/use-data-channel";
import { formatBytes } from "@/lib/format";
import { FileTransferProgress } from "@/lib/webrtc/file-transfer";

export interface FileDropZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onSendFile: (file: File) => void;
  transfers: FileTransferProgress[];
  /** What happened to each received file (it waits for Save or Discard). */
  receivedFiles: Record<string, ReceivedFileState>;
}

const RECEIVED_LABEL: Record<ReceivedFileState, string> = { pending: "Waiting", saved: "Saved", discarded: "Discarded" };

export default function FileDropZone({
  isOpen,
  onClose,
  onSendFile,
  transfers,
  receivedFiles,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Moving over a child fires dragleave on the surface; only leaving it counts.
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => onSendFile(file));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => onSendFile(file));
      e.target.value = "";
    }
  };

  const formatSpeed = (bytesPerSec: number) => {
    if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`;
    if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  return (
    // Escape is handled once, by the page-level keyboard hook, which closes the top-most panel before leaving.
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        onEscapeKeyDown={(e) => e.preventDefault()}
        data-dragging={isDragOver || undefined}
        className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden transition-colors duration-200 ease-out data-dragging:border-ring"
      >
        <DialogHeader className="px-5 py-5 pr-14 sm:px-8 sm:pr-14">
          <DialogTitle className="flex items-center gap-2 font-normal">
            <UploadIcon className="size-4 text-muted" />
            Direct P2P File Handoff
          </DialogTitle>
        </DialogHeader>

        {/* The whole body is the drop surface */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center px-5 py-10 text-center transition-colors duration-200 ease-out select-none hover:bg-foreground/[0.03] sm:px-8"
          >
            <span className="mb-3 flex size-10 items-center justify-center rounded-control border border-border-strong bg-surface text-muted">
              <UploadIcon className="size-4" />
            </span>
            <span className="text-base font-normal text-foreground">
              Drop files here or click to browse
            </span>
            <span className="mt-1 text-xs text-muted">
              Encrypted browser-to-browser SCTP transfer · Zero cloud storage limits
            </span>
          </button>

          {/* Active & Completed Transfers */}
          {transfers.length > 0 && (
            <div className="border-t border-border">
              <h2 className="px-5 pt-5 text-xs text-muted sm:px-8">
                Transfers ({transfers.length})
              </h2>

              <ul className="divide-y divide-border">
                {transfers.map((t) => (
                  <li key={t.fileId} className="space-y-2 px-5 py-4 text-xs sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate pr-2">
                        {t.direction === "send" ? (
                          <UploadIcon className="size-3.5 shrink-0 text-muted" />
                        ) : (
                          <DownloadIcon className="size-3.5 shrink-0 text-muted" />
                        )}
                        <span className="truncate text-foreground">
                          {t.fileName}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                        {formatBytes(t.fileSize)}
                      </span>
                    </div>

                    <Progress value={Math.round(t.progress * 100)} aria-label={t.fileName} />

                    <div className="flex items-center justify-between font-mono text-xs tabular-nums text-muted">
                      <span>
                        {t.status === "completed" ? (
                          <span className="flex items-center gap-1 text-primary-text">
                            <CheckIcon className="size-3" /> Completed
                          </span>
                        ) : (
                          `${formatBytes(t.transferredBytes)} / ${formatBytes(t.fileSize)} (${Math.round(t.progress * 100)}%)`
                        )}
                      </span>
                      <span>
                        {t.status !== "completed"
                          ? formatSpeed(t.speedBytesPerSec)
                          : t.direction === "receive"
                            ? RECEIVED_LABEL[receivedFiles[t.fileId] ?? "pending"]
                            : "Sent"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-8">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>Toggle with</span>
            <Kbd hotkey="mod+d" />
          </div>
          <Button variant="secondary" className="h-10 px-4" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
