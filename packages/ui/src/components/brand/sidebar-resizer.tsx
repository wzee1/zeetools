"use client";

import { useRef } from "react";
import { useShell } from "../../hooks/use-shell";
import { COLLAPSE_SLOP, SIDEBAR } from "../../lib/shell";

/**
 * The sidebar's edge. Dragging follows the pointer 1:1 (transitions are off while data-resizing is
 * set) and saves on release; dragging well past the minimum hides the sidebar. Arrow keys nudge it
 * in 16px steps and a double-click restores the default, both animated.
 */
export default function SidebarResizer() {
  const { width, previewWidth, setWidth, setCollapsed } = useShell();
  const dragged = useRef<number | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    document.documentElement.dataset.resizing = "";
    dragged.current = width;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragged.current === null) return;
    // The sidebar starts at the viewport's left edge, so the pointer's x is the wanted width.
    dragged.current = e.clientX;
    previewWidth(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragged.current === null) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    delete document.documentElement.dataset.resizing;
    const x = dragged.current;
    dragged.current = null;
    if (x < SIDEBAR.min - COLLAPSE_SLOP) {
      previewWidth(width);
      setCollapsed(true);
    } else {
      setWidth(x);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setWidth(width - 16);
    else if (e.key === "ArrowRight") setWidth(width + 16);
    else if (e.key === "Home") setWidth(SIDEBAR.min);
    else if (e.key === "End") setWidth(SIDEBAR.max);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuemin={SIDEBAR.min}
      aria-valuemax={SIDEBAR.max}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={() => setWidth(SIDEBAR.default)}
      className="group absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none outline-none"
    >
      {/* A hairline that shows on hover, while dragging and on keyboard focus. */}
      <span className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-border-strong opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:bg-ring group-focus-visible:opacity-100 group-active:opacity-100" />
    </div>
  );
}
