"use client";

import { ChevronDown } from "lucide-react";
import { useRef } from "react";

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)"; // --ease-out
const OPEN_MS = 460;
const CLOSE_MS = 340;

/**
 * One FAQ question as a native <details>, animated with the Web Animations API: the answer's height eases open
 * and shut while its text fades and settles. The markup is plain <details>, so without JavaScript it still opens
 * (instantly) and crawlers read every answer. The click is taken over only to run the animation: the element stays
 * open until the closing animation ends, and a click mid-way reverses from where it is. Reduced motion skips it.
 */
export default function FaqItem({ q, a }: { q: string; a: string }) {
  const details = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  const running = useRef<Animation[]>([]);

  function toggle(event: React.MouseEvent) {
    const el = details.current;
    const panel = body.current;
    const copy = text.current;
    if (!el || !panel || !copy || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();

    // Start from wherever a running animation has got to, so a quick second click reverses smoothly.
    // A closed answer starts from nothing (the browser may still report its last laid-out size); an open or
    // moving one starts from its current values.
    const wasClosed = !el.open;
    const from = wasClosed ? 0 : panel.getBoundingClientRect().height;
    const fromOpacity = wasClosed ? "0" : getComputedStyle(copy).opacity;
    running.current.forEach((animation) => animation.cancel());

    const closing = el.open && el.dataset.state !== "closing";
    el.dataset.state = closing ? "closing" : "open";
    if (!closing) el.open = true;
    const to = closing ? 0 : panel.scrollHeight;
    const duration = closing ? CLOSE_MS : OPEN_MS;

    const height = panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration, easing: EASE });
    const fade = copy.animate(
      closing
        ? [{ opacity: fromOpacity, translate: "0 0" }, { opacity: 0, translate: "0 -0.375rem" }]
        : [{ opacity: fromOpacity, translate: wasClosed ? "0 -0.375rem" : "0 0" }, { opacity: 1, translate: "0 0" }],
      // "both" holds the faded-out text until the height has closed too, so it never flashes back at the end.
      { duration: closing ? CLOSE_MS * 0.7 : OPEN_MS, delay: closing ? 0 : 70, easing: EASE, fill: "both" },
    );
    running.current = [height, fade];
    height.onfinish = () => {
      fade.cancel();
      running.current = [];
      if (closing) el.open = false;
      delete el.dataset.state;
    };
  }

  return (
    <details ref={details} data-faq className="group">
      <summary
        onClick={toggle}
        className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm py-3.5 text-sm text-foreground outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
      >
        <span className="min-w-0 text-pretty">{q}</span>
        <ChevronDown aria-hidden data-faq-chevron className="size-4 shrink-0 text-muted" />
      </summary>
      {/* The height animates on this wrapper, which clips the answer as it grows and shrinks. */}
      <div ref={body} className="overflow-hidden">
        <p ref={text} className="pr-8 pb-4 text-sm leading-relaxed text-pretty text-muted">
          {a}
        </p>
      </div>
    </details>
  );
}
