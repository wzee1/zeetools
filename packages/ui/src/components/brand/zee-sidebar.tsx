"use client";

import { PanelLeft } from "lucide-react";
import { Suspense } from "react";
import { useCommands } from "../commands/commands";
import { useZee } from "../../hooks/use-zee";
import { useShell } from "../../hooks/use-shell";
import SidebarContent from "./sidebar-content";
import SidebarResizer from "./sidebar-resizer";

interface ZeeSidebarProps {
  /** Rows under the top bar (see `SidebarItem`). */
  nav?: React.ReactNode;
  /** An optional titled section below the nav (see `SidebarGroup`). */
  group?: React.ReactNode;
}

/**
 * The app shell's sidebar, from the shell breakpoint up. Its width is --sidebar-w (set before paint
 * by the boot script, then by the resizer); hiding it animates the width down to a gutter while the
 * content slides and fades out at a fixed width, so nothing reflows mid-way (styles/tokens.css, .shell-*).
 */
export default function ZeeSidebar({ nav, group }: ZeeSidebarProps) {
  const { name } = useZee();
  const { collapsed, toggle } = useShell();

  useCommands([
    {
      id: `${name}.sidebar`,
      label: collapsed ? "Show sidebar" : "Hide sidebar",
      group: "General",
      hotkey: "[",
      icon: PanelLeft,
      keywords: ["sidebar", "panel", "collapse", "expand"],
      run: toggle,
    },
  ]);

  return (
    <aside className="shell-aside relative hidden shrink-0 shell:block" data-enter="sidebar">
      <div className="shell-aside-inner h-full px-3 py-3" inert={collapsed}>
        {/* Slots may read the URL (useSearchParams), which needs a boundary for the static render. */}
        <Suspense>
          <SidebarContent nav={nav} group={group} />
        </Suspense>
      </div>
      {!collapsed && <SidebarResizer />}
    </aside>
  );
}
