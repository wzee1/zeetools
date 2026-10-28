"use server";

import { isRateLimited } from "./rate-limit";
import { fetchAndBurnSecret, saveSecret } from "./service";
import type {
  CreateSecretInput,
  CreateSecretResult,
  RevealSecretResult,
} from "./types";

/**
 * Server Action to store an encrypted secret payload in its Durable Object.
 * Zero plaintext or decryption keys are transmitted or received.
 * Limited per IP (see rate-limit.ts).
 */
export async function createSecretAction(
  input: CreateSecretInput
): Promise<CreateSecretResult> {
  try {
    // Over the limit: the form shows this as its error toast.
    if (await isRateLimited("create")) {
      return { ok: false, error: "You've created a lot of secrets in a short time. Please wait a minute and try again." };
    }
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
    // Checked before the vault is called, so a refused request burns nothing.
    if (await isRateLimited("reveal")) {
      return { ok: false, error: "server_error" };
    }
    return await fetchAndBurnSecret(id, verifier);
  } catch (error) {
    console.error("Failed to reveal secret action:", error);
    return { ok: false, error: "server_error" };
  }
}
