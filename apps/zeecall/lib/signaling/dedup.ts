/**
 * Remembers the ids of the last messages taken. The client mirrors every message to the worker and to the
 * same-browser channel, so a peer in the same browser gets each one twice; the second copy is dropped here.
 */
export function createSeenFilter(limit = 256) {
  const seen = new Set<string>();
  return {
    /** True the first time an id is offered, false for every repeat. */
    isNew(id: string): boolean {
      if (seen.has(id)) return false;
      seen.add(id);
      if (seen.size > limit) seen.delete(seen.values().next().value as string);
      return true;
    },
    clear: () => seen.clear(),
  };
}
