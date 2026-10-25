"use client";

import { useEffect, useRef, useState } from "react";

const hasFiles = (e: DragEvent) => Boolean(e.dataTransfer?.types.includes("Files"));

/**
 * While enabled, files dropped anywhere on the window go to `onFiles` (so a file dropped on the sidebar
 * never opens in the tab). Returns whether files are being dragged over the window right now.
 * A drop that something else already handled (the file dialog's own surface) is left alone.
 */
export function useWindowFileDrop(enabled: boolean, onFiles: (files: File[]) => void): boolean {
  const [dragging, setDragging] = useState(false);
  const onFilesRef = useRef(onFiles);

  useEffect(() => {
    onFilesRef.current = onFiles;
  });

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    // dragover repeats while files hover; when it stops, the drag has left the window or ended.
    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setDragging(true);
      clearTimeout(timer);
      timer = setTimeout(() => setDragging(false), 150);
    };

    const onDrop = (e: DragEvent) => {
      clearTimeout(timer);
      setDragging(false);
      if (e.defaultPrevented || !hasFiles(e)) return;
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length > 0) onFilesRef.current(files);
    };

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
      setDragging(false);
    };
  }, [enabled]);

  return enabled && dragging;
}
