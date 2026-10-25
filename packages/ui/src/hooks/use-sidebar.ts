"use client";

import { createContext, useContext } from "react";

export interface SidebarContextValue {
  /** Set inside the phone drawer: call it after a navigation so the drawer closes. */
  onNavigate?: () => void;
}

export const SidebarContext = createContext<SidebarContextValue>({});

/** What the sidebar's slots need to know about where they render (the desktop aside or the phone drawer). */
export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext);
}
