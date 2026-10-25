import { get, set } from "idb-keyval";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

const LOCAL_EVENT = "zee:local-store";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_EVENT, callback);
  };
}

/** JSON value in localStorage, synced across components and tabs. For small settings. */
export function useLocalStore<T>(key: string, initial: T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null,
  );

  const value = useMemo<T>(() => {
    if (raw === null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
    // `initial` is only a fallback; callers often pass a fresh literal each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prevRaw = localStorage.getItem(key);
      const prev = prevRaw === null ? initial : (JSON.parse(prevRaw) as T);
      const resolved = next instanceof Function ? next(prev) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      window.dispatchEvent(new Event(LOCAL_EVENT));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, setValue] as const;
}

/** Value in IndexedDB. For files, blobs and anything too large for localStorage. */
export function useIdbStore<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    get<T>(key).then((stored) => {
      if (cancelled) return;
      if (stored !== undefined) setValue(stored);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = useCallback(
    (next: T) => {
      setValue(next);
      void set(key, next);
    },
    [key],
  );

  return [value, update, ready] as const;
}
