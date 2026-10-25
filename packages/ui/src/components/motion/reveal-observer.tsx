"use client";

import { useEffect } from "react";

const pending = "[data-reveal]:not([data-revealed])";

/**
 * The one IntersectionObserver behind every scroll reveal on the page. It finds elements marked
 * data-reveal (rendered on the server), flips data-revealed when each first comes into view and
 * stops watching it. A MutationObserver picks up elements that mount later. No animation loops:
 * CSS transitions on transform and opacity do the moving (see "Scroll reveals" in styles/tokens.css).
 */
export default function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    const scan = (node: ParentNode) => node.querySelectorAll(pending).forEach((el) => io.observe(el));
    scan(document);

    const mo = new MutationObserver((records) => {
      for (const record of records)
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(pending)) io.observe(node);
          scan(node);
        });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // Tells the inline failsafe in the layout (see styles/tokens.css) that reveals are being handled.
    root.dataset.reveals = "on";

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
