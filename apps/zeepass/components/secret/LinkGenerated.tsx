"use client";

import { useCallback, useEffect, useId, useState } from "react";
import LockIcon from "@zeetools/ui/components/icons/status/lock-icon";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import PageHeader from "@zeetools/ui/components/brand/page-header";
import DrawCheck from "@/components/secret/DrawCheck";
import Stagger from "@zeetools/ui/components/motion/stagger";
import StaggerItem from "@zeetools/ui/components/motion/stagger-item";
import { useScramble } from "@/hooks/use-scramble";
import CopyButtonView from "@zeetools/ui/components/ui/actions/copy-button-view";
import { Card } from "@zeetools/ui/components/ui/display/card";
import Input from "@zeetools/ui/components/ui/forms/input";
import Label from "@zeetools/ui/components/ui/forms/label";
import ZeeButton from "@/components/zee-ui/ZeeButton";
import ZeeKbd from "@/components/zee-ui/ZeeKbd";
import { toast } from "sonner";

interface LinkGeneratedProps {
  shareUrl: string;
  burnOnRead: boolean;
  ttlSeconds: number;
  onReset: () => void;
}

export default function LinkGenerated({
  shareUrl,
  burnOnRead,
  ttlSeconds,
  onReset,
}: LinkGeneratedProps) {
  const [copied, setCopied] = useState(false);
  const linkId = useId();
  const shownUrl = useScramble(shareUrl);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link to clipboard");
    }
  }, [shareUrl]);

  // Keyboard shortcut: mod+c to copy, Esc to reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
        // Only trigger copy if user hasn't selected another text element
        const selection = window.getSelection()?.toString();
        if (!selection) {
          e.preventDefault();
          handleCopy();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopy, onReset]);

  const ttlLabel =
    ttlSeconds <= 3600
      ? "1 hour"
      : ttlSeconds <= 86400
      ? "24 hours"
      : "7 days";

  return (
    <Stagger className="space-y-10">
      <PageHeader title="Secret Encrypted & Stored" leading={<DrawCheck />}>
        <span className="tabular-nums">
          {burnOnRead ? "Burns immediately upon 1st read" : "Persistent read"} ·
          Expires in {ttlLabel}
        </span>
      </PageHeader>

      <StaggerItem>
        <Card className="overflow-hidden">
          <div className="space-y-4 px-5 py-6 sm:px-8 sm:py-7">
            <Label htmlFor={linkId} className="text-base font-normal">
              Shareable Link
            </Label>
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {/* Shows the link decoding from ciphertext-like glyphs; select and copy always use the real URL. */}
              <Input
                id={linkId}
                readOnly
                value={shownUrl}
                onFocus={(e) => {
                  e.currentTarget.value = shareUrl;
                  e.currentTarget.select();
                }}
                className="h-10 min-w-0 font-mono text-xs sm:flex-1"
              />
              <CopyButtonView variant="primary" copied={copied} onClick={handleCopy} label="Copy Link" copiedLabel="Copied!" className="h-10 px-4">
                <ZeeKbd hotkey="mod+c" className="hidden sm:inline-flex" />
              </CopyButtonView>
            </div>
          </div>

          <div className="flex gap-4 border-t border-border px-5 py-6 sm:px-8 sm:py-7">
            <LockIcon className="mt-1 size-4 shrink-0 text-muted" />
            <div className="space-y-1">
              <p className="text-base text-foreground">
                Zero-Knowledge Client-Side Encryption
              </p>
              <p className="text-sm leading-relaxed text-muted">
                Encrypted locally in your browser with AES-GCM-256. The decryption key
                resides exclusively in the <code className="font-mono text-foreground">#key=...</code> hash
                fragment and is never transmitted over HTTP or stored on the server.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:px-8">
            <span className="text-xs text-muted">
              Press <ZeeKbd hotkey="esc" /> to reset
            </span>
            <ZeeButton variant="secondary" onClick={onReset} className="h-10 px-4">
              <PlusIcon className="size-4" />
              <span>Create Another Secret</span>
            </ZeeButton>
          </div>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
