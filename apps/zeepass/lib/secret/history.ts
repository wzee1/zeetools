/**
 * Secrets this browser created, kept in localStorage so their links can be found again.
 * Only the share link and its settings are stored (never the plaintext). The server cannot be asked
 * whether a link was read without burning it, so an entry leaves the list when it expires or is removed.
 */
export interface StoredSecret {
  id: string;
  /** The full share link, #key fragment included: it never leaves this device. */
  shareUrl: string;
  burnOnRead: boolean;
  ttlSeconds: number;
  /** Epoch milliseconds. */
  createdAt: number;
}

export const HISTORY_KEY = "zeepass:secrets";

export function expiresAt(secret: StoredSecret): number {
  return secret.createdAt + secret.ttlSeconds * 1000;
}

/** Unexpired entries, newest first. */
export function activeSecrets(list: StoredSecret[], now: number): StoredSecret[] {
  return list.filter((s) => expiresAt(s) > now).sort((a, b) => b.createdAt - a.createdAt);
}

/** Adds (or replaces) an entry and drops the expired ones while at it. */
export function addSecret(list: StoredSecret[], secret: StoredSecret, now: number): StoredSecret[] {
  return activeSecrets([secret, ...list.filter((s) => s.id !== secret.id)], now);
}

export function removeSecret(list: StoredSecret[], id: string): StoredSecret[] {
  return list.filter((s) => s.id !== id);
}

/** Compact time left: "6d", "23h", "45m", "<1m". */
export function formatRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
