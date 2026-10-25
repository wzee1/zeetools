"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
// Fallback when sessionStorage is unavailable, and home for generated values that are not persisted.
const memory = new Map<string, string>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function readStored(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * A string kept in sessionStorage, readable during hydration without a mismatch: the server (and the
 * first client render) use `serverValue`, then the real value takes over. `create` makes the initial
 * value when nothing is stored; it is stored right away only with `persist`.
 */
export function useSessionValue(
  key: string,
  create: () => string,
  serverValue: string,
  persist: boolean
): [string, (next: string) => void] {
  const getSnapshot = () => {
    const stored = readStored(key);
    if (stored !== null) return stored;
    let value = memory.get(key);
    if (value === undefined) {
      value = create();
      memory.set(key, value);
      if (persist) {
        try {
          sessionStorage.setItem(key, value);
        } catch {
          // keep the in-memory value
        }
      }
    }
    return value;
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, () => serverValue);

  const set = useCallback(
    (next: string) => {
      memory.set(key, next);
      try {
        sessionStorage.setItem(key, next);
      } catch {
        // keep the in-memory value
      }
      listeners.forEach((l) => l());
    },
    [key]
  );

  return [value, set];
}
