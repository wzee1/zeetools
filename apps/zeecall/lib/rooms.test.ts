import { describe, expect, it } from "vitest";
import { addRoom, MAX_ROOMS, removeRoom, type StoredRoom } from "@/lib/rooms";

describe("room history", () => {
  it("adds a room first and keeps one entry per slug", () => {
    let rooms: StoredRoom[] = [];
    rooms = addRoom(rooms, "quiet-sync-101", 1);
    rooms = addRoom(rooms, "clear-wave-202", 2);
    rooms = addRoom(rooms, "quiet-sync-101", 3);
    expect(rooms).toEqual([
      { slug: "quiet-sync-101", openedAt: 3 },
      { slug: "clear-wave-202", openedAt: 2 },
    ]);
  });

  it("keeps the most recent rooms only", () => {
    let rooms: StoredRoom[] = [];
    for (let i = 0; i < MAX_ROOMS + 5; i++) rooms = addRoom(rooms, `room-${i}`, i);
    expect(rooms).toHaveLength(MAX_ROOMS);
    expect(rooms[0].slug).toBe(`room-${MAX_ROOMS + 4}`);
  });

  it("removes a room", () => {
    const rooms = addRoom(addRoom([], "a", 1), "b", 2);
    expect(removeRoom(rooms, "a")).toEqual([{ slug: "b", openedAt: 2 }]);
  });
});
