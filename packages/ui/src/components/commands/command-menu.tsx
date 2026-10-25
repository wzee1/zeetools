import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/overlays/dialog";
import CommandPalette from "./command-palette";
import type { Command } from "./commands";

// The ⌘K menu. CommandProvider loads this module on first open, so cmdk and the dialog code
// stay out of the initial bundle.

type Props = { open: boolean; onOpenChange: (open: boolean) => void; commands: Command[]; session: number };

export default function CommandMenu({ open, onOpenChange, commands, session }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="overflow-hidden p-0">
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <DialogDescription className="sr-only">Search for a command and press Enter to run it.</DialogDescription>
        <CommandPalette key={session} onOpenChange={onOpenChange} commands={commands} session={session} />
      </DialogContent>
    </Dialog>
  );
}
