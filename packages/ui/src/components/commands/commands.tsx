import { ExternalLinkIcon, KeyboardIcon, SearchIcon, SunMoonIcon, type LucideIcon } from "lucide-react";
import { createContext, lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys, type Hotkey } from "../../hooks/use-hotkeys";
import { useZee } from "../../hooks/use-zee";
import { useThemeSwitch } from "../../hooks/use-theme-switch";

const CommandMenu = lazy(() => import("./command-menu"));
const ShortcutsDialog = lazy(() => import("./shortcuts-dialog"));

export type Command = {
  id: string;
  label: string;
  group?: string;
  hotkey?: Hotkey;
  icon?: LucideIcon;
  keywords?: string[];
  run: () => void;
};

type CommandContext = {
  register: (source: { current: Command[] }) => () => void;
  openMenu: () => void;
  openShortcuts: () => void;
};

const Context = createContext<CommandContext | null>(null);

function useCommandContext() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("Command hooks must be used inside <CommandProvider>");
  return ctx;
}

/**
 * Adds commands to the ⌘K menu, the shortcuts dialog and the global hotkeys while
 * the calling component is mounted. Safe to pass a new array on every render.
 */
export function useCommands(commands: Command[]) {
  const { register } = useCommandContext();
  const ref = useRef(commands);

  useEffect(() => {
    ref.current = commands;
  });

  useEffect(() => register(ref), [register]);
}

export function useCommandMenu() {
  const { openMenu, openShortcuts } = useCommandContext();
  return { openMenu, openShortcuts };
}

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const sources = useRef(new Set<{ current: Command[] }>());
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // Commands live in refs, so the dialogs render a snapshot taken when they open.
  const [snapshot, setSnapshot] = useState<Command[]>([]);
  // Bumped on every open so the menu starts fresh instead of animating from the last session.
  const [menuSession, setMenuSession] = useState(0);
  const getCommandsRef = useRef<() => Command[]>(() => []);
  // The dialogs load on first use and then stay mounted, so their close animations still play.
  const [loaded, setLoaded] = useState({ menu: false, shortcuts: false });
  const { theme, toggle: toggleTheme } = useThemeSwitch();
  const { hub } = useZee();

  const show = useCallback((dialog: "menu" | "shortcuts") => {
    setSnapshot(getCommandsRef.current());
    setLoaded((l) => (l[dialog] ? l : { ...l, [dialog]: true }));
    if (dialog === "menu") {
      setMenuSession((n) => n + 1);
      setMenuOpen(true);
    } else setShortcutsOpen(true);
  }, []);

  const builtIns = useMemo<Command[]>(
    () => [
      {
        id: "zee.menu",
        label: "Search or run a command",
        group: "General",
        hotkey: "mod+k",
        icon: SearchIcon,
        run: () => (menuOpen ? setMenuOpen(false) : show("menu")),
      },
      {
        id: "zee.shortcuts",
        label: "Show keyboard shortcuts",
        group: "General",
        hotkey: "?",
        icon: KeyboardIcon,
        run: () => show("shortcuts"),
      },
      {
        id: "zee.theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        group: "General",
        hotkey: "mod+shift+l",
        icon: SunMoonIcon,
        keywords: ["theme", "dark", "light", "appearance"],
        run: () => toggleTheme(),
      },
      {
        id: "zee.hub",
        label: `Open ${new URL(hub).host}`,
        group: "General",
        icon: ExternalLinkIcon,
        keywords: ["home", "tools", "more"],
        run: () => window.open(hub, "_blank", "noopener"),
      },
    ],
    [menuOpen, theme, toggleTheme, show, hub],
  );

  const getCommands = useCallback(
    () => [...[...sources.current].flatMap((source) => source.current), ...builtIns],
    [builtIns],
  );

  useEffect(() => {
    getCommandsRef.current = getCommands;
  });

  useHotkeys(() => getCommands().flatMap((command) => (command.hotkey ? [{ hotkey: command.hotkey, run: command.run }] : [])));

  const ctx = useMemo<CommandContext>(
    () => ({
      register: (source) => {
        sources.current.add(source);
        return () => void sources.current.delete(source);
      },
      openMenu: () => show("menu"),
      openShortcuts: () => show("shortcuts"),
    }),
    [show],
  );

  return (
    <Context.Provider value={ctx}>
      {children}
      <Suspense fallback={null}>
        {loaded.menu && <CommandMenu open={menuOpen} onOpenChange={setMenuOpen} commands={snapshot} session={menuSession} />}
        {loaded.shortcuts && <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} commands={snapshot} />}
      </Suspense>
    </Context.Provider>
  );
}
