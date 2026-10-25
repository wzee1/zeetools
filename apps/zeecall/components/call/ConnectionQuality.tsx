"use client";

import { ConnectionQualityStats } from "@/lib/webrtc/stats";
import { cn } from "@zeetools/ui/lib/utils";

export interface ConnectionQualityProps {
  stats: ConnectionQualityStats;
  signalingStatus?: string;
  className?: string;
}

/** The connection as a quiet tag: a ring dot (green ring when direct), then mono text. Danger only for a slow link. */
export default function ConnectionQuality({ stats, signalingStatus, className }: ConnectionQualityProps) {
  const isDirect = stats.connectionMode === "direct";
  const isRelayed = stats.connectionMode === "relayed";

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-control border border-border px-2.5 font-mono text-xs tabular-nums text-muted",
        className
      )}
      title={`WebRTC Connection: ${stats.connectionMode.toUpperCase()} | RTT: ${stats.rttMs}ms | Loss: ${stats.packetLossPercent}% | Jitter: ${stats.jitterMs}ms`}
    >
      <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full border-2", isDirect ? "border-primary-text" : "border-muted")} />

      <span>{isDirect ? "P2P Direct" : isRelayed ? "Relayed" : signalingStatus === "fallback-local" ? "Local Mesh" : "SRTP"}</span>

      {stats.rttMs > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className={cn(stats.rttMs >= 150 && "text-danger")}>{stats.rttMs}ms</span>
        </>
      )}

      {stats.packetLossPercent > 0 && (
        <>
          <span aria-hidden>·</span>
          <span>{stats.packetLossPercent}% loss</span>
        </>
      )}
    </span>
  );
}
