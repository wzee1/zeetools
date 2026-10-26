"use client";

import { useRef } from "react";
import Button from "@zeetools/ui/components/ui/actions/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@zeetools/ui/components/ui/overlays/dialog";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Asks before something that ends the call. The confirm button has focus, so Enter confirms; Esc, the
 * cross or "Stay" cancel.
 */
export default function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "Stay", onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent
        className="max-w-sm overflow-hidden"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          confirmRef.current?.focus();
        }}
      >
        <DialogHeader className="px-5 py-5 pr-14 sm:px-8 sm:pr-14">
          <DialogTitle className="font-normal">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-0 px-5 py-6 text-sm leading-relaxed sm:px-8">{description}</DialogDescription>
        <div className="flex justify-end gap-2 border-t border-border px-5 py-4 sm:px-8">
          <Button variant="secondary" className="h-10 px-4" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant="danger" className="h-10 px-4" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
