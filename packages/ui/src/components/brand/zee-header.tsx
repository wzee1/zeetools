"use client";

import { motion } from "motion/react";
import { useCommandMenu } from "../commands/commands";
import SearchIcon from "../icons/navigation/search-icon";
import KeyboardIcon from "../icons/system/keyboard-icon";
import ThemeIcon from "../icons/system/theme-icon";
import Button from "../ui/actions/button";
import Kbd from "../ui/display/kbd";
import { Tooltip } from "../ui/overlays/tooltip";
import { useThemeSwitch } from "../../hooks/use-theme-switch";
import { useZee } from "../../hooks/use-zee";
import { interactive, springSnappy } from "../../lib/motion";
import PrivacyBadge from "./privacy-badge";
import ZeeMark from "./zee-mark";

export default function ZeeHeader() {
  const zee = useZee();
  const { openMenu, openShortcuts } = useCommandMenu();
  const { theme, toggle } = useThemeSwitch();

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
          <motion.a
            {...interactive}
            variants={{ rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 0.96 } }}
            transition={springSnappy}
            href={zee.hub}
            className="group flex items-center gap-2 rounded-control font-semibold"
          >
            <ZeeMark className="size-6 shrink-0" />
            <span className="hidden text-muted transition-colors duration-200 ease-out group-hover:text-foreground sm:inline">
              {new URL(zee.hub).host}
            </span>
          </motion.a>
          <span aria-hidden className="hidden text-border-strong sm:inline">
            /
          </span>
          <span aria-current="page" className="truncate font-semibold">
            {zee.name}
          </span>
        </nav>

        <motion.button
          {...interactive}
          variants={{ rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 0.985 } }}
          transition={springSnappy}
          onClick={openMenu}
          className="mx-auto hidden h-8 w-full max-w-sm cursor-pointer items-center gap-2 rounded-control border border-border bg-panel px-2.5 text-muted transition-[border-color,background-color,color] duration-200 ease-out hover:border-border-strong hover:bg-surface-raised hover:text-foreground md:flex"
        >
          <SearchIcon className="size-4" />
          <span className="flex-1 text-left">Search or run a command…</span>
          <Kbd hotkey="mod+k" />
        </motion.button>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {zee.localOnly && <PrivacyBadge />}
          <Tooltip label="Search or run a command" hotkey="mod+k">
            <Button variant="ghost" size="icon" onClick={openMenu} className="md:hidden" aria-label="Search or run a command">
              <SearchIcon />
            </Button>
          </Tooltip>
          <Tooltip label="Keyboard shortcuts" hotkey="?">
            <Button variant="ghost" size="icon" onClick={openShortcuts} aria-label="Keyboard shortcuts">
              <KeyboardIcon />
            </Button>
          </Tooltip>
          <Tooltip label="Switch theme" hotkey="mod+shift+l">
            <Button
              data-theme-toggle
              variant="ghost"
              size="icon"
              onClick={(e) => toggle(e.detail ? { x: e.clientX, y: e.clientY } : undefined)}
              aria-label="Switch theme"
            >
              {/* Rendered after hydration only, so the first paint never shows the wrong icon. */}
              {theme && <ThemeIcon theme={theme === "dark" ? "dark" : "light"} />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
