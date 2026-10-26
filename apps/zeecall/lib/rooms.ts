// The rooms this browser opened, for the sidebar's "On this device" list (localStorage["zeecall:rooms"]).
// Only the slug and when it was opened are kept: never names, notes or files.

export interface StoredRoom {
  slug: string;
  openedAt: number; // epoch ms
}

export const ROOMS_KEY = "zeecall:rooms";

/** The list keeps the most recent rooms only. */
export const MAX_ROOMS = 20;

/** Puts the room first (once), so the list stays newest-first. */
export function addRoom(rooms: StoredRoom[], slug: string, now: number): StoredRoom[] {
  return [{ slug, openedAt: now }, ...rooms.filter((r) => r.slug !== slug)].slice(0, MAX_ROOMS);
}

export function removeRoom(rooms: StoredRoom[], slug: string): StoredRoom[] {
  return rooms.filter((r) => r.slug !== slug);
}
