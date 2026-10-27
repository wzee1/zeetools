// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SecretRecord } from "./types";
import { SecretVault, type VaultState } from "./vault";

/** Fake Durable Object storage: async like the real one, with the alarm kept in a field. */
function fakeState() {
  const data = new Map<string, unknown>();
  const alarm: { at: number | null } = { at: null };
  const state: VaultState = {
    storage: {
      get: async <T>(key: string) => data.get(key) as T | undefined,
      put: async (key, value) => {
        data.set(key, value);
      },
      delete: async (key) => data.delete(key),
      deleteAll: async () => data.clear(),
      setAlarm: async (at) => {
        alarm.at = at;
      },
      deleteAlarm: async () => {
        alarm.at = null;
      },
    },
  };
  return { state, data, alarm };
}

const VERIFIER = "v".repeat(43);
const WRONG = "w".repeat(43);

const record = (burnOnRead: boolean): SecretRecord => ({
  ciphertext: "opaque",
  iv: "iv",
  verifier: VERIFIER,
  burnOnRead,
  createdAt: 1000,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1000);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SecretVault", () => {
  it("returns a stored record and sets the alarm at its expiry", async () => {
    const { state, alarm } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(false), 5000);
    expect(alarm.at).toBe(5000);
    expect(await vault.take(VERIFIER)).toEqual(record(false));
  });

  it("gives a burn-on-read secret to exactly one of two concurrent takes", async () => {
    const { state, data } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(true), 5000);

    // The fake storage has no input gates, so this only passes because the vault runs takes one at a time.
    const results = await Promise.all([vault.take(VERIFIER), vault.take(VERIFIER)]);
    expect(results.filter((r) => r !== null)).toHaveLength(1);
    expect(data.size).toBe(0);
  });

  it("keeps a record that is not burn-on-read for repeated reads", async () => {
    const { state } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(false), 5000);
    expect(await vault.take(VERIFIER)).not.toBeNull();
    expect(await vault.take(VERIFIER)).not.toBeNull();
  });

  it("does not return an expired record", async () => {
    const { state, data } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(false), 5000);
    vi.setSystemTime(5000);
    expect(await vault.take(VERIFIER)).toBeNull();
    expect(data.size).toBe(0);
  });

  it("deletes everything when the alarm fires", async () => {
    const { state, data, alarm } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(false), 5000);
    await vault.alarm();
    expect(data.size).toBe(0);
    expect(alarm.at).toBeNull();
    expect(await vault.take(VERIFIER)).toBeNull();
  });

  it("serves store and take over fetch", async () => {
    const { state } = fakeState();
    const vault = new SecretVault(state);
    const stored = await vault.fetch(
      new Request("https://vault/store", {
        method: "POST",
        body: JSON.stringify({ record: record(true), expiresAt: 5000 }),
      })
    );
    expect(stored.status).toBe(204);

    const first = await vault.fetch(new Request("https://vault/take", { method: "POST", body: JSON.stringify({ verifier: VERIFIER }) }));
    expect(await first.json()).toEqual(record(true));
    const second = await vault.fetch(new Request("https://vault/take", { method: "POST", body: JSON.stringify({ verifier: VERIFIER }) }));
    expect(second.status).toBe(404);
  });

  it("leaves a burn-on-read record untouched on a wrong verifier, and still gives it to the right one", async () => {
    const { state, data } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(true), 5000);

    expect(await vault.take(WRONG)).toBe("wrong_key");
    expect(await vault.take("")).toBe("wrong_key");
    expect(data.size).toBe(1);

    expect(await vault.take(VERIFIER)).toEqual(record(true));
    expect(data.size).toBe(0);
    expect(await vault.take(VERIFIER)).toBeNull();
  });

  it("gives a burn-on-read secret to exactly one of several concurrent takes with the right verifier", async () => {
    const { state } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(true), 5000);

    const results = await Promise.all([
      vault.take(VERIFIER),
      vault.take(WRONG),
      vault.take(VERIFIER),
      vault.take(VERIFIER),
    ]);
    expect(results.filter((r) => typeof r === "object" && r !== null)).toHaveLength(1);
    // The wrong one is queued after the first take, which already burned the record.
    expect(results[1]).toBeNull();
  });

  it("answers 403 over fetch for a wrong verifier and keeps the record", async () => {
    const { state, data } = fakeState();
    const vault = new SecretVault(state);
    await vault.store(record(true), 5000);
    const res = await vault.fetch(
      new Request("https://vault/take", { method: "POST", body: JSON.stringify({ verifier: WRONG }) })
    );
    expect(res.status).toBe(403);
    expect(data.size).toBe(1);
  });
});
