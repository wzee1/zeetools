"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useLocalStore } from "@zeetools/ui/hooks/use-local-store";
import { HISTORY_KEY, activeSecrets, addSecret, removeSecret, type StoredSecret } from "@/lib/secret/history";

// A clock that ticks once a minute, so expiries and "time left" stay current without a timer per row.
function subscribeMinute(callback: () => void) {
  const id = setInterval(callback, 60_000);
  return () => clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;

/** Secrets this browser created and that have not expired, newest first, plus add and remove. */
export function useSecretHistory() {
  const [stored, setStored] = useLocalStore<StoredSecret[]>(HISTORY_KEY, []);
  const now = useSyncExternalStore(subscribeMinute, minuteNow, () => 0);
  const secrets = useMemo(() => activeSecrets(stored, now), [stored, now]);

  const add = useCallback((secret: StoredSecret) => setStored((prev) => addSecret(prev, secret, Date.now())), [setStored]);
  const remove = useCallback((id: string) => setStored((prev) => removeSecret(prev, id)), [setStored]);

  return { secrets, now, add, remove };
}
