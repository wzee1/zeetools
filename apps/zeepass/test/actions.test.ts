import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSecretAction, revealSecretAction } from "@/app/actions";
import { _resetDevStore } from "@/lib/secret/service";
import { bufferToBase64Url } from "@/lib/utils/formatters";

describe("Server Actions (createSecretAction & revealSecretAction)", () => {
  beforeEach(() => {
    _resetDevStore();
  });

  const validIv = bufferToBase64Url(new Uint8Array(12).fill(7).buffer);
  const sampleCiphertext = bufferToBase64Url(
    new TextEncoder().encode("encrypted-payload-sample").buffer
  );

  it("successfully creates a secret and returns UUID and expiresAt", async () => {
    const res = await createSecretAction({
      ciphertext: sampleCiphertext,
      iv: validIv,
      ttlSeconds: 3600,
      burnOnRead: true,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(res.expiresAt).toBeGreaterThan(Date.now());
    }
  });

  it("enforces atomic burn-on-read destruction on first fetch", async () => {
    const createRes = await createSecretAction({
      ciphertext: sampleCiphertext,
      iv: validIv,
      burnOnRead: true,
    });

    expect(createRes.ok).toBe(true);
    if (!createRes.ok) return;

    // First fetch: should succeed and mark burned
    const firstReveal = await revealSecretAction(createRes.id);
    expect(firstReveal.ok).toBe(true);
    if (firstReveal.ok) {
      expect(firstReveal.ciphertext).toBe(sampleCiphertext);
      expect(firstReveal.iv).toBe(validIv);
      expect(firstReveal.burned).toBe(true);
    }

    // Second fetch: must return burned_or_expired
    const secondReveal = await revealSecretAction(createRes.id);
    expect(secondReveal.ok).toBe(false);
    if (!secondReveal.ok) {
      expect(secondReveal.error).toBe("burned_or_expired");
    }
  });

  it("persists secret across multiple reads when burnOnRead is false", async () => {
    const createRes = await createSecretAction({
      ciphertext: sampleCiphertext,
      iv: validIv,
      burnOnRead: false,
    });

    expect(createRes.ok).toBe(true);
    if (!createRes.ok) return;

    const firstReveal = await revealSecretAction(createRes.id);
    expect(firstReveal.ok).toBe(true);
    if (firstReveal.ok) {
      expect(firstReveal.burned).toBe(false);
    }

    const secondReveal = await revealSecretAction(createRes.id);
    expect(secondReveal.ok).toBe(true);
  });

  it("rejects IV with invalid byte count", async () => {
    // 8-byte IV instead of 12 bytes
    const shortIv = bufferToBase64Url(new Uint8Array(8).buffer);

    const res = await createSecretAction({
      ciphertext: sampleCiphertext,
      iv: shortIv,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/Invalid IV/i);
    }
  });

  it("rejects payload exceeding 256 KB", async () => {
    // Generate buffer of 260 KB
    const largeBuffer = new Uint8Array(260 * 1024).buffer;
    const oversizedCiphertext = bufferToBase64Url(largeBuffer);

    const res = await createSecretAction({
      ciphertext: oversizedCiphertext,
      iv: validIv,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/Payload too large/i);
    }
  });

  it("returns invalid_id for malformed secret IDs", async () => {
    const res = await revealSecretAction("not-a-valid-uuid");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe("invalid_id");
    }
  });

  describe("expiry without a KV binding", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("treats a secret as gone after its lifetime, even with burnOnRead off", async () => {
      vi.useFakeTimers();
      const created = await createSecretAction({
        ciphertext: sampleCiphertext,
        iv: validIv,
        ttlSeconds: 3600,
        burnOnRead: false,
      });
      if (!created.ok) throw new Error("create failed");

      vi.advanceTimersByTime(3600 * 1000 - 1);
      expect((await revealSecretAction(created.id)).ok).toBe(true);

      vi.advanceTimersByTime(2);
      expect(await revealSecretAction(created.id)).toEqual({
        ok: false,
        error: "burned_or_expired",
      });
    });
  });
});
