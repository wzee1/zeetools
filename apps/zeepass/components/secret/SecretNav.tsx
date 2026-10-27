"use client";

import { usePathname, useSearchParams } from "next/navigation";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import SidebarItem from "@zeetools/ui/components/brand/sidebar-item";

/** The sidebar's nav slot: one row that goes back to the create form. */
export default function SecretNav() {
  const pathname = usePathname();
  const selectedId = useSearchParams().get("secret");
  return (
    <SidebarItem href="/" icon={<PlusIcon />} active={pathname === "/" && !selectedId}>
      Create a New Secret
    </SidebarItem>
  );
}
