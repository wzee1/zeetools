import type { ConnectionQualityStats } from "@/lib/webrtc/stats";

/** The tag's text: the local mesh wins over what the stats say, since its peers never touch the worker. */
export function connectionLabel(mode: ConnectionQualityStats["connectionMode"], signalingStatus: string | undefined, peerCount: number): string {
  if (signalingStatus === "fallback-local") return "Local Mesh";
  if (mode === "direct") return "P2P Direct";
  if (mode === "relayed") return "Relayed";
  return peerCount > 0 ? "Connecting" : "Waiting";
}
