"use client";

import { usePathname } from "next/navigation";
import SidebarItem from "@zeetools/ui/components/brand/sidebar-item";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import { useHashRoom } from "@/hooks/use-hash-room";

/** The sidebar's nav slot: the row that opens the create view. The rooms themselves are listed in the group below. */
export default function RoomNav() {
  const room = useHashRoom();
  // Rooms live in the hash of the tool's page, so from any other page (the FAQ) the row goes back to "/".
  const onTool = usePathname() === "/";
  return (
    <SidebarItem href={onTool ? "#" : "/"} icon={<PlusIcon />} active={onTool && !room}>
      Create Private Room
    </SidebarItem>
  );
}
