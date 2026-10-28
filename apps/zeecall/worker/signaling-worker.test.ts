import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { joinLimit, withinRateLimit, type RateLimitBinding } from "./rate-limit";
import worker from "./signaling-worker";

function upgrade(ip?: string) {
  const headers: Record<string, string> = { Upgrade: "websocket" };
  if (ip) headers["cf-connecting-ip"] = ip;
  return new Request("https://signaling.wzee.dev/?room=r&peerId=p", { headers });
}

function setup(limiter?: RateLimitBinding) {
  const roomFetch = vi.fn().mockResolvedValue(new Response("room"));
  const ROOMS = { idFromName: vi.fn(() => ({ toString: () => "id" })), get: vi.fn(() => ({ fetch: roomFetch })) };
  return { env: { ROOMS, JOIN_LIMITER: limiter }, ROOMS, roomFetch };
}

describe("withinRateLimit outside a Worker", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it(`lets ${joinLimit} attempts through a minute and stops the next`, async () => {
    for (let i = 0; i < joinLimit; i++) expect(await withinRateLimit(undefined, "ip:a")).toBe(true);
    expect(await withinRateLimit(undefined, "ip:a")).toBe(false);
  });

  it("counts each key on its own", async () => {
    for (let i = 0; i <= joinLimit; i++) await withinRateLimit(undefined, "ip:b");
    expect(await withinRateLimit(undefined, "ip:b")).toBe(false);
    expect(await withinRateLimit(undefined, "ip:c")).toBe(true);
  });

  it("starts over once the minute has passed", async () => {
    for (let i = 0; i <= joinLimit; i++) await withinRateLimit(undefined, "ip:d");
    expect(await withinRateLimit(undefined, "ip:d")).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(await withinRateLimit(undefined, "ip:d")).toBe(true);
  });
});

describe("withinRateLimit in a Worker", () => {
  afterEach(() => vi.restoreAllMocks());

  it("asks the binding for the key and follows its answer", async () => {
    const limit = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false });
    const limiter = { limit };
    expect(await withinRateLimit(limiter, "ip:a")).toBe(true);
    expect(await withinRateLimit(limiter, "ip:a")).toBe(false);
    expect(limit).toHaveBeenCalledWith({ key: "ip:a" });
  });

  it("lets the request through, and logs without the visitor data, when the limiter fails", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = { limit: () => Promise.reject(new Error("limiter down for ip:9.9.9.9")) };
    expect(await withinRateLimit(failing, "ip:9.9.9.9")).toBe(true);
    expect(error).toHaveBeenCalledOnce();
    expect(JSON.stringify(error.mock.calls)).not.toContain("9.9.9.9");
  });
});

describe("signaling worker", () => {
  afterEach(() => vi.restoreAllMocks());

  it("passes an upgrade under the limit to the room", async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    const { env, ROOMS, roomFetch } = setup({ limit });
    const res = await worker.fetch(upgrade("1.2.3.4"), env);
    expect(await res.text()).toBe("room");
    expect(limit).toHaveBeenCalledWith({ key: "ip:1.2.3.4" });
    expect(ROOMS.get).toHaveBeenCalledOnce();
    expect(roomFetch).toHaveBeenCalledOnce();
  });

  it("answers 429 over the limit and never touches the Durable Object", async () => {
    const { env, ROOMS, roomFetch } = setup({ limit: vi.fn().mockResolvedValue({ success: false }) });
    const res = await worker.fetch(upgrade("1.2.3.4"), env);
    expect(res.status).toBe(429);
    expect(ROOMS.idFromName).not.toHaveBeenCalled();
    expect(ROOMS.get).not.toHaveBeenCalled();
    expect(roomFetch).not.toHaveBeenCalled();
  });

  it("counts each IP separately", async () => {
    const limit = vi.fn(async ({ key }: { key: string }) => ({ success: key !== "ip:1.1.1.1" }));
    const { env } = setup({ limit });
    expect((await worker.fetch(upgrade("1.1.1.1"), env)).status).toBe(429);
    expect((await worker.fetch(upgrade("2.2.2.2"), env)).status).toBe(200);
  });

  it("lets the upgrade through when the limiter throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { env, roomFetch } = setup({ limit: () => Promise.reject(new Error("down")) });
    expect((await worker.fetch(upgrade("1.2.3.4"), env)).status).toBe(200);
    expect(roomFetch).toHaveBeenCalledOnce();
  });

  it("uses the in-memory fallback without a binding, and keeps health checks out of the limit", async () => {
    const { env, roomFetch } = setup(undefined);
    for (let i = 0; i < joinLimit; i++) expect((await worker.fetch(upgrade("7.7.7.7"), env)).status).toBe(200);
    expect((await worker.fetch(upgrade("7.7.7.7"), env)).status).toBe(429);
    expect(roomFetch).toHaveBeenCalledTimes(joinLimit);
    expect((await worker.fetch(new Request("https://signaling.wzee.dev/health"), env)).status).toBe(200);
  });
});
