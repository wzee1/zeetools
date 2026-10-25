"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Suspense, useState } from "react";
import MenuIcon from "../icons/navigation/menu-icon";
import ThemeIcon from "../icons/system/theme-icon";
import Button from "../ui/actions/button";
import { useThemeSwitch } from "../../hooks/use-theme-switch";
import { useZee } from "../../hooks/use-zee";
import { interactive, springSnappy } from "../../lib/motion";
import SidebarContent from "./sidebar-content";
import ZeeMark from "./zee-mark";

// As in the sidebar: the mark animates from its parent's hover state.
const MotionLink = motion.create(Link);

interface ZeeMobileBarProps {
  /** The same slots as the sidebar: the drawer shows the same content. */
  nav?: React.ReactNode;
  group?: React.ReactNode;
}

/**
 * Below the shell breakpoint the sidebar folds into this bar: the product on the left; on the right the
 * theme switch and a menu button that slides the same sidebar in as a drawer, which closes after a pick.
 */
export default function ZeeMobileBar({ nav, group }: ZeeMobileBarProps) {
  const zee = useZee();
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useThemeSwitch();

  return (
    <div className="flex h-14 items-center justify-between px-4 shell:hidden">
      <MotionLink
        {...interactive}
        variants={{ rest: { scale: 1 }, hover: { scale: 1 }, tap: { scale: 0.96 } }}
        transition={springSnappy}
        href="/"
        className="flex items-center gap-2.5 rounded-control text-sm font-medium text-foreground"
      >
        <ZeeMark className="size-6" />
        <span>{zee.name}</span>
      </MotionLink>
      <div className="flex items-center gap-1">
        <Button
          data-theme-toggle
          variant="ghost"
          size="icon"
          onClick={(e) => toggle(e.detail ? { x: e.clientX, y: e.clientY } : undefined)}
          aria-label="Switch theme"
        >
          {theme && <ThemeIcon theme={theme === "dark" ? "dark" : "light"} />}
        </Button>
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>
            <Button variant="secondary" size="icon" aria-label="Open menu">
              <MenuIcon />
            </Button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 data-[state=closed]:animate-[fade-out_220ms_var(--ease-out)_forwards] data-[state=open]:animate-[fade-in_260ms_var(--ease-out)]" />
            <DialogPrimitive.Content
              aria-describedby={undefined}
              tabIndex={-1}
              // Focus the drawer itself, not its first button: a focused button would pop its tooltip open.
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).focus();
              }}
              className="fixed inset-y-0 left-0 z-50 outline-none w-72 max-w-[85vw] border-r border-border bg-background px-3 py-3 data-[state=closed]:animate-[sheet-out_220ms_var(--ease-out)_forwards] data-[state=open]:animate-[sheet-in_320ms_var(--ease-out)]"
            >
              <DialogPrimitive.Title className="sr-only">{zee.name}</DialogPrimitive.Title>
              <Suspense>
                <SidebarContent nav={nav} group={group} onNavigate={() => setOpen(false)} />
              </Suspense>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </div>
  );
}
