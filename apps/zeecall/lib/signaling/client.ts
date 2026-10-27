import { randomId } from "@/lib/room";
import { createSeenFilter } from "./dedup";
import { PeerInfo, SignalingMessage } from "./types";

export type SignalingStatus = "idle" | "connecting" | "connected" | "fallback-local" | "disconnected";

export interface SignalingClientHandlers {
  onStatusChange?: (status: SignalingStatus) => void;
  onPeersSnapshot?: (peers: PeerInfo[]) => void;
  onPeerJoined?: (peer: PeerInfo) => void;
  onPeerLeft?: (peerId: string) => void;
  onOffer?: (from: string, sdp: RTCSessionDescriptionInit) => void;
  onAnswer?: (from: string, sdp: RTCSessionDescriptionInit) => void;
  onCandidate?: (from: string, candidate: RTCIceCandidateInit) => void;
}

const DEFAULT_SIGNALING_URL =
  process.env.NEXT_PUBLIC_SIGNALING_URL || "wss://signaling.wzee.dev";

export class SignalingClient {
  private ws: WebSocket | null = null;
  private localChannel: BroadcastChannel | null = null;
  private status: SignalingStatus = "idle";
  private room: string = "";
  private localPeer: PeerInfo | null = null;
  private pingInterval: number | null = null;
  private reconnectTimeout: number | null = null;
  private knownLocalPeers: Map<string, PeerInfo> = new Map();
  private isExplicitlyClosed: boolean = false;
  // Offers, answers and candidates arrive twice in the same browser (worker and local channel).
  private seenSignals = createSeenFilter();

  constructor(
    private handlers: SignalingClientHandlers = {},
    private serverUrl: string = DEFAULT_SIGNALING_URL
  ) {}

  public getStatus(): SignalingStatus {
    return this.status;
  }

  public connect(room: string, peer: PeerInfo): void {
    this.room = room;
    this.localPeer = peer;
    this.isExplicitlyClosed = false;
    this.seenSignals.clear();
    this.setStatus("connecting");

    // Initialize BroadcastChannel for immediate same-origin multi-tab local mesh fallback
    this.setupLocalBroadcastChannel();

    // Try WebSocket connection
    this.initWebSocket();
  }

  private setStatus(status: SignalingStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.handlers.onStatusChange?.(status);
  }

  private initWebSocket(): void {
    if (typeof window === "undefined" || !this.room || !this.localPeer) return;

    try {
      const url = new URL(this.serverUrl);
      url.searchParams.set("room", this.room);
      url.searchParams.set("peerId", this.localPeer.id);
      url.searchParams.set("name", encodeURIComponent(this.localPeer.name));

      const ws = new WebSocket(url.toString());
      this.ws = ws;

      ws.onopen = () => {
        this.setStatus("connected");
        this.send({
          type: "join",
          room: this.room,
          peer: this.localPeer!,
        });

        // Keepalive ping
        this.startPing();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as SignalingMessage;
          this.handleIncomingMessage(msg);
        } catch (err) {
          console.warn("Failed to parse signaling message:", err);
        }
      };

      ws.onclose = () => {
        this.stopPing();
        this.ws = null;
        if (!this.isExplicitlyClosed) {
          // Switch to local broadcast fallback so calls continue seamlessly in dev/same-machine
          if (this.localChannel) {
            this.setStatus("fallback-local");
          } else {
            this.setStatus("disconnected");
          }
        } else {
          this.setStatus("disconnected");
        }
      };

      ws.onerror = () => {
        // Network error - fallback to local broadcast channel
        if (!this.isExplicitlyClosed && this.localChannel) {
          this.setStatus("fallback-local");
        }
      };
    } catch {
      if (this.localChannel) {
        this.setStatus("fallback-local");
      } else {
        this.setStatus("disconnected");
      }
    }
  }

  private setupLocalBroadcastChannel(): void {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;

    try {
      const channelName = `zeecall-room-${this.room}`;
      this.localChannel = new BroadcastChannel(channelName);
      this.knownLocalPeers.clear();

      this.localChannel.onmessage = (event) => {
        const msg = event.data as SignalingMessage;
        if (!msg) return;

        // If newly joining peer announces in local channel, respond with our presence
        if (msg.type === "join" && msg.peer.id !== this.localPeer?.id) {
          this.knownLocalPeers.set(msg.peer.id, msg.peer);
          this.handlers.onPeerJoined?.(msg.peer);

          // Reply with our presence so the new peer knows about us
          this.localChannel?.postMessage({
            type: "peer-joined",
            peer: this.localPeer,
          });
        } else if (msg.type === "peer-joined" && msg.peer.id !== this.localPeer?.id) {
          if (!this.knownLocalPeers.has(msg.peer.id)) {
            this.knownLocalPeers.set(msg.peer.id, msg.peer);
            this.handlers.onPeerJoined?.(msg.peer);
          }
        } else if (msg.type === "peer-left" && msg.peerId !== this.localPeer?.id) {
          this.knownLocalPeers.delete(msg.peerId);
          this.handlers.onPeerLeft?.(msg.peerId);
        } else {
          this.handleIncomingMessage(msg);
        }
      };

      // Announce our presence to other tabs in the same room
      this.localChannel.postMessage({
        type: "join",
        room: this.room,
        peer: this.localPeer!,
      });
    } catch (err) {
      console.warn("BroadcastChannel error:", err);
    }
  }

  private handleIncomingMessage(msg: SignalingMessage): void {
    switch (msg.type) {
      case "peers-snapshot":
        // Filter out self
        const remotePeers = msg.peers.filter((p) => p.id !== this.localPeer?.id);
        this.handlers.onPeersSnapshot?.(remotePeers);
        break;

      case "peer-joined":
        if (msg.peer.id !== this.localPeer?.id) {
          this.handlers.onPeerJoined?.(msg.peer);
        }
        break;

      case "peer-left":
        if (msg.peerId !== this.localPeer?.id) {
          this.handlers.onPeerLeft?.(msg.peerId);
        }
        break;

      case "signal-offer":
        if (msg.to === this.localPeer?.id && this.isFirstCopy(msg)) {
          this.handlers.onOffer?.(msg.from, msg.sdp);
        }
        break;

      case "signal-answer":
        if (msg.to === this.localPeer?.id && this.isFirstCopy(msg)) {
          this.handlers.onAnswer?.(msg.from, msg.sdp);
        }
        break;

      case "signal-candidate":
        if (msg.to === this.localPeer?.id && this.isFirstCopy(msg)) {
          this.handlers.onCandidate?.(msg.from, msg.candidate);
        }
        break;

      case "ping":
        this.send({ type: "pong" });
        break;

      case "pong":
        break;
    }
  }

  private isFirstCopy(msg: { id?: string }): boolean {
    return !msg.id || this.seenSignals.isNew(msg.id);
  }

  public sendOffer(to: string, sdp: RTCSessionDescriptionInit): void {
    if (!this.localPeer) return;
    const msg: SignalingMessage = {
      type: "signal-offer",
      id: randomId(12),
      from: this.localPeer.id,
      to,
      sdp,
    };
    this.send(msg);
  }

  public sendAnswer(to: string, sdp: RTCSessionDescriptionInit): void {
    if (!this.localPeer) return;
    const msg: SignalingMessage = {
      type: "signal-answer",
      id: randomId(12),
      from: this.localPeer.id,
      to,
      sdp,
    };
    this.send(msg);
  }

  public sendCandidate(to: string, candidate: RTCIceCandidateInit): void {
    if (!this.localPeer) return;
    const msg: SignalingMessage = {
      type: "signal-candidate",
      id: randomId(12),
      from: this.localPeer.id,
      to,
      candidate,
    };
    this.send(msg);
  }

  private send(msg: SignalingMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(msg));
      } catch (err) {
        console.warn("Failed to send WebSocket signaling message:", err);
      }
    }

    // Always mirror to BroadcastChannel for local peers on same machine/tab
    if (this.localChannel) {
      try {
        this.localChannel.postMessage(msg);
      } catch {
        // ignore
      }
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = window.setInterval(() => {
      this.send({ type: "ping" });
    }, 25000);
  }

  private stopPing(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopPing();

    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.localPeer) {
      const leftMsg: SignalingMessage = {
        type: "peer-left",
        peerId: this.localPeer.id,
      };
      this.send(leftMsg);
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }

    if (this.localChannel) {
      try {
        this.localChannel.close();
      } catch {
        // ignore
      }
      this.localChannel = null;
    }

    this.setStatus("disconnected");
  }
}
