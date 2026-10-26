"use client";

import SidebarItem from "@zeetools/ui/components/brand/sidebar-item";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import { useHashRoom } from "@/hooks/use-hash-room";

/** The sidebar's nav slot: the row that opens the create view. The rooms themselves are listed in the group below. */
export default function RoomNav() {
  const room = useHashRoom();
  return (
    <SidebarItem href="#" icon={<PlusIcon />} active={!room}>
      Create Private Room
    </SidebarItem>
  );
}
