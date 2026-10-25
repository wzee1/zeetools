import Kbd from "../ui/display/kbd";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/overlays/dialog";
import type { Command } from "./commands";
import { groupBy } from "./group-commands";

// The `?` shortcuts dialog. CommandProvider loads this module on first open, so the dialog code
// stays out of the initial bundle.

type Props = { open: boolean; onOpenChange: (open: boolean) => void; commands: Command[] };

export default function ShortcutsDialog({ open, onOpenChange, commands }: Props) {
  const withHotkeys = commands.filter((command) => command.hotkey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>Single-key shortcuts are paused while you type in a field.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-3">
          {groupBy(withHotkeys).map(([group, items]) => (
            <section key={group} className="py-2">
              <h3 className="mb-1 text-xs font-medium text-muted">{group}</h3>
              <ul>
                {items.map((command) => (
                  <li
                    key={command.id}
                    className="-mx-2 flex h-9 items-center justify-between rounded-control px-2 transition-colors duration-200 ease-out hover:bg-surface"
                  >
                    {command.label}
                    <Kbd hotkey={command.hotkey!} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
