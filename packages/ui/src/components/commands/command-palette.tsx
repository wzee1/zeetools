import { Command as Cmdk } from "cmdk";
import { motion } from "motion/react";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import Kbd from "../ui/display/kbd";
import { springSnappy } from "../../lib/motion";
import type { Command } from "./commands";
import { groupBy } from "./group-commands";

const value = (command: Command) => `${command.label} ${command.keywords?.join(" ") ?? ""}`.trim();

/** Remounted on every open (keyed by session), so the search and selection always start fresh. */
export default function CommandPalette({ onOpenChange, commands, session }: { onOpenChange: (open: boolean) => void; commands: Command[]; session: number }) {
  const runnable = commands.filter((command) => command.id !== "zee.menu");
  const [selected, setSelected] = useState("");

  return (
    <Cmdk loop value={selected} onValueChange={setSelected} className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4">
        <SearchIcon className="size-4 text-muted" />
        <Cmdk.Input placeholder="Search or run a command…" className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close command menu"
          className="cursor-pointer rounded-[5px] transition-opacity duration-200 ease-out hover:opacity-70"
        >
          <Kbd hotkey="escape" />
        </button>
      </div>
      {/* cmdk measures content only; add the list's own padding so the last item isn't clipped. */}
      <Cmdk.List className="h-[calc(var(--cmdk-list-height)+1rem)] max-h-80 overflow-y-auto p-2 transition-[height] duration-300 ease-out">
        <Cmdk.Empty className="px-3 py-8 text-center text-muted">No commands match your search.</Cmdk.Empty>
        {groupBy(runnable).map(([group, items]) => (
          <Cmdk.Group
            key={group}
            heading={group}
            className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pt-2 **:[[cmdk-group-heading]]:pb-1 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted"
          >
            {items.map((command) => (
              <Cmdk.Item
                key={command.id}
                value={value(command)}
                onSelect={() => {
                  onOpenChange(false);
                  command.run();
                }}
                className="group/item relative flex h-9 cursor-pointer items-center gap-2.5 rounded-control px-2"
              >
                {selected === value(command) && (
                  <motion.span
                    layoutId={`command-highlight-${session}`}
                    transition={springSnappy}
                    className="absolute inset-0 rounded-control bg-surface"
                  />
                )}
                {command.icon && (
                  <command.icon className="relative size-4 text-muted transition-colors duration-200 ease-out group-data-[selected=true]/item:text-foreground" />
                )}
                <span className="relative flex-1">{command.label}</span>
                {command.hotkey && <Kbd hotkey={command.hotkey} className="relative" />}
              </Cmdk.Item>
            ))}
          </Cmdk.Group>
        ))}
      </Cmdk.List>
    </Cmdk>
  );
}
