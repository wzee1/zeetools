"use client";

import { useCallback } from "react";
import { useLocalStore } from "./use-local-store";
import { useZee } from "./use-zee";
import { DEFAULT_SHELL, SIDEBAR, clampSidebarWidth, shellKey, type ShellState } from "../lib/shell";

/**
 * Sidebar visibility and width, persisted in localStorage. The DOM is written by these handlers
 * (data-sidebar and --sidebar-w on <html>), never by an effect, so hydration can't briefly undo
 * what the boot script painted. `previewWidth` moves the edge without saving, for live dragging.
 */
export function useShell() {
  const { name } = useZee();
  const [shell, setShell] = useLocalStore<ShellState>(shellKey(name), DEFAULT_SHELL);

  const setCollapsed = useCallback(
    (collapsed: boolean) => {
      const root = document.documentElement;
      if (collapsed) root.dataset.sidebar = "collapsed";
      else delete root.dataset.sidebar;
      setShell((prev) => ({ ...prev, collapsed }));
    },
    [setShell],
  );

  const previewWidth = useCallback((width: number) => {
    document.documentElement.style.setProperty("--sidebar-w", `${clampSidebarWidth(width)}px`);
  }, []);

  const setWidth = useCallback(
    (width: number) => {
      const next = clampSidebarWidth(width);
      document.documentElement.style.setProperty("--sidebar-w", `${next}px`);
      setShell((prev) => ({ ...prev, width: next }));
    },
    [setShell],
  );

  return {
    collapsed: shell.collapsed,
    width: clampSidebarWidth(shell.width ?? SIDEBAR.default),
    setCollapsed,
    toggle: () => setCollapsed(!shell.collapsed),
    previewWidth,
    setWidth,
  };
}
