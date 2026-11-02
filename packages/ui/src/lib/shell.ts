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
 * Runs in <head> before first paint, and does two things on <html>:
 *
 * - Applies the saved sidebar state, so the shell renders at its final size instead of jumping once
 *   React reads localStorage.
 * - Marks `data-instant` when the visitor is coming back to the app: a reload, back/forward, or a link
 *   from the same origin. Chrome keeps the previous page's last frame (the app itself) on screen until
 *   the new page paints, so a preloader there reads as app, loader, app. With the flag the preloader
 *   and the entrance are skipped (styles/tokens.css); first visits keep both.
 */
export function shellBootScript(key: string): string {
  return `(function(){var d=document.documentElement;try{var n=performance.getEntriesByType("navigation")[0],t=n&&n.type,r=document.referrer;if(t==="reload"||t==="back_forward"||(r&&new URL(r).origin===location.origin))d.dataset.instant=""}catch(e){}try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(key)})||"null");if(!s)return;if(s.collapsed)d.dataset.sidebar="collapsed";if(typeof s.width==="number")d.style.setProperty("--sidebar-w",Math.min(${SIDEBAR.max},Math.max(${SIDEBAR.min},s.width))+"px")}catch(e){}})()`;
}
