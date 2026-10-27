export interface SecretRecord {
  ciphertext: string;
  iv: string;
  burnOnRead: boolean;
  createdAt: number;
}

export interface CreateSecretInput {
  ciphertext: string;
  iv: string;
  ttlSeconds?: number;
  burnOnRead?: boolean;
}

export type CreateSecretResult =
  | { ok: true; id: string; expiresAt: number }
  | { ok: false; error: string };

export type RevealSecretResult =
  | { ok: true; ciphertext: string; iv: string; burned: boolean }
  | { ok: false; error: "burned_or_expired" | "invalid_id" | "server_error" };
