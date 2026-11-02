"use client";

import { usePathname, useSearchParams } from "next/navigation";
import SidebarItem from "@zeetools/ui/components/brand/sidebar-item";
import CropIcon from "@zeetools/ui/components/icons/actions/crop-icon";
import ImageIcon from "@zeetools/ui/components/icons/media/image-icon";
import SparklesIcon from "@zeetools/ui/components/icons/system/sparkles-icon";
import { useBatchCount } from "@/hooks/use-batch-count";
import { MODES, parseMode, type AppMode } from "@/lib/modes";

const ICONS: Record<AppMode, React.ComponentType> = {
  batch: ImageIcon,
  favicon: SparklesIcon,
  social: CropIcon,
};

/** The sidebar's nav slot: one row per mode. The current mode is the active row; Batch carries the queue length. */
export default function ModeNav() {
  // Modes live on the tool's page; on any other page (the FAQ) no row is current.
  const onTool = usePathname() === "/";
  const current = parseMode(useSearchParams().get("mode"));
  const count = useBatchCount();

  return (
    <>
      {MODES.map((mode) => {
        const Icon = ICONS[mode.id];
        return (
          <SidebarItem
            key={mode.id}
            href={mode.href}
            icon={<Icon />}
            active={onTool && current === mode.id}
            meta={mode.id === "batch" && count > 0 ? count : undefined}
          >
            {mode.label}
          </SidebarItem>
        );
      })}
    </>
  );
}
