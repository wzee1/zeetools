"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import DownloadIcon from "@zeetools/ui/components/icons/actions/download-icon";
import ZeeButton from "./ZeeButton";
import CopyButtonView from "@zeetools/ui/components/ui/actions/copy-button-view";
import { cn } from "@zeetools/ui/lib/utils";
import { toast } from "sonner";

// Only the first lines fade in one after another; a long file would otherwise take seconds to appear.
const ANIMATED_LINES = 12;
const ease = [0.32, 0.72, 0, 1] as const;

interface CodeViewerProps {
  content: string;
  filename?: string;
  className?: string;
}

export default function CodeViewer({
  content,
  filename = "secret.env",
  className,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => content.split("\n"), [content]);
  const isEnvFormat = useMemo(() => {
    return lines.some((line) => line.trim().startsWith("#") || /^[A-Z0-9_]+=/i.test(line.trim()));
  }, [lines]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Secret copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy secret to clipboard");
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded as ${filename}`);
    } catch {
      toast.error("Failed to download file");
    }
  };

  // Line numbers get a column as wide as the largest one.
  const gutter = `${String(lines.length).length}ch`;

  return (
    // The plaintext as a card of the app shell: a header row (ring-dot metadata, actions), a hairline,
    // then the code. Inside the shell it fills the space it is given and scrolls itself, not the page.
    <div className={cn("flex flex-col overflow-hidden rounded-panel border border-border bg-surface-raised", className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 pt-5 pb-4 sm:px-8 sm:pt-6">
        <div className="flex min-w-0 items-center gap-2 overflow-hidden font-mono text-xs whitespace-nowrap text-muted tabular-nums">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full border-2 border-primary-text" />
          <span>{isEnvFormat ? ".env / credential" : "secret"}</span>
          <span aria-hidden>·</span>
          <span>
            {lines.length} {lines.length === 1 ? "line" : "lines"} ({new Blob([content]).size} B)
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ZeeButton variant="secondary" onClick={handleDownload} title="Download secret as file" aria-label="Download .env">
            <DownloadIcon className="size-4" />
            <span className="hidden sm:inline">Download .env</span>
          </ZeeButton>

          <CopyButtonView copied={copied} onClick={handleCopy} />
        </div>
      </div>

      <div className="max-h-[60vh] min-h-40 overflow-auto border-t border-border px-5 py-5 font-mono text-sm leading-relaxed tabular-nums selection:bg-primary/25 sm:px-8 shell:max-h-none shell:min-h-0 shell:flex-1">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          const isComment = trimmed.startsWith("#");
          const envMatch = trimmed.match(/^([A-Z0-9_]+)(=)(.*)$/i);
          const animated = idx < ANIMATED_LINES;
          const Row = animated ? motion.div : "div";

          return (
            <Row
              key={idx}
              {...(animated && {
                initial: { opacity: 0, y: 4 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3, ease, delay: 0.1 + idx * 0.03 },
              })}
              className="grid gap-x-5"
              style={{ gridTemplateColumns: `${gutter} 1fr` }}
            >
              <span className="text-right text-muted/70 select-none">{idx + 1}</span>
              <span className="min-w-0 break-all">
                {isComment ? (
                  <span className="text-muted">{line}</span>
                ) : envMatch ? (
                  <>
                    <span className="text-primary-text">{envMatch[1]}</span>
                    <span className="text-muted">{envMatch[2]}</span>
                    <span className="text-foreground">{envMatch[3]}</span>
                  </>
                ) : (
                  <span className="text-foreground">{line}</span>
                )}
              </span>
            </Row>
          );
        })}
      </div>
    </div>
  );
}
