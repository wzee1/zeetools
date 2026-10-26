"use client";

import DownloadIcon from "@zeetools/ui/components/icons/actions/download-icon";
import FileIcon from "@zeetools/ui/components/icons/media/file-icon";
import Button from "@zeetools/ui/components/ui/actions/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@zeetools/ui/components/ui/overlays/dialog";
import { formatBytes } from "@/lib/format";
import type { FileTransferProgress } from "@/lib/webrtc/file-transfer";

export interface IncomingFileDialogProps {
  /** The received file waiting for an answer, or null. */
  file: FileTransferProgress | null;
  senderName: string;
  onSave: (file: FileTransferProgress) => void;
  onDiscard: (file: FileTransferProgress) => void;
}

/**
 * A peer sent a file: it is already in this tab's memory, and nothing is written to disk until the user
 * saves it. Only the two buttons answer; Esc or a stray click must not lose the file.
 */
export default function IncomingFileDialog({ file, senderName, onSave, onDiscard }: IncomingFileDialogProps) {
  return (
    <Dialog open={file !== null}>
      <DialogContent
        showClose={false}
        className="max-w-sm overflow-hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-5 py-5 sm:px-8">
          <DialogTitle className="flex items-center gap-2 font-normal">
            <FileIcon className="size-4 text-muted" />
            Incoming file
          </DialogTitle>
        </DialogHeader>
        {file && (
          <DialogDescription className="mt-0 space-y-1 px-5 py-6 sm:px-8">
            <span className="block truncate text-sm text-foreground">{file.fileName}</span>
            <span className="block font-mono text-xs text-muted tabular-nums">
              {formatBytes(file.fileSize)} · from {senderName}
            </span>
          </DialogDescription>
        )}
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-8">
          <Button variant="secondary" className="h-10 px-4" onClick={() => file && onDiscard(file)}>
            Discard
          </Button>
          <Button variant="primary" className="h-10 px-4" onClick={() => file && onSave(file)}>
            <DownloadIcon />
            <span>Save</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
