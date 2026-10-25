import { useEffect, useRef, useSyncExternalStore } from "react";
import { isMac } from "../lib/utils";

/** A hotkey such as "mod+k", "mod+shift+c" or "?". `mod` is ⌘ on macOS and Ctrl elsewhere. */
export type Hotkey = string;

export function matchesHotkey(event: KeyboardEvent, hotkey: Hotkey) {
  const parts = hotkey.toLowerCase().split("+");
  const key = parts.pop();
  const mod = parts.includes("mod");
  const wantsMeta = parts.includes("meta") || (mod && isMac());
  const wantsCtrl = parts.includes("ctrl") || (mod && !isMac());
  // Shifted characters like "?" already encode shift in event.key.
  const shiftMatters = parts.includes("shift") || /^[a-z0-9]$/.test(key ?? "");

  return (
    event.key.toLowerCase() === key &&
    event.metaKey === wantsMeta &&
    event.ctrlKey === wantsCtrl &&
    event.altKey === parts.includes("alt") &&
    (!shiftMatters || event.shiftKey === parts.includes("shift"))
  );
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

type Binding = { hotkey: Hotkey; run: () => void };

/**
 * Binds hotkeys on window. Plain keys are skipped while the user is typing in a field;
 * combinations with ⌘/Ctrl always fire. Pass a function to read bindings at keypress time.
 */
export function useHotkeys(bindings: Binding[] | (() => Binding[])) {
  const ref = useRef(bindings);

  useEffect(() => {
    ref.current = bindings;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const current = typeof ref.current === "function" ? ref.current() : ref.current;
      for (const { hotkey, run } of current) {
        if (!matchesHotkey(event, hotkey)) continue;
        if (!event.metaKey && !event.ctrlKey && isTyping(event.target)) continue;
        event.preventDefault();
        run();
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

const noopSubscribe = () => () => {};

/** Platform check that is safe to use during render; the server renders the macOS symbols. */
export function useIsMac() {
  return useSyncExternalStore(noopSubscribe, isMac, () => true);
}

export function formatHotkey(hotkey: Hotkey, mac: boolean) {
  const symbols: Record<string, string> = {
    mod: mac ? "⌘" : "Ctrl",
    meta: "⌘",
    ctrl: "Ctrl",
    shift: mac ? "⇧" : "Shift",
    alt: mac ? "⌥" : "Alt",
    enter: "↵",
    escape: "Esc",
    backspace: "⌫",
  };
  return hotkey.split("+").map((part) => symbols[part.toLowerCase()] ?? part.toUpperCase());
}
