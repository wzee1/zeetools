"use client";

import { useEffect, useState } from "react";
import DownloadIcon from "@zeetools/ui/components/icons/actions/download-icon";
import FileIcon from "@zeetools/ui/components/icons/media/file-icon";
import CheckIcon from "@zeetools/ui/components/icons/status/check-icon";
import Button from "@zeetools/ui/components/ui/actions/button";
import Kbd from "@zeetools/ui/components/ui/display/kbd";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@zeetools/ui/components/ui/overlays/dialog";
import { cn } from "@zeetools/ui/lib/utils";
import { formatDuration } from "@/lib/format";
import IconSwap from "./IconSwap";

export interface CallNotesProps {
  isOpen: boolean;
  onClose: () => void;
  notes: string;
  onUpdateNotes: (content: string) => void;
  onExportNotes: () => void;
  callDurationSeconds: number;
  /** A peer is connected, so edits reach them over the data channel. */
  isSynced: boolean;
}

export default function CallNotes({
  isOpen,
  onClose,
  notes,
  onUpdateNotes,
  onExportNotes,
  callDurationSeconds,
  isSynced,
}: CallNotesProps) {
  const [copied, setCopied] = useState(false);

  // Hotkey Cmd+S / Ctrl+S inside notes modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        onExportNotes();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onExportNotes]);

  return (
    // Escape is handled once, by the page-level keyboard hook, which closes the top-most panel before leaving.
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        aria-describedby={undefined}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="top-[10vh] flex h-[75vh] max-w-xl flex-col overflow-hidden transition-colors duration-200 ease-out has-[textarea:focus-visible]:border-ring"
      >
        <DialogHeader className="px-5 py-5 pr-14 sm:px-8 sm:pr-14">
          <div className="flex items-center gap-2">
            <FileIcon className="size-4 shrink-0 text-muted" />
            <DialogTitle className="font-normal">Call Notes</DialogTitle>
            <span className="ml-2 inline-flex h-6 items-center rounded-control border border-border px-2 font-mono text-xs tabular-nums text-muted">
              {formatDuration(callDurationSeconds)}
            </span>
          </div>
        </DialogHeader>

        {/* Scratchpad Editor Area: the textarea is the dialog's writing surface, so focus rings the dialog */}
        <div className="flex flex-1 flex-col px-5 py-5 sm:px-8 sm:py-6">
          <textarea
            value={notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Notes for everyone on the call..."
            spellCheck={false}
            className="w-full flex-1 resize-none border-0 bg-transparent font-mono text-xs leading-relaxed text-foreground outline-none placeholder:text-muted"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span aria-hidden className={cn("size-2.5 rounded-full border-2", isSynced ? "border-primary-text" : "border-muted")} />
            <span>{isSynced ? "Synced over DataChannel" : "Shared once someone joins"}</span>
          </div>

          <Button
            variant="primary"
            className="h-10 px-4"
            onClick={() => {
              onExportNotes();
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <IconSwap active={copied} on={<CheckIcon />} off={<DownloadIcon />} />
            <span>{copied ? "Exported!" : "Export Notes"}</span>
            <Kbd hotkey="mod+s" className="hidden sm:inline-flex" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
