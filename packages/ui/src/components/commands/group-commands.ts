import type { Command } from "./commands";

/** Commands grouped by their `group` (default "Actions"), in first-seen order. */
export function groupBy(commands: Command[]) {
  const groups = new Map<string, Command[]>();
  for (const command of commands) {
    const group = command.group ?? "Actions";
    groups.set(group, [...(groups.get(group) ?? []), command]);
  }
  return [...groups];
}
