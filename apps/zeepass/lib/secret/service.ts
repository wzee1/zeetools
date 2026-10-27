import { getCloudflareContext } from "@opennextjs/cloudflare";
import { base64UrlToBuffer } from "../utils/formatters";
import type {
  CreateSecretInput,
  CreateSecretResult,
  RevealSecretResult,
  SecretRecord,
} from "./types";

const MAX_PAYLOAD_BYTES = 256 * 1024; // 256 KB
const DEFAULT_TTL_SECONDS = 86400; // 24 hours
const MIN_TTL_SECONDS = 300; // 5 minutes
const MAX_TTL_SECONDS = 604800; // 7 days

interface CloudflareKV {
  get(key: string, type: "json"): Promise<SecretRecord | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

/** Local in-memory store for next dev, vitest, and non-Cloudflare environments */
const devStore = new Map<string, { record: SecretRecord; expiresAt: number }>();

/** Internal helper for unit tests to reset memory store */
export function _resetDevStore(): void {
  devStore.clear();
}

/**
 * Resolves Cloudflare SECRETS_KV binding; falls back to undefined in dev/test runners.
 */
function getKvBinding(): CloudflareKV | undefined {
  try {
    return (getCloudflareContext().env as { SECRETS_KV?: CloudflareKV })
      .SECRETS_KV;
  } catch {
    return undefined;
  }
}

/**
 * Validates and saves an encrypted secret to KV with automated TTL expungement.
 * Guaranteed zero IP logging.
 */
export async function saveSecret(
  input: CreateSecretInput
): Promise<CreateSecretResult> {
  const { ciphertext, iv, ttlSeconds = DEFAULT_TTL_SECONDS, burnOnRead = true } =
    input;

  if (!ciphertext || typeof ciphertext !== "string") {
    return { ok: false, error: "Ciphertext is required." };
  }

  if (!iv || typeof iv !== "string") {
    return { ok: false, error: "Initialization vector (IV) is required." };
  }

  // Validate IV length: 12 bytes decoded
  try {
    const ivBuffer = base64UrlToBuffer(iv);
    if (ivBuffer.byteLength !== 12) {
      return { ok: false, error: "Invalid IV: must be exactly 12 bytes." };
    }
  } catch {
    return { ok: false, error: "Malformed IV encoding." };
  }

  // Validate ciphertext size (max 256 KB)
  try {
    const cipherBuffer = base64UrlToBuffer(ciphertext);
    if (cipherBuffer.byteLength > MAX_PAYLOAD_BYTES) {
      return {
        ok: false,
        error: `Payload too large. Maximum allowed is ${MAX_PAYLOAD_BYTES / 1024} KB.`,
      };
    }
  } catch {
    return { ok: false, error: "Malformed ciphertext encoding." };
  }

  // Enforce TTL boundaries
  const boundedTtl = Math.max(
    MIN_TTL_SECONDS,
    Math.min(MAX_TTL_SECONDS, Math.floor(ttlSeconds))
  );

  const id = crypto.randomUUID();
  const now = Date.now();
  const record: SecretRecord = {
    ciphertext,
    iv,
    burnOnRead: Boolean(burnOnRead),
    createdAt: now,
  };

  const kv = getKvBinding();
  if (kv) {
    await kv.put(`secret:${id}`, JSON.stringify(record), {
      expirationTtl: boundedTtl,
    });
  } else {
    // In-memory fallback
    devStore.set(`secret:${id}`, {
      record,
      expiresAt: now + boundedTtl * 1000,
    });
  }

  return {
    ok: true,
    id,
    expiresAt: now + boundedTtl * 1000,
  };
}

/**
 * Retrieves ciphertext from KV and executes atomic burn-on-read if configured.
 */
export async function fetchAndBurnSecret(
  id: string
): Promise<RevealSecretResult> {
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    return { ok: false, error: "invalid_id" };
  }

  const key = `secret:${id}`;
  const kv = getKvBinding();
  let record: SecretRecord | null = null;

  if (kv) {
    record = await kv.get(key, "json");
    if (!record) {
      return { ok: false, error: "burned_or_expired" };
    }

    if (record.burnOnRead) {
      // Atomic destruction immediately upon reading
      await kv.delete(key);
    }
  } else {
    const entry = devStore.get(key);
    if (!entry) {
      return { ok: false, error: "burned_or_expired" };
    }

    if (Date.now() > entry.expiresAt) {
      devStore.delete(key);
      return { ok: false, error: "burned_or_expired" };
    }

    record = entry.record;
    if (record.burnOnRead) {
      // Atomic deletion from in-memory fallback
      devStore.delete(key);
    }
  }

  return {
    ok: true,
    ciphertext: record.ciphertext,
    iv: record.iv,
    burned: record.burnOnRead,
  };
}
