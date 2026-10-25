"use client";

import { useId } from "react";

interface SidebarGroupProps {
  /** The group's heading, for example "On this device". */
  title: string;
  /** Overrides the generated id of the heading (the section is labelled by it). */
  id?: string;
  children: React.ReactNode;
}

/** A titled section for the sidebar's `group` slot. It takes the space between the nav and the footer; put a scrolling list in it. */
export default function SidebarGroup({ title, id, children }: SidebarGroupProps) {
  const generated = useId();
  const headingId = id ?? generated;
  return (
    <section aria-labelledby={headingId} className="flex min-h-0 flex-1 flex-col">
      <h2 id={headingId} className="px-2.5 text-xs text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
