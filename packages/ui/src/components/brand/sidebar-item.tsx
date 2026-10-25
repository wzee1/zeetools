"use client";

import Link from "next/link";
import { useSidebar } from "../../hooks/use-sidebar";
import { sidebarItemClass } from "../../lib/sidebar";
import { cn } from "../../lib/utils";

interface SidebarItemProps {
  /** A path, or a `#fragment` for in-page state (rendered as a plain anchor, see below). */
  href: string;
  /** Usually one of the icons from components/icons; it is sized by the row. */
  icon: React.ReactNode;
  /** Marks the current page. */
  active?: boolean;
  /** A quiet value at the right edge of the row, such as a count or a time left. */
  meta?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * A row for the sidebar's `nav` slot. Closes the phone drawer after a pick.
 * A `#` href renders a plain anchor: Next's `Link` turns a hash-only navigation into a `pushState`
 * that never fires `hashchange`, so apps that keep state in the URL fragment would not see the click.
 */
export default function SidebarItem({ href, icon, active = false, meta, children }: SidebarItemProps) {
  const { onNavigate } = useSidebar();
  const props = { onClick: onNavigate, "aria-current": active ? ("page" as const) : undefined, className: sidebarItemClass(active) };
  const content = (
    <>
      {icon}
      <span className={cn("truncate", meta !== undefined && "min-w-0 flex-1")}>{children}</span>
      {meta !== undefined && <span className="shrink-0 font-mono text-xs text-muted tabular-nums">{meta}</span>}
    </>
  );
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} {...props}>
      {content}
    </Link>
  );
}
