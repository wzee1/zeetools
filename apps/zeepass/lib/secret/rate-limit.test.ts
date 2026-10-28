// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  ip: null as string | null,
  env: {} as Record<string, unknown>,
  noContext: false,
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers(state.ip ? { "cf-connecting-ip": state.ip } : {}),
}));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: () => {
    if (state.noContext) throw new Error("no context");
    return { env: state.env };
  },
}));
const saveSecret = vi.hoisted(() => vi.fn());
const fetchAndBurnSecret = vi.hoisted(() => vi.fn());
vi.mock("./service", () => ({ saveSecret, fetchAndBurnSecret }));

import { createSecretAction, revealSecretAction } from "./actions";
import { isRateLimited, LIMITS, withinRateLimit } from "./rate-limit";

beforeEach(() => {
  vi.useFakeTimers();
  state.ip = "1.2.3.4";
  state.env = {};
  state.noContext = false;
  saveSecret.mockReset().mockResolvedValue({ ok: true, id: "x", expiresAt: 1 });
  fetchAndBurnSecret.mockReset().mockResolvedValue({ ok: true, ciphertext: "c", iv: "i", burned: true });
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const input = { ciphertext: "c", iv: "i", verifier: "v" };

describe("withinRateLimit without the binding", () => {
  it("lets the limit through and stops the next", async () => {
    for (let i = 0; i < LIMITS.create.limit; i++) expect(await withinRateLimit("create", undefined, "ip:a")).toBe(true);
    expect(await withinRateLimit("create", undefined, "ip:a")).toBe(false);
  });

  it("counts each key, and each limit, on its own", async () => {
    for (let i = 0; i <= LIMITS.create.limit; i++) await withinRateLimit("create", undefined, "ip:b");
    expect(await withinRateLimit("create", undefined, "ip:b")).toBe(false);
    expect(await withinRateLimit("create", undefined, "ip:c")).toBe(true);
    expect(await withinRateLimit("reveal", undefined, "ip:b")).toBe(true);
  });

  it("starts over once the minute has passed", async () => {
    for (let i = 0; i <= LIMITS.create.limit; i++) await withinRateLimit("create", undefined, "ip:d");
    expect(await withinRateLimit("create", undefined, "ip:d")).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(await withinRateLimit("create", undefined, "ip:d")).toBe(true);
  });
});

describe("withinRateLimit with the binding", () => {
  it("asks Cloudflare for the key and follows the answer", async () => {
    const limit = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    expect(await withinRateLimit("reveal", { limit }, "ip:a")).toBe(true);
    expect(await withinRateLimit("reveal", { limit }, "ip:a")).toBe(false);
    expect(limit).toHaveBeenCalledWith({ key: "ip:a" });
  });

  it("lets the request through, and logs without the visitor data, when the limiter fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = { limit: () => Promise.reject(new Error("down for ip:9.9.9.9")) };
    expect(await withinRateLimit("reveal", failing, "ip:9.9.9.9")).toBe(true);
    expect(error).toHaveBeenCalledOnce();
    expect(JSON.stringify(error.mock.calls)).not.toContain("9.9.9.9");
  });
});

describe("isRateLimited", () => {
  it("does not limit a request without cf-connecting-ip", async () => {
    state.ip = null;
    const limit = vi.fn().mockResolvedValue({ success: false });
    state.env = { CREATE_LIMITER: { limit } };
    expect(await isRateLimited("create")).toBe(false);
    expect(limit).not.toHaveBeenCalled();
  });

  it("uses the binding of the limit asked for, keyed by IP", async () => {
    const create = vi.fn().mockResolvedValue({ success: true });
    const reveal = vi.fn().mockResolvedValue({ success: false });
    state.env = { CREATE_LIMITER: { limit: create }, REVEAL_LIMITER: { limit: reveal } };
    expect(await isRateLimited("create")).toBe(false);
    expect(await isRateLimited("reveal")).toBe(true);
    expect(create).toHaveBeenCalledWith({ key: "ip:1.2.3.4" });
    expect(reveal).toHaveBeenCalledWith({ key: "ip:1.2.3.4" });
  });

  it("falls back to memory when there is no Cloudflare context or binding", async () => {
    state.noContext = true;
    for (let i = 0; i < LIMITS.reveal.limit; i++) expect(await isRateLimited("reveal")).toBe(false);
    expect(await isRateLimited("reveal")).toBe(true);
  });
});

describe("the actions", () => {
  it("pass a request under the limit to the service", async () => {
    state.env = { CREATE_LIMITER: { limit: async () => ({ success: true }) }, REVEAL_LIMITER: { limit: async () => ({ success: true }) } };
    expect((await createSecretAction(input)).ok).toBe(true);
    expect((await revealSecretAction("a".repeat(36), "v")).ok).toBe(true);
  });

  it("refuse create over the limit without touching the vault", async () => {
    state.env = { CREATE_LIMITER: { limit: async () => ({ success: false }) } };
    expect(await createSecretAction(input)).toEqual({ ok: false, error: "You've created a lot of secrets in a short time. Please wait a minute and try again." });
    expect(saveSecret).not.toHaveBeenCalled();
  });

  it("refuse reveal over the limit without touching the vault, so nothing burns", async () => {
    state.env = { REVEAL_LIMITER: { limit: async () => ({ success: false }) } };
    expect(await revealSecretAction("a".repeat(36), "v")).toEqual({ ok: false, error: "server_error" });
    expect(fetchAndBurnSecret).not.toHaveBeenCalled();
  });

  it("keep the two limits apart", async () => {
    state.env = { CREATE_LIMITER: { limit: async () => ({ success: false }) }, REVEAL_LIMITER: { limit: async () => ({ success: true }) } };
    expect((await revealSecretAction("a".repeat(36), "v")).ok).toBe(true);
  });

  it("serve the request when the limiter throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    state.env = { CREATE_LIMITER: { limit: () => Promise.reject(new Error("down")) } };
    expect((await createSecretAction(input)).ok).toBe(true);
    expect(saveSecret).toHaveBeenCalledOnce();
  });
});
