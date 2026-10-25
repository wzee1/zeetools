import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BellIcon as LucideBell, PlusIcon as LucidePlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { toast } from "sonner";
import { useCommandMenu, useCommands } from "../src/components/commands/commands";
import DownloadIcon from "../src/components/icons/actions/download-icon";
import PlusIcon from "../src/components/icons/actions/plus-icon";
import BellIcon from "../src/components/icons/status/bell-icon";
import Button from "../src/components/ui/actions/button";
import Kbd from "../src/components/ui/display/kbd";
import Textarea from "../src/components/ui/forms/textarea";
import { useIdbStore, useLocalStore } from "../src/hooks/use-local-store";
import { downloadText, setDragOutData } from "../src/lib/export";
import { springSnappy } from "../src/lib/motion";

const meta = { title: "Patterns" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function CommandsDemo() {
  const { openMenu, openShortcuts } = useCommandMenu();
  useCommands([
    { id: "story.toast", label: "Show a test toast", group: "Story", hotkey: "t", icon: LucideBell, run: () => toast("Test toast") },
    { id: "story.add", label: "Add a file", group: "Story", hotkey: "mod+shift+i", icon: LucidePlus, run: () => toast.success("Added a file") },
  ]);
  return (
    <div className="grid max-w-xl gap-3">
      <p className="text-muted">
        This story registers two commands with <code>useCommands</code>. They show up in the menu and the shortcuts dialog, and their hotkeys
        work: try <Kbd hotkey="t" /> or <Kbd hotkey="mod+shift+i" />.
      </p>
      <div className="flex gap-2">
        <Button onClick={openMenu}>
          Command menu <Kbd hotkey="mod+k" />
        </Button>
        <Button onClick={openShortcuts}>
          Shortcuts <Kbd hotkey="?" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notify" onClick={() => toast("Test toast")}>
          <BellIcon />
        </Button>
      </div>
    </div>
  );
}

export const CommandMenu: Story = { render: () => <CommandsDemo /> };

function StorageDemo() {
  const [count, setCount] = useLocalStore("zee:story-count", 0);
  const [note, setNote, ready] = useIdbStore("zee:story-note", "");
  return (
    <div className="grid max-w-xl gap-4">
      <div className="flex items-center gap-3">
        <Button size="icon" aria-label="Increment" onClick={() => setCount((n) => n + 1)}>
          <PlusIcon />
        </Button>
        <span className="tabular-nums">
          Counter:{" "}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.strong
              key={count}
              initial={{ y: -8, opacity: 0, filter: "blur(2px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: 8, opacity: 0, filter: "blur(2px)" }}
              transition={springSnappy}
              className="inline-block"
            >
              {count}
            </motion.strong>
          </AnimatePresence>
        </span>
        <Button variant="ghost" size="sm" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>
      <p className="text-muted">useLocalStore: open this story in a second tab and the counter stays in sync.</p>
      <Textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={!ready} placeholder={ready ? "Type a note, then reload" : "Loading…"} />
      <p className="text-muted">useIdbStore: the note is saved to IndexedDB and restored on reload.</p>
    </div>
  );
}

export const LocalStorage: Story = { render: () => <StorageDemo /> };

function ExportDemo() {
  const dragUrl = useRef<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={() => downloadText("Hello from zee\n", "hello.txt")}>
        <DownloadIcon />
        Download hello.txt
      </Button>
      <span
        draggable
        onDragStart={(e) => {
          dragUrl.current = URL.createObjectURL(new Blob(["Dragged out of zee\n"], { type: "text/plain" }));
          setDragOutData(e, dragUrl.current, "dragged.txt", "text/plain");
        }}
        onDragEnd={() => dragUrl.current && URL.revokeObjectURL(dragUrl.current)}
        className="cursor-grab rounded-control border border-dashed border-border-strong px-3 py-1.5 text-muted transition-[border-color,color] duration-200 ease-out hover:border-primary hover:text-foreground active:cursor-grabbing"
      >
        Drag me to your desktop (Chromium)
      </span>
    </div>
  );
}

export const Export: Story = { render: () => <ExportDemo /> };
