"use client";

import { AnimatePresence, motion } from "motion/react";
import SidebarGroup from "@zeetools/ui/components/brand/sidebar-group";
import CameraIcon from "@zeetools/ui/components/icons/media/camera-icon";
import CloseIcon from "@zeetools/ui/components/icons/actions/close-icon";
import { useSidebar } from "@zeetools/ui/hooks/use-sidebar";
import { sidebarItemClass } from "@zeetools/ui/lib/sidebar";
import { useCallStatus } from "@/hooks/use-call-status";
import { useHashRoom } from "@/hooks/use-hash-room";
import { useRoomHistory } from "@/hooks/use-room-history";
import { formatDuration } from "@/lib/format";

const ease = [0.32, 0.72, 0, 1] as const;

/**
 * The sidebar's group slot: the rooms this browser opened (localStorage, newest first). The room open in
 * the panel is the current row; the one with a live call shows its elapsed time. The cross forgets a room
 * on this device. Rows are plain hash links, so the page sees the room change (see SidebarItem).
 */
export default function RoomHistory() {
  const current = useHashRoom();
  const call = useCallStatus();
  const { rooms, remove } = useRoomHistory();
  const { onNavigate } = useSidebar();

  return (
    <SidebarGroup title="On this device" id="rooms-heading">
      {rooms.length === 0 ? (
        <p className="mt-2 px-2.5 text-xs leading-relaxed text-muted/80">Rooms you open stay listed here until you remove them.</p>
      ) : (
        <ul className="mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          <AnimatePresence initial={false}>
            {rooms.map((room) => {
              const active = current === room.slug;
              const live = call?.room === room.slug;
              return (
                <motion.li
                  key={room.slug}
                  layout
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.25, ease }}
                  className="group relative"
                >
                  <a
                    href={`#room=${room.slug}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={sidebarItemClass(active, "pr-9")}
                  >
                    <CameraIcon />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">{room.slug}</span>
                    {live && (
                      <span className="shrink-0 font-mono text-xs text-muted tabular-nums" title="Call in progress">
                        {formatDuration(call.seconds)}
                      </span>
                    )}
                  </a>
                  <button
                    type="button"
                    onClick={() => remove(room.slug)}
                    aria-label={`Remove ${room.slug} from this device`}
                    className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-control text-muted opacity-0 transition-[opacity,color,background-color] duration-200 ease-out group-hover:opacity-100 hover:bg-foreground/[0.06] hover:text-foreground focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </SidebarGroup>
  );
}
