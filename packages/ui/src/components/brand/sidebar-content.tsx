"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useCommandMenu } from "../commands/commands";
import SidebarIcon from "../icons/navigation/sidebar-icon";
import SearchIcon from "../icons/navigation/search-icon";
import ShieldCheckIcon from "../icons/status/shield-check-icon";
import KeyboardIcon from "../icons/system/keyboard-icon";
import ThemeIcon from "../icons/system/theme-icon";
import Button from "../ui/actions/button";
import { Tooltip } from "../ui/overlays/tooltip";
import { SidebarContext } from "../../hooks/use-sidebar";
import { useShell } from "../../hooks/use-shell";
import { useThemeSwitch } from "../../hooks/use-theme-switch";
import { useZee } from "../../hooks/use-zee";
import { interactive, springSnappy } from "../../lib/motion";
import { sidebarItemClass } from "../../lib/sidebar";
import ZeeMark from "./zee-mark";

// The mark animates from its parent's hover state (as in the header), so the brand link is a Motion element.
const MotionLink = motion.create(Link);

interface SidebarContentProps {
  /** Rows under the top bar, such as `SidebarItem`s. */
  nav?: React.ReactNode;
  /** An optional titled section between the nav and the footer, such as a `SidebarGroup` holding a history. */
  group?: React.ReactNode;
  /** Marks the phone drawer: it closes the drawer after a pick, and the hide-sidebar button (desktop only) is left out. */
  onNavigate?: () => void;
}

/**
 * Everything the sidebar holds, for the desktop aside and the phone drawer alike: the product and the
 * view controls, then the app's own `nav` rows and `group`, then the privacy and suite links.
 */
export default function SidebarContent({ nav, group, onNavigate }: SidebarContentProps) {
  const zee = useZee();
  const { openMenu, openShortcuts } = useCommandMenu();
  const { theme, toggle } = useThemeSwitch();
  const { setCollapsed } = useShell();

  return (
    <SidebarContext.Provider value={{ onNavigate }}>
      <div className="flex h-full flex-col">
        <div className="flex h-10 items-center justify-between gap-2 pl-1.5">
          <MotionLink
            {...interactive}
            variants={{ rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 0.96 } }}
            transition={springSnappy}
            href="/"
            onClick={onNavigate}
            className="flex min-w-0 items-center gap-2.5 rounded-control text-sm font-medium text-foreground"
          >
            <ZeeMark className="size-6 shrink-0" />
            <span className="truncate">{zee.name}</span>
          </MotionLink>
          <div className="flex shrink-0 items-center">
            <Tooltip label="Search or run a command" hotkey="mod+k">
              <Button variant="ghost" size="icon" onClick={openMenu} aria-label="Search or run a command">
                <SearchIcon />
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
                {theme && <ThemeIcon theme={theme === "dark" ? "dark" : "light"} />}
              </Button>
            </Tooltip>
            {!onNavigate && (
              <Tooltip label="Hide sidebar" hotkey="[">
                <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)} aria-label="Hide sidebar">
                  <SidebarIcon />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        <nav aria-label="Main" className="mt-6">
          {nav}
        </nav>

        <div className="mt-8 flex min-h-0 flex-1 flex-col">{group}</div>

        <div className="mt-4">
          <a href={`${zee.hub}/privacy`} target="_blank" rel="noopener noreferrer" className={sidebarItemClass()}>
            <ShieldCheckIcon className="text-primary-text" />
            <span className="truncate">Privacy & GDPR Notice</span>
          </a>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 pl-2.5">
            <p className="min-w-0 text-xs leading-relaxed text-muted">
              Part of the{" "}
              {/* Underlined, not just a different colour: a link inside a sentence must not rely on colour alone. */}
              <a
                href={zee.hub}
                className="text-foreground underline decoration-border-strong underline-offset-2 transition-colors duration-200 ease-out hover:text-primary-text hover:decoration-primary-text"
              >
                {new URL(zee.hub).host}
              </a>{" "}
              suite
            </p>
            <div className="flex shrink-0 items-center">
              <Tooltip label="Keyboard shortcuts" hotkey="?">
                <Button variant="ghost" size="icon" onClick={openShortcuts} aria-label="Keyboard shortcuts">
                  <KeyboardIcon />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
