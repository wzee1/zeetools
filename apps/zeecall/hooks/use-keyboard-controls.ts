"use client";

import { useEffect, useRef } from "react";

export interface UseKeyboardControlsOptions {
  enabled?: boolean;
  onPushToTalkStart?: () => void;
  onPushToTalkEnd?: () => void;
  onEscape?: () => void;
}

/** True while a key press lands in a field: the same rule as the shared hotkeys (use-hotkeys in @zeetools/ui). */
function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/**
 * The call keys the shared command system cannot carry: holding Space to talk, and Escape inside a field.
 * Every other call key (M, V, S, F, ⌘C, ⌘D, ⌘S, and Escape outside a field) is a command registered in the
 * page, so the hotkeys have one source and the "?" dialog lists them.
 */
export function useKeyboardControls({ enabled = true, onPushToTalkStart, onPushToTalkEnd, onEscape }: UseKeyboardControlsOptions) {
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
      // Escape works inside a field too; the command only fires outside one.
      if (e.key === "Escape") {
        if (isTypingTarget(e.target)) onEscape?.();
        return;
      }

      // Don't intercept single-key actions when focused in text fields
      if (isInputActive()) return;

      // Push-to-Talk (Hold Space)
      if (e.code === "Space" && !e.repeat && !isHoldingSpaceRef.current) {
        e.preventDefault();
        isHoldingSpaceRef.current = true;
        onPushToTalkStart?.();
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
  }, [enabled, onPushToTalkStart, onPushToTalkEnd, onEscape]);
}
