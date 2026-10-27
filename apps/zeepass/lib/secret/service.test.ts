// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bufferToBase64Url } from "@/lib/utils/formatters";
import type { SecretRecord } from "./types";

const vaultMock = vi.hoisted(() => ({
  entries: new Map<string, { record: SecretRecord; expiresAt: number }>(),
  jurisdiction: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => ({
    env: { SECRETS: { jurisdiction: vaultMock.jurisdiction } },
  }),
}));

import { fetchAndBurnSecret, saveSecret } from "./service";

const verifier = "v".repeat(43);
const iv = bufferToBase64Url(new Uint8Array(12).fill(1).buffer);
const ciphertext = bufferToBase64Url(new TextEncoder().encode("opaque").buffer);

beforeEach(() => {
  vaultMock.entries.clear();
  // A stand-in for the vault objects: one entry per id, burned on take when the record says so.
  vaultMock.jurisdiction.mockReset().mockImplementation(() => ({
    idFromName: (name: string) => name,
    get: (id: string) => ({
      fetch: async (request: Request) => {
        vaultMock.fetch(id, new URL(request.url).pathname);
        if (new URL(request.url).pathname === "/store") {
          vaultMock.entries.set(id, await request.json());
          return new Response(null, { status: 204 });
        }
        const entry = vaultMock.entries.get(id);
        if (!entry) return new Response(null, { status: 404 });
        const { verifier: given } = (await request.json()) as { verifier: string };
        if (given !== entry.record.verifier) return new Response(null, { status: 403 });
        if (entry.record.burnOnRead) vaultMock.entries.delete(id);
        return Response.json(entry.record);
      },
    }),
  }));
  vaultMock.fetch.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("saveSecret with a vault binding", () => {
  it.each([
    ["1 hour", 3600],
    ["24 hours", 86400],
    ["7 days", 604800],
  ])("stores the %s option as an expiry time", async (_label, ttlSeconds) => {
    const res = await saveSecret({ ciphertext, iv, verifier, ttlSeconds });
    if (!res.ok) throw new Error("save failed");
    const entry = vaultMock.entries.get(res.id);
    expect(entry?.expiresAt).toBe(res.expiresAt);
    expect(res.expiresAt - entry!.record.createdAt).toBe(ttlSeconds * 1000);
  });

  it("addresses the vault by secret id in the EU jurisdiction", async () => {
    const res = await saveSecret({ ciphertext, iv, verifier });
    if (!res.ok) throw new Error("save failed");
    expect(vaultMock.jurisdiction).toHaveBeenCalledWith("eu");
    expect(vaultMock.fetch).toHaveBeenCalledWith(res.id, "/store");
  });

  it("clamps the TTL to 5 minutes .. 7 days", async () => {
    const short = await saveSecret({ ciphertext, iv, verifier, ttlSeconds: 1 });
    const long = await saveSecret({ ciphertext, iv, verifier, ttlSeconds: 10 * 604800 });
    if (!short.ok || !long.ok) throw new Error("save failed");
    expect(short.expiresAt - vaultMock.entries.get(short.id)!.record.createdAt).toBe(300_000);
    expect(long.expiresAt - vaultMock.entries.get(long.id)!.record.createdAt).toBe(604_800_000);
  });

  it("defaults to burn-on-read with a 24 hour lifetime", async () => {
    const res = await saveSecret({ ciphertext, iv, verifier });
    if (!res.ok) throw new Error("save failed");
    const entry = vaultMock.entries.get(res.id)!;
    expect(entry.record.burnOnRead).toBe(true);
    expect(entry.expiresAt - entry.record.createdAt).toBe(86_400_000);
  });

  it("stores only ciphertext, iv, key verifier, burn flag and creation time", async () => {
    const res = await saveSecret({ ciphertext, iv, verifier, burnOnRead: false });
    if (!res.ok) throw new Error("save failed");
    expect(Object.keys(vaultMock.entries.get(res.id)!.record).sort()).toEqual([
      "burnOnRead",
      "ciphertext",
      "createdAt",
      "iv",
      "verifier",
    ]);
  });
});

describe("fetchAndBurnSecret with a vault binding", () => {
  it("returns the record once when burnOnRead is set", async () => {
    const saved = await saveSecret({ ciphertext, iv, verifier, burnOnRead: true });
    if (!saved.ok) throw new Error("save failed");

    const first = await fetchAndBurnSecret(saved.id, verifier);
    expect(first).toMatchObject({ ok: true, ciphertext, iv, burned: true });
    expect(vaultMock.fetch).toHaveBeenCalledWith(saved.id, "/take");

    expect(await fetchAndBurnSecret(saved.id, verifier)).toEqual({ ok: false, error: "burned_or_expired" });
  });

  it("keeps the record until its expiry when burnOnRead is off", async () => {
    const saved = await saveSecret({ ciphertext, iv, verifier, burnOnRead: false });
    if (!saved.ok) throw new Error("save failed");

    expect(await fetchAndBurnSecret(saved.id, verifier)).toMatchObject({ ok: true, burned: false });
    expect(await fetchAndBurnSecret(saved.id, verifier)).toMatchObject({ ok: true, burned: false });
  });
});

describe("key verifier", () => {
  it.each(["", "short", "v".repeat(44), "v".repeat(42) + "+"])("rejects the verifier %j", async (bad) => {
    const res = await saveSecret({ ciphertext, iv, verifier: bad });
    expect(res.ok).toBe(false);
    expect(vaultMock.entries.size).toBe(0);
  });

  it("stores the verifier in the record", async () => {
    const saved = await saveSecret({ ciphertext, iv, verifier });
    if (!saved.ok) throw new Error("save failed");
    expect(vaultMock.entries.get(saved.id)?.record.verifier).toBe(verifier);
  });

  it("passes wrong_key through and leaves the secret takeable", async () => {
    const saved = await saveSecret({ ciphertext, iv, verifier, burnOnRead: true });
    if (!saved.ok) throw new Error("save failed");
    expect(await fetchAndBurnSecret(saved.id, "w".repeat(43))).toEqual({ ok: false, error: "wrong_key" });
    expect(await fetchAndBurnSecret(saved.id, verifier)).toMatchObject({ ok: true, burned: true });
  });
});
