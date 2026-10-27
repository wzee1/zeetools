import { describe, expect, it } from "vitest";
import {
  decryptSecret,
  encryptSecret,
  exportKeyToBase64,
  generateSecretKey,
  importKeyFromBase64,
} from "./engine";

describe("crypto engine (AES-GCM 256)", () => {
  it("generates, exports, and imports 256-bit AES-GCM keys", async () => {
    const key = await generateSecretKey();
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe("AES-GCM");

    const exported = await exportKeyToBase64(key);
    expect(typeof exported).toBe("string");
    expect(exported.length).toBeGreaterThan(0);
    // Must be URL-safe (no +, /, or =)
    expect(exported).not.toMatch(/[+/=]/);

    const imported = await importKeyFromBase64(exported);
    expect(imported).toBeDefined();
    expect(imported.algorithm.name).toBe("AES-GCM");
  });

  it("encrypts and decrypts simple text payloads", async () => {
    const plaintext = "my-super-secret-password-1234!";
    const key = await generateSecretKey();
    const keyBase64 = await exportKeyToBase64(key);

    const payload = await encryptSecret(plaintext, key);
    expect(payload.ciphertext).toBeDefined();
    expect(payload.iv).toBeDefined();
    expect(payload.ciphertext).not.toMatch(/[+/=]/);
    expect(payload.iv).not.toMatch(/[+/=]/);

    const decrypted = await decryptSecret({
      ciphertext: payload.ciphertext,
      iv: payload.iv,
      rawKeyBase64: keyBase64,
    });

    expect(decrypted).toBe(plaintext);
  });

  it("handles multi-line .env blocks and Unicode characters", async () => {
    const envFile = `
DATABASE_URL="postgresql://user:p%40ssw0rd@db.internal:5432/production?sslmode=require"
API_KEY=example_key_928347109283471928374
STRIPE_SECRET="example_secret_9283471092834710928347"
SPECIAL_NOTE="Árvíztűrő tükörfúrógép 🔒💥🚀"
`.trim();

    const key = await generateSecretKey();
    const keyBase64 = await exportKeyToBase64(key);

    const payload = await encryptSecret(envFile, key);
    const decrypted = await decryptSecret({
      ciphertext: payload.ciphertext,
      iv: payload.iv,
      rawKeyBase64: keyBase64,
    });

    expect(decrypted).toBe(envFile);
  });

  it("fails decryption if ciphertext is tampered with", async () => {
    const plaintext = "sensitive-token";
    const key = await generateSecretKey();
    const keyBase64 = await exportKeyToBase64(key);

    const payload = await encryptSecret(plaintext, key);

    // Tamper with ciphertext by flipping characters
    const tamperedCiphertext =
      payload.ciphertext.slice(0, -2) + (payload.ciphertext.slice(-2) === "AA" ? "BB" : "AA");

    await expect(
      decryptSecret({
        ciphertext: tamperedCiphertext,
        iv: payload.iv,
        rawKeyBase64: keyBase64,
      })
    ).rejects.toThrow();
  });

  it("fails decryption when provided with the wrong key", async () => {
    const plaintext = "sensitive-token";
    const key1 = await generateSecretKey();
    const key2 = await generateSecretKey();
    const wrongKeyBase64 = await exportKeyToBase64(key2);

    const payload = await encryptSecret(plaintext, key1);

    await expect(
      decryptSecret({
        ciphertext: payload.ciphertext,
        iv: payload.iv,
        rawKeyBase64: wrongKeyBase64,
      })
    ).rejects.toThrow();
  });
});
