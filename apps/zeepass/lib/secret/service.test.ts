// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bufferToBase64Url } from "@/lib/utils/formatters";

const kvMock = vi.hoisted(() => ({
  store: new Map<string, string>(),
  put: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({ env: { SECRETS_KV: kvMock } }),
}));

import { fetchAndBurnSecret, saveSecret } from "./service";

const iv = bufferToBase64Url(new Uint8Array(12).fill(1).buffer);
const ciphertext = bufferToBase64Url(new TextEncoder().encode("opaque").buffer);

beforeEach(() => {
  kvMock.store.clear();
  kvMock.put.mockReset().mockImplementation(async (key: string, value: string) => {
    kvMock.store.set(key, value);
  });
  kvMock.get.mockReset().mockImplementation(async (key: string) => {
    const raw = kvMock.store.get(key);
    return raw ? JSON.parse(raw) : null;
  });
  kvMock.delete.mockReset().mockImplementation(async (key: string) => {
    kvMock.store.delete(key);
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("saveSecret with a KV binding", () => {
  it.each([
    ["1 hour", 3600],
    ["24 hours", 86400],
    ["7 days", 604800],
  ])("maps the %s option to the KV expirationTtl", async (_label, ttlSeconds) => {
    const res = await saveSecret({ ciphertext, iv, ttlSeconds });
    expect(res.ok).toBe(true);
    expect(kvMock.put).toHaveBeenCalledTimes(1);
    expect(kvMock.put.mock.calls[0][2]).toEqual({ expirationTtl: ttlSeconds });
  });

  it("clamps the TTL to 5 minutes .. 7 days", async () => {
    await saveSecret({ ciphertext, iv, ttlSeconds: 1 });
    await saveSecret({ ciphertext, iv, ttlSeconds: 10 * 604800 });
    expect(kvMock.put.mock.calls[0][2]).toEqual({ expirationTtl: 300 });
    expect(kvMock.put.mock.calls[1][2]).toEqual({ expirationTtl: 604800 });
  });

  it("defaults to burn-on-read with a 24 hour lifetime", async () => {
    await saveSecret({ ciphertext, iv });
    const record = JSON.parse(kvMock.put.mock.calls[0][1]);
    expect(record.burnOnRead).toBe(true);
    expect(kvMock.put.mock.calls[0][2]).toEqual({ expirationTtl: 86400 });
  });

  it("stores only ciphertext, iv, burn flag and creation time", async () => {
    await saveSecret({ ciphertext, iv, burnOnRead: false });
    const record = JSON.parse(kvMock.put.mock.calls[0][1]);
    expect(Object.keys(record).sort()).toEqual(["burnOnRead", "ciphertext", "createdAt", "iv"]);
  });
});

describe("fetchAndBurnSecret with a KV binding", () => {
  it("deletes the record on first read when burnOnRead is set", async () => {
    const saved = await saveSecret({ ciphertext, iv, burnOnRead: true });
    if (!saved.ok) throw new Error("save failed");

    const first = await fetchAndBurnSecret(saved.id);
    expect(first).toMatchObject({ ok: true, ciphertext, iv, burned: true });
    expect(kvMock.delete).toHaveBeenCalledWith(`secret:${saved.id}`);

    expect(await fetchAndBurnSecret(saved.id)).toEqual({ ok: false, error: "burned_or_expired" });
  });

  it("keeps the record until its TTL when burnOnRead is off", async () => {
    const saved = await saveSecret({ ciphertext, iv, burnOnRead: false });
    if (!saved.ok) throw new Error("save failed");

    expect(await fetchAndBurnSecret(saved.id)).toMatchObject({ ok: true, burned: false });
    expect(kvMock.delete).not.toHaveBeenCalled();
    expect(await fetchAndBurnSecret(saved.id)).toMatchObject({ ok: true, burned: false });
  });
});
