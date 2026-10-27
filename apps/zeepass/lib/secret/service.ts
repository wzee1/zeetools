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

interface VaultStub {
  fetch(request: Request): Promise<Response>;
}

interface VaultNamespace {
  jurisdiction(jurisdiction: "eu"): {
    idFromName(name: string): unknown;
    get(id: unknown): VaultStub;
  };
}

/** Local in-memory store for next dev, vitest, and non-Cloudflare environments */
const devStore = new Map<string, { record: SecretRecord; expiresAt: number }>();

/** Internal helper for unit tests to reset memory store */
export function _resetDevStore(): void {
  devStore.clear();
}

/**
 * Resolves the vault stub of one secret; undefined in dev/test runners that have no SECRETS binding.
 * The EU jurisdiction pins the object, and so its storage, to the EU.
 */
function getVault(id: string): VaultStub | undefined {
  let namespace: VaultNamespace | undefined;
  try {
    namespace = (getCloudflareContext().env as { SECRETS?: VaultNamespace })
      .SECRETS;
  } catch {
    return undefined;
  }
  if (!namespace) return undefined;
  // Not inside the try: with a binding present, a failure must surface instead of falling back to memory.
  const eu = namespace.jurisdiction("eu");
  return eu.get(eu.idFromName(id));
}

/**
 * Validates and saves an encrypted secret in its own Durable Object, which wipes it at expiry.
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

  const vault = getVault(id);
  if (vault) {
    const res = await vault.fetch(
      new Request("https://vault/store", {
        method: "POST",
        body: JSON.stringify({ record, expiresAt: now + boundedTtl * 1000 }),
      })
    );
    if (!res.ok) {
      return { ok: false, error: "Could not store the secret." };
    }
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
 * Takes the ciphertext out of its vault; with burn-on-read the vault deletes it in the same atomic step.
 */
export async function fetchAndBurnSecret(
  id: string
): Promise<RevealSecretResult> {
  if (!id || typeof id !== "string" || !/^[0-9a-fA-F-]{36}$/.test(id)) {
    return { ok: false, error: "invalid_id" };
  }

  const key = `secret:${id}`;
  const vault = getVault(id);
  let record: SecretRecord | null = null;

  if (vault) {
    const res = await vault.fetch(
      new Request("https://vault/take", { method: "POST" })
    );
    if (res.status === 404) {
      return { ok: false, error: "burned_or_expired" };
    }
    if (!res.ok) {
      return { ok: false, error: "server_error" };
    }
    record = (await res.json()) as SecretRecord;
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
      // Deletion from the in-memory fallback
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
