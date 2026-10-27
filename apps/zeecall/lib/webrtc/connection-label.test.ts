import { describe, expect, it } from "vitest";
import { connectionLabel } from "@/lib/webrtc/connection-label";

describe("connectionLabel", () => {
  it("says Local Mesh whenever signaling is in local fallback", () => {
    expect(connectionLabel("direct", "fallback-local", 1)).toBe("Local Mesh");
    expect(connectionLabel("unknown", "fallback-local", 0)).toBe("Local Mesh");
  });

  it("says P2P Direct or Relayed while the worker is up", () => {
    expect(connectionLabel("direct", "connected", 1)).toBe("P2P Direct");
    expect(connectionLabel("relayed", "connected", 1)).toBe("Relayed");
  });

  it("says Waiting when alone and Connecting while stats load", () => {
    expect(connectionLabel("unknown", "connected", 0)).toBe("Waiting");
    expect(connectionLabel("unknown", "connected", 1)).toBe("Connecting");
  });
});
