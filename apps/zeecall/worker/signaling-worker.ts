/**
 * Ephemeral Edge WebSocket Signaling Worker for zeecall.
 * Deployable on Cloudflare Workers at signaling.wzee.dev ($0 cost).
 *
 * Characteristics:
 * - Pure transient message forwarding
 * - Zero storage, zero databases, zero call logs
 * - Automatic room cleanup when the last participant leaves
 *
 * A Worker may not touch a WebSocket that another request opened, so the sockets of a room live in one
 * Durable Object per room (`SignalingRoom`, bound as ROOMS in worker/wrangler.jsonc). It uses the hibernation
 * API: the runtime holds the sockets and their peer details, and the object writes nothing to storage.
 */

// Ambient declarations for the Cloudflare Worker runtime (kept here so the app's DOM types stay clean)
interface RoomSocket extends WebSocket {
  serializeAttachment(value: PeerAttachment): void;
  deserializeAttachment(): PeerAttachment | null;
}

declare class WebSocketPair {
  0: RoomSocket;
  1: RoomSocket;
}

interface WorkerResponseInit extends ResponseInit {
  webSocket?: WebSocket;
}

interface DurableObjectState {
  acceptWebSocket(ws: WebSocket): void;
  getWebSockets(): RoomSocket[];
}

interface DurableObjectId {
  toString(): string;
}

interface DurableObjectNamespace {
  idFromName(name: string): DurableObjectId;
  get(id: DurableObjectId): { fetch(request: Request): Promise<Response> };
}

interface Env {
  ROOMS: DurableObjectNamespace;
}

interface PeerAttachment {
  peerId: string;
  name: string;
}

const OPEN = 1; // WebSocket.OPEN

function sendTo(ws: WebSocket, data: string) {
  if (ws.readyState !== OPEN) return;
  try {
    ws.send(data);
  } catch {
    // ignore broken pipe
  }
}

/** One room: every socket in it, with the peer id and name each one joined with. */
export class SignalingRoom {
  constructor(private readonly state: DurableObjectState) {}

  private peers(except?: WebSocket): { ws: RoomSocket; peer: PeerAttachment }[] {
    return this.state
      .getWebSockets()
      .filter((ws) => ws !== except)
      .flatMap((ws) => {
        const peer = ws.deserializeAttachment();
        return peer ? [{ ws, peer }] : [];
      });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const peerId = url.searchParams.get("peerId")!;
    const name = decodeURIComponent(url.searchParams.get("name") || "Anonymous");

    // A tab that reloads joins again with the same peer id: its old socket is gone for good.
    for (const { ws, peer } of this.peers()) {
      if (peer.peerId === peerId) {
        try {
          ws.close(1000, "Replaced by a new connection");
        } catch {
          // already closed
        }
      }
    }
    const others = this.peers().filter(({ peer }) => peer.peerId !== peerId);

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ peerId, name });

    // Send peers snapshot to newly connected client
    server.send(
      JSON.stringify({
        type: "peers-snapshot",
        peers: others.map(({ peer }) => ({ id: peer.peerId, name: peer.name, joinedAt: Date.now() })),
      })
    );

    // Broadcast to existing room participants that a new peer joined
    const peerJoinedMsg = JSON.stringify({ type: "peer-joined", peer: { id: peerId, name, joinedAt: Date.now() } });
    for (const { ws } of others) sendTo(ws, peerJoinedMsg);

    const responseInit: WorkerResponseInit = { status: 101, webSocket: client };
    return new Response(null, responseInit as ResponseInit);
  }

  async webSocketMessage(ws: RoomSocket, message: string | ArrayBuffer): Promise<void> {
    try {
      const raw = typeof message === "string" ? message : new TextDecoder().decode(message);
      const data = JSON.parse(raw);

      // Targeted message forwarding (offer, answer, candidate)
      if (data.to) {
        for (const { ws: target, peer } of this.peers(ws)) {
          if (peer.peerId === data.to) sendTo(target, raw);
        }
      } else if (data.type === "ping") {
        sendTo(ws, JSON.stringify({ type: "pong" }));
      }
    } catch {
      // Malformed frame: drop it. Never log the payload; it may contain SDP or candidate data.
    }
  }

  async webSocketClose(ws: RoomSocket, code: number, reason: string): Promise<void> {
    this.leave(ws);
    try {
      ws.close(code, reason);
    } catch {
      // already closed
    }
  }

  async webSocketError(ws: RoomSocket): Promise<void> {
    this.leave(ws);
  }

  /** Tells the rest of the room that this peer left, unless the same peer is still connected on a newer socket. */
  private leave(ws: RoomSocket) {
    const peer = ws.deserializeAttachment();
    if (!peer) return;
    const rest = this.peers(ws);
    if (rest.some(({ peer: other }) => other.peerId === peer.peerId)) return;
    const peerLeftMsg = JSON.stringify({ type: "peer-left", peerId: peer.peerId });
    for (const { ws: other } of rest) sendTo(other, peerLeftMsg);
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isUpgrade = request.headers.get("Upgrade")?.toLowerCase() === "websocket";

    // Health check endpoint (clients connect to "/" too, so only a plain request gets the health reply)
    if (!isUpgrade && (url.pathname === "/health" || url.pathname === "/")) {
      return new Response(JSON.stringify({ service: "zeecall-signaling", status: "healthy", timestamp: Date.now() }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // WebSocket upgrade check
    if (!isUpgrade) {
      return new Response("Expected WebSocket connection", { status: 426 });
    }

    const room = url.searchParams.get("room");
    const peerId = url.searchParams.get("peerId");
    if (!room || !peerId) {
      return new Response("Missing 'room' or 'peerId' parameter", { status: 400 });
    }

    // Every socket of a room goes to the same Durable Object.
    return env.ROOMS.get(env.ROOMS.idFromName(room)).fetch(request);
  },
};

export default worker;
