import { describe, expect, it } from "vitest";
import { buildNotesMarkdown } from "@/lib/notes";

const base = {
  roomName: "swift-sync-123",
  durationSeconds: 125,
  attendees: ["Alice", "Bob"],
  notes: "- ship it",
  date: "2026-10-27",
  timestamp: "27/10/2026, 10:00:00",
};

describe("buildNotesMarkdown", () => {
  it("lists every attendee in the order given", () => {
    expect(buildNotesMarkdown(base)).toContain("- **Attendees**: Alice, Bob");
  });

  it("formats the header and keeps the notes verbatim", () => {
    const md = buildNotesMarkdown({ ...base, roomName: "" });
    expect(md).toContain("# zeecall Meeting Summary — 2026-10-27");
    expect(md).toContain("- **Room**: Private Call");
    expect(md).toContain("- **Duration**: 2m 5s");
    expect(md).toContain("\n- ship it\n");
  });
});
