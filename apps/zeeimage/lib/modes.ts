export type AppMode = "batch" | "favicon" | "social";

export interface ModeDef {
  id: AppMode;
  label: string;
  /** Batch is the root; the other modes live in the query string, so a mode survives a reload. */
  href: string;
}

export const MODES: readonly ModeDef[] = [
  { id: "batch", label: "Batch Pipeline", href: "/" },
  { id: "favicon", label: "Favicon Studio", href: "/?mode=favicon" },
  { id: "social", label: "Social Safe-Zones", href: "/?mode=social" },
];

/** Reads `?mode=`. Anything missing or unknown is the batch pipeline. */
export function parseMode(value: string | null | undefined): AppMode {
  return MODES.find((mode) => mode.id === value)?.id ?? "batch";
}
