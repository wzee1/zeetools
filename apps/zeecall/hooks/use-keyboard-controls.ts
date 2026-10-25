"use client";

import { useEffect, useRef } from "react";

export interface UseKeyboardControlsOptions {
  enabled?: boolean;
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  onToggleScreenShare?: () => void;
  onPushToTalkStart?: () => void;
  onPushToTalkEnd?: () => void;
  onToggleFullscreen?: () => void;
  onCopyInvite?: () => void;
  onToggleFileDrop?: () => void;
  onEscape?: () => void;
}

export function useKeyboardControls({
  enabled = true,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onPushToTalkStart,
  onPushToTalkEnd,
  onToggleFullscreen,
  onCopyInvite,
  onToggleFileDrop,
  onEscape,
}: UseKeyboardControlsOptions) {
  const isHoldingSpaceRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const isInputActive = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        el.getAttribute("contenteditable") === "true"
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Escape even inside input
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      // Cmd+C / Ctrl+C for copy invite
      if ((e.metaKey || e.ctrlKey) && (e.key === "c" || e.key === "C")) {
        // If text is selected in an input, let default copy happen
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;
        if (onCopyInvite) {
          e.preventDefault();
          onCopyInvite();
          return;
        }
      }

      // Cmd+D / Ctrl+D for toggle file drop
      if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
        e.preventDefault();
        onToggleFileDrop?.();
        return;
      }

      // Don't intercept single-key actions when focused in text fields
      if (isInputActive()) return;

      // Push-to-Talk (Hold Space)
      if (e.code === "Space" && !e.repeat && !isHoldingSpaceRef.current) {
        e.preventDefault();
        isHoldingSpaceRef.current = true;
        onPushToTalkStart?.();
        return;
      }

      // M: Toggle Mic
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        onToggleMic?.();
        return;
      }

      // V: Toggle Camera
      if (e.key === "v" || e.key === "V") {
        e.preventDefault();
        onToggleCamera?.();
        return;
      }

      // S: Toggle Screen Share (4K mode)
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        onToggleScreenShare?.();
        return;
      }

      // F: Toggle Fullscreen
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        onToggleFullscreen?.();
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && isHoldingSpaceRef.current) {
        e.preventDefault();
        isHoldingSpaceRef.current = false;
        onPushToTalkEnd?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    enabled,
    onToggleMic,
    onToggleCamera,
    onToggleScreenShare,
    onPushToTalkStart,
    onPushToTalkEnd,
    onToggleFullscreen,
    onCopyInvite,
    onToggleFileDrop,
    onEscape,
  ]);
}
