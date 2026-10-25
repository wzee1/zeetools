"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copyText } from "@zeetools/ui/lib/export";

/** Copies the invite link and reports `copied` for two seconds, so the button and the ⌘C shortcut share one state. */
export function useCopyInvite(url: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      await copyText(url);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return { copied, copy };
}
