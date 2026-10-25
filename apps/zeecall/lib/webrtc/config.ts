export const DEFAULT_STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const TURN_STORAGE_KEY = "zeecall_custom_turn_config";

export function getCustomTurnConfig(): RTCIceServer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TURN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomTurnConfig(config: RTCIceServer | null): void {
  if (typeof window === "undefined") return;
  if (!config) {
    localStorage.removeItem(TURN_STORAGE_KEY);
  } else {
    localStorage.setItem(TURN_STORAGE_KEY, JSON.stringify(config));
  }
}

export function getRtcConfiguration(): RTCConfiguration {
  const iceServers: RTCIceServer[] = [...DEFAULT_STUN_SERVERS];
  const customTurn = getCustomTurnConfig();
  if (customTurn) {
    iceServers.push(customTurn);
  }

  return {
    iceServers,
    bundlePolicy: "max-bundle",
    rtcpMuxPolicy: "require",
    iceCandidatePoolSize: 2,
  };
}
