import { describe, expect, it } from "vitest";
import { samplePeerStats } from "@/lib/webrtc/stats";

function fakePc(reports: Record<string, unknown>[], connectionState = "connected") {
  const map = new Map(reports.map((r) => [r.id as string, r]));
  return { connectionState, getStats: async () => map } as unknown as RTCPeerConnection;
}

describe("samplePeerStats", () => {
  it("returns zeroed stats without a connected peer", async () => {
    expect((await samplePeerStats(null)).connectionMode).toBe("unknown");
    expect((await samplePeerStats(fakePc([], "connecting"))).rttMs).toBe(0);
  });

  it("parses rtt, loss, jitter and byte counters", async () => {
    const stats = await samplePeerStats(
      fakePc([
        {
          id: "cp",
          type: "candidate-pair",
          state: "succeeded",
          currentRoundTripTime: 0.0456,
          availableOutgoingBitrate: 2_500_000,
          localCandidateId: "l",
          remoteCandidateId: "r",
        },
        { id: "l", type: "local-candidate", candidateType: "host" },
        { id: "r", type: "remote-candidate", candidateType: "srflx" },
        { id: "in1", type: "inbound-rtp", packetsLost: 5, packetsReceived: 95, jitter: 0.012, bytesReceived: 1000 },
        { id: "in2", type: "inbound-rtp", packetsLost: 0, packetsReceived: 100, jitter: 0.02, bytesReceived: 500 },
        { id: "out", type: "outbound-rtp", bytesSent: 777 },
      ])
    );
    expect(stats).toMatchObject({
      rttMs: 46,
      connectionMode: "direct",
      jitterMs: 20,
      bytesReceived: 1500,
      bytesSent: 777,
      availableOutgoingBitrateKbps: 2500,
    });
    expect(stats.packetLossPercent).toBe(2.5);
  });

  it("flags relayed connections", async () => {
    const stats = await samplePeerStats(
      fakePc([
        { id: "cp", type: "candidate-pair", state: "succeeded", localCandidateId: "l", remoteCandidateId: "r" },
        { id: "l", type: "local-candidate", candidateType: "relay" },
        { id: "r", type: "remote-candidate", candidateType: "host" },
      ])
    );
    expect(stats.connectionMode).toBe("relayed");
  });
});
