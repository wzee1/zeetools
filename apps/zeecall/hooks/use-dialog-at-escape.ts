"use client";

import { useEffect, useRef } from "react";

/**
 * Remembers, for the Escape key press being handled, whether a dialog was open when it started.
 * The listener runs in the capture phase on window, before any dialog closes itself on the same key,
 * so a handler that reads the ref later still knows Escape was meant for that dialog.
 */
export function useDialogAtEscape(enabled: boolean) {
  const openRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") openRef.current = document.querySelector('[role="dialog"]') !== null;
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [enabled]);

  return openRef;
}
