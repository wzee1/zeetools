"use client";

import { useCallback } from "react";
import { useLocalStore } from "@zeetools/ui/hooks/use-local-store";
import { addRoom, removeRoom, ROOMS_KEY, type StoredRoom } from "@/lib/rooms";

/** The rooms this browser opened (newest first), synced across tabs and components. */
export function useRoomHistory() {
  const [rooms, setRooms] = useLocalStore<StoredRoom[]>(ROOMS_KEY, []);
  const remember = useCallback((slug: string) => setRooms((prev) => addRoom(prev, slug, Date.now())), [setRooms]);
  const remove = useCallback((slug: string) => setRooms((prev) => removeRoom(prev, slug)), [setRooms]);
  return { rooms, remember, remove };
}
