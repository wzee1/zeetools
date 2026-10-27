"use server";

import { fetchAndBurnSecret, saveSecret } from "./service";
import type {
  CreateSecretInput,
  CreateSecretResult,
  RevealSecretResult,
} from "./types";

/**
 * Server Action to store an encrypted secret payload in its Durable Object.
 * Zero plaintext or decryption keys are transmitted or received.
 */
export async function createSecretAction(
  input: CreateSecretInput
): Promise<CreateSecretResult> {
  try {
    return await saveSecret(input);
  } catch (error) {
    console.error("Failed to create secret action:", error);
    return { ok: false, error: "An unexpected server error occurred." };
  }
}

/**
 * Server Action to retrieve ciphertext and execute atomic burn-on-read.
 * Protected against crawler/scraper prefetching since Server Actions require POST.
 */
export async function revealSecretAction(
  id: string,
  verifier: string
): Promise<RevealSecretResult> {
  try {
    return await fetchAndBurnSecret(id, verifier);
  } catch (error) {
    console.error("Failed to reveal secret action:", error);
    return { ok: false, error: "server_error" };
  }
}
