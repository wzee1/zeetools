import type { SecretRecord } from "./types";

// Ambient declarations for the Durable Object runtime (kept here so the app's DOM types stay clean)
interface DurableObjectStorage {
  get<T>(key: string): Promise<T | undefined>;
  put(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<boolean>;
  deleteAll(): Promise<void>;
  setAlarm(scheduledTime: number): Promise<void>;
  deleteAlarm(): Promise<void>;
}

export interface VaultState {
  storage: DurableObjectStorage;
}

export interface StoreRequest {
  record: SecretRecord;
  expiresAt: number;
}

interface StoredEntry {
  record: SecretRecord;
  expiresAt: number;
}

const ENTRY_KEY = "entry";

/** Compares two strings without stopping at the first difference. */
export function verifierMatches(expected: string, given: string): boolean {
  if (expected.length !== given.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * One secret per object, so a secret has exactly one place where it lives and one place where it is burned.
 * (Addressed by the secret id through an EU-jurisdiction namespace, see lib/secret/service.ts.)
 */
export class SecretVault {
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly state: VaultState) {}

  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "POST" && pathname === "/store") {
      const body = (await request.json()) as StoreRequest;
      await this.store(body.record, body.expiresAt);
      return new Response(null, { status: 204 });
    }

    if (request.method === "POST" && pathname === "/take") {
      const { verifier } = (await request.json()) as { verifier?: string };
      const record = await this.take(typeof verifier === "string" ? verifier : "");
      if (record === "wrong_key") return new Response(null, { status: 403 });
      return record ? Response.json(record) : new Response(null, { status: 404 });
    }

    return new Response(null, { status: 404 });
  }

  async store(record: SecretRecord, expiresAt: number): Promise<void> {
    const entry: StoredEntry = { record, expiresAt };
    await this.state.storage.put(ENTRY_KEY, entry);
    // The alarm wipes the object at expiry, so nothing lingers if nobody opens the link.
    await this.state.storage.setAlarm(expiresAt);
  }

  /**
   * Returns the record, or null when it is gone or expired, or "wrong_key" when the verifier does not match
   * (nothing is deleted or returned then). With burnOnRead the delete happens in the same step.
   * Between the read and the delete this awaits only this object's own storage, so the runtime's input gates
   * already keep other requests out; the queue below makes the same promise without relying on them, so a
   * second take can never see the record before the first has deleted it.
   */
  take(verifier: string): Promise<SecretRecord | "wrong_key" | null> {
    const result = this.queue.then(() => this.takeNow(verifier));
    this.queue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  private async takeNow(verifier: string): Promise<SecretRecord | "wrong_key" | null> {
    const entry = await this.state.storage.get<StoredEntry>(ENTRY_KEY);
    if (!entry) return null;

    if (Date.now() >= entry.expiresAt) {
      await this.wipe();
      return null;
    }

    // Compare and delete happen in this one step, so a wrong key can never burn the secret.
    if (!verifierMatches(entry.record.verifier, verifier)) return "wrong_key";

    if (entry.record.burnOnRead) {
      await this.wipe();
    }
    return entry.record;
  }

  async alarm(): Promise<void> {
    await this.wipe();
  }

  private async wipe(): Promise<void> {
    await this.state.storage.deleteAll();
    await this.state.storage.deleteAlarm();
  }
}
