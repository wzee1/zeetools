/** Sidebar width limits in px, and the default. The minimum is the narrowest width where every label still fits on one line. */
export const SIDEBAR = { min: 232, max: 360, default: 248 } as const;

/** Dragging this far past the minimum hides the sidebar instead of stopping at the limit. */
export const COLLAPSE_SLOP = 56;

/** The localStorage key for an app's sidebar state: its name plus `:shell`, such as `zeepass:shell`. */
export function shellKey(name: string): string {
  return `${name}:shell`;
}

export interface ShellState {
  collapsed: boolean;
  width: number;
}

export const DEFAULT_SHELL: ShellState = { collapsed: false, width: SIDEBAR.default };

export function clampSidebarWidth(width: number): number {
  if (!Number.isFinite(width)) return SIDEBAR.default;
  return Math.round(Math.min(SIDEBAR.max, Math.max(SIDEBAR.min, width)));
}

/**
 * Runs in <head> before first paint: applies the saved sidebar state to <html>, so the shell renders
 * at its final size instead of jumping once React reads localStorage.
 */
export function shellBootScript(key: string): string {
  return `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(key)})||"null");if(!s)return;var d=document.documentElement;if(s.collapsed)d.dataset.sidebar="collapsed";if(typeof s.width==="number")d.style.setProperty("--sidebar-w",Math.min(${SIDEBAR.max},Math.max(${SIDEBAR.min},s.width))+"px")}catch(e){}})()`;
}
