"use client";

import SidebarIcon from "../icons/navigation/sidebar-icon";
import Button from "../ui/actions/button";
import { Tooltip } from "../ui/overlays/tooltip";
import { useShell } from "../../hooks/use-shell";

/**
 * Brings a hidden sidebar back, from the panel's top-left corner. It is always rendered and shown by
 * CSS from html[data-sidebar=collapsed], so it is right before React has even read localStorage.
 */
export default function SidebarExpandButton() {
  const { setCollapsed } = useShell();
  return (
    <div className="shell-expand absolute top-3 left-3 z-10 hidden shell:block">
      <Tooltip label="Show sidebar" hotkey="[">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} aria-label="Show sidebar">
          <SidebarIcon />
        </Button>
      </Tooltip>
    </div>
  );
}
