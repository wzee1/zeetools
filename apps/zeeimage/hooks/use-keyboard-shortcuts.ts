'use client';

import { useEffect } from 'react';

export interface ShortcutHandlers {
  onOpenFilePicker?: () => void;
  onConfirmAndProcess?: () => void;
  onDownloadZip?: () => void;
  onEscape?: () => void;
  onStepJump?: (step: number) => void;
  onToggleCompare?: () => void;
}

/** Text-entry targets: the page shortcuts never fire while typing. */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return (
    !!el &&
    (el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.tagName === 'SELECT' ||
      el.isContentEditable)
  );
}

/** Controls that natively use Space/Enter; bare-key shortcuts must not hijack them. */
function isActivatableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute?.('role') === 'button');
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if active element is an input, textarea, select, or contentEditable
      if (isTypingTarget(e.target)) return;

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // ⌘ + O / Ctrl + O -> Trigger file picker
      if (modifier && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        handlers.onOpenFilePicker?.();
        return;
      }

      // ⌘ + Enter / Ctrl + Enter -> Confirm settings & process batch
      if (modifier && e.key === 'Enter') {
        e.preventDefault();
        handlers.onConfirmAndProcess?.();
        return;
      }

      // ⌘ + S / Ctrl + S -> Download batch ZIP
      if (modifier && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handlers.onDownloadZip?.();
        return;
      }

      // Esc -> Close active modal / reset selection
      if (e.key === 'Escape') {
        if (handlers.onEscape) {
          e.preventDefault();
          handlers.onEscape();
        }
        return;
      }

      // Space -> Toggle comparison viewer
      if (e.code === 'Space' && !modifier) {
        if (handlers.onToggleCompare && !isActivatableTarget(e.target)) {
          e.preventDefault();
          handlers.onToggleCompare();
        }
        return;
      }

      // 1, 2, 3, 4 -> Stepper step jump
      if (['1', '2', '3', '4'].includes(e.key) && !modifier && !e.altKey && !e.shiftKey) {
        const stepNum = parseInt(e.key, 10);
        handlers.onStepJump?.(stepNum);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
