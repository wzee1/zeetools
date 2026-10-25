import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_STUN_SERVERS,
  getRtcConfiguration,
  getCustomTurnConfig,
  saveCustomTurnConfig,
} from "@/lib/webrtc/config";

describe("WebRTC Configuration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default STUN servers when no TURN is set", () => {
    const config = getRtcConfiguration();
    expect(config.iceServers).toEqual(DEFAULT_STUN_SERVERS);
    expect(config.bundlePolicy).toBe("max-bundle");
    expect(config.rtcpMuxPolicy).toBe("require");
  });

  it("persists and reads custom TURN server configuration", () => {
    const turnConfig = {
      urls: "turn:turn.example.com:3478",
      username: "user1",
      credential: "pass1",
    };

    saveCustomTurnConfig(turnConfig);
    expect(getCustomTurnConfig()).toEqual(turnConfig);

    const rtcConfig = getRtcConfiguration();
    expect(rtcConfig.iceServers?.length).toBe(DEFAULT_STUN_SERVERS.length + 1);
    expect(rtcConfig.iceServers).toContainEqual(turnConfig);
  });
});
