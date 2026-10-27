import { base64UrlToBuffer, bufferToBase64Url } from "../utils/formatters";

export interface EncryptedPayload {
  ciphertext: string; // Base64URL encoded
  iv: string;         // Base64URL encoded (12 bytes)
}

export interface DecryptOptions {
  ciphertext: string;
  iv: string;
  rawKeyBase64: string;
}

function getSubtleCrypto(): SubtleCrypto {
  const cryptoObj = typeof window !== "undefined" && window.crypto ? window.crypto : globalThis.crypto;
  if (!cryptoObj?.subtle) {
    throw new Error("Web Crypto API (crypto.subtle) is not available in this environment.");
  }
  return cryptoObj.subtle;
}

function getRandomValues(array: Uint8Array): Uint8Array {
  const cryptoObj = typeof window !== "undefined" && window.crypto ? window.crypto : globalThis.crypto;
  if (!cryptoObj?.getRandomValues) {
    throw new Error("Web Crypto API (crypto.getRandomValues) is not available in this environment.");
  }
  return cryptoObj.getRandomValues(array);
}

/** A key is 32 bytes, which is 43 unpadded base64url characters. */
export const KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/**
 * Hash of the key that lets the server tell a mistyped link from the right one without learning the key.
 * It does not weaken the encryption: the key is 256 random bits, so a SHA-256 hash of it (domain-separated
 * by the prefix, never reused as a key) cannot be reversed or guessed, and it is the only thing the server sees.
 */
export async function computeKeyVerifier(keyBase64: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const data = new TextEncoder().encode(`zeepass-verify:${keyBase64}`);
  return bufferToBase64Url(await subtle.digest("SHA-256", data));
}

/**
 * Generates an ephemeral 256-bit AES-GCM symmetric key.
 */
export async function generateSecretKey(): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  return await subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Exports a CryptoKey to an unpadded URL-safe Base64 string.
 */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const subtle = getSubtleCrypto();
  const exported = await subtle.exportKey("raw", key);
  return bufferToBase64Url(exported);
}

/**
 * Imports an unpadded URL-safe Base64 key string into a CryptoKey for decryption.
 */
export async function importKeyFromBase64(base64Key: string): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const buffer = base64UrlToBuffer(base64Key);
  return await subtle.importKey(
    "raw",
    buffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
}

/**
 * Encrypts plaintext locally with AES-GCM-256 and a random 12-byte initialization vector.
 */
export async function encryptSecret(plaintext: string, key: CryptoKey): Promise<EncryptedPayload> {
  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  const iv = getRandomValues(new Uint8Array(12));

  const encryptedBuffer = await subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64Url(encryptedBuffer),
    iv: bufferToBase64Url(iv.buffer as ArrayBuffer),
  };
}

/**
 * Decrypts ciphertext locally using the imported AES key and 12-byte IV.
 */
export async function decryptSecret(options: DecryptOptions): Promise<string> {
  const subtle = getSubtleCrypto();
  const key = await importKeyFromBase64(options.rawKeyBase64);
  const ivBuffer = base64UrlToBuffer(options.iv);
  const cipherBuffer = base64UrlToBuffer(options.ciphertext);

  const decryptedBuffer = await subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) as BufferSource },
    key,
    cipherBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
