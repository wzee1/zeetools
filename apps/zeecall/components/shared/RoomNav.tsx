"use client";

import SidebarItem from "@zeetools/ui/components/brand/sidebar-item";
import CameraIcon from "@zeetools/ui/components/icons/media/camera-icon";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import { useCallSeconds } from "@/hooks/use-call-status";
import { useHashRoom } from "@/hooks/use-hash-room";
import { formatDuration } from "@/lib/format";

/** The sidebar's nav slot: a row that goes back to the create view, and the current room while one is open. */
export default function RoomNav() {
  const room = useHashRoom();
  const seconds = useCallSeconds();

  return (
    <>
      <SidebarItem href="#" icon={<PlusIcon />} active={!room}>
        Create Private Room
      </SidebarItem>
      {room && (
        <SidebarItem
          href={`#room=${room}`}
          icon={<CameraIcon />}
          active
          meta={seconds !== null ? formatDuration(seconds) : undefined}
        >
          Room #{room}
        </SidebarItem>
      )}
    </>
  );
}
