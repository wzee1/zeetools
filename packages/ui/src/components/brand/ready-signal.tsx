"use client";

import { useEffect } from "react";

/**
 * Marks <html data-ready> on the first frame after hydration: the preloader fades out and the shell
 * plays its entrance (styles/tokens.css). Renders nothing.
 */
export default function ReadySignal() {
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      document.documentElement.dataset.ready = "";
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}
