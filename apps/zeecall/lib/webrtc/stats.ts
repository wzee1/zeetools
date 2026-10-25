export interface ConnectionQualityStats {
  rttMs: number;
  packetLossPercent: number;
  connectionMode: "direct" | "relayed" | "unknown";
  jitterMs: number;
  bytesReceived: number;
  bytesSent: number;
  availableOutgoingBitrateKbps?: number;
}

export async function samplePeerStats(
  pc: RTCPeerConnection | null
): Promise<ConnectionQualityStats> {
  const fallback: ConnectionQualityStats = {
    rttMs: 0,
    packetLossPercent: 0,
    connectionMode: "unknown",
    jitterMs: 0,
    bytesReceived: 0,
    bytesSent: 0,
  };

  if (!pc || pc.connectionState !== "connected") {
    return fallback;
  }

  try {
    const stats = await pc.getStats();
    let rttMs = 0;
    let packetsLost = 0;
    let packetsReceived = 0;
    let jitterMs = 0;
    let bytesReceived = 0;
    let bytesSent = 0;
    let connectionMode: "direct" | "relayed" | "unknown" = "unknown";
    let availableOutgoingBitrateKbps: number | undefined;

    stats.forEach((report) => {
      // Transport / Candidate Pair stats
      if (report.type === "candidate-pair" && report.state === "succeeded") {
        if (typeof report.currentRoundTripTime === "number") {
          rttMs = Math.round(report.currentRoundTripTime * 1000);
        } else if (typeof report.roundTripTime === "number") {
          rttMs = Math.round(report.roundTripTime * 1000);
        }

        if (typeof report.availableOutgoingBitrate === "number") {
          availableOutgoingBitrateKbps = Math.round(report.availableOutgoingBitrate / 1000);
        }

        // Determine if connection is Direct P2P or TURN Relayed
        const localCandidate = stats.get(report.localCandidateId);
        const remoteCandidate = stats.get(report.remoteCandidateId);

        if (localCandidate?.candidateType === "relay" || remoteCandidate?.candidateType === "relay") {
          connectionMode = "relayed";
        } else if (localCandidate && remoteCandidate) {
          connectionMode = "direct";
        }
      }

      // Inbound RTP stats for packet loss and jitter
      if (report.type === "inbound-rtp") {
        if (typeof report.packetsLost === "number") {
          packetsLost += report.packetsLost;
        }
        if (typeof report.packetsReceived === "number") {
          packetsReceived += report.packetsReceived;
        }
        if (typeof report.jitter === "number") {
          jitterMs = Math.max(jitterMs, Math.round(report.jitter * 1000));
        }
        if (typeof report.bytesReceived === "number") {
          bytesReceived += report.bytesReceived;
        }
      }

      if (report.type === "outbound-rtp" && typeof report.bytesSent === "number") {
        bytesSent += report.bytesSent;
      }
    });

    const totalPackets = packetsReceived + packetsLost;
    const packetLossPercent =
      totalPackets > 0 ? Math.min(100, Math.round((packetsLost / totalPackets) * 1000) / 10) : 0;

    return {
      rttMs,
      packetLossPercent,
      connectionMode,
      jitterMs,
      bytesReceived,
      bytesSent,
      availableOutgoingBitrateKbps,
    };
  } catch (err) {
    console.warn("Error gathering WebRTC stats:", err);
    return fallback;
  }
}
