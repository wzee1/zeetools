/**
 * Ephemeral Edge WebSocket Signaling Worker for zeecall.
 * Deployable on Cloudflare Workers at signaling.wzee.dev ($0 cost).
 *
 * Characteristics:
 * - Pure transient message forwarding
 * - Zero storage, zero databases, zero call logs
 * - Automatic room cleanup when the last participant leaves
 */

// Ambient declarations for Cloudflare Worker runtime
declare class WebSocketPair {
  0: WebSocket & { accept(): void };
  1: WebSocket & { accept(): void };
}

interface WorkerResponseInit extends ResponseInit {
  webSocket?: WebSocket;
}

interface PeerSocket {
  ws: WebSocket & { accept(): void };
  peerId: string;
  name: string;
  room: string;
}

// In-memory room manager for active WebSocket connections within the worker isolate
const rooms = new Map<string, Map<string, PeerSocket>>();

const worker = {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    const upgradeHeader = request.headers.get("Upgrade");
    const isUpgrade = upgradeHeader?.toLowerCase() === "websocket";

    // Health check endpoint (clients connect to "/" too, so only a plain request gets the health reply)
    if (!isUpgrade && (url.pathname === "/health" || url.pathname === "/")) {
      return new Response(
        JSON.stringify({
          service: "zeecall-signaling",
          status: "healthy",
          activeRooms: rooms.size,
          timestamp: Date.now(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // WebSocket upgrade check
    if (!isUpgrade) {
      return new Response("Expected WebSocket connection", { status: 426 });
    }

    const room = url.searchParams.get("room");
    const peerId = url.searchParams.get("peerId");
    const name = decodeURIComponent(url.searchParams.get("name") || "Anonymous");

    if (!room || !peerId) {
      return new Response("Missing 'room' or 'peerId' parameter", { status: 400 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    // Accept WebSocket connection
    server.accept();

    // Register peer in room
    if (!rooms.has(room)) {
      rooms.set(room, new Map());
    }
    const currentRoom = rooms.get(room)!;

    const peerInfo: PeerSocket = {
      ws: server,
      peerId,
      name,
      room,
    };

    currentRoom.set(peerId, peerInfo);

    // Send peers snapshot to newly connected client
    const existingPeers = Array.from(currentRoom.values())
      .filter((p) => p.peerId !== peerId)
      .map((p) => ({
        id: p.peerId,
        name: p.name,
        joinedAt: Date.now(),
      }));

    server.send(
      JSON.stringify({
        type: "peers-snapshot",
        peers: existingPeers,
      })
    );

    // Broadcast to existing room participants that a new peer joined
    const peerJoinedMsg = JSON.stringify({
      type: "peer-joined",
      peer: {
        id: peerId,
        name,
        joinedAt: Date.now(),
      },
    });

    for (const [id, peer] of currentRoom.entries()) {
      if (id !== peerId && peer.ws.readyState === 1 /* WebSocket.OPEN */) {
        try {
          peer.ws.send(peerJoinedMsg);
        } catch {
          // ignore broken pipe
        }
      }
    }

    // Message handler
    server.addEventListener("message", (event: MessageEvent) => {
      try {
        const raw = typeof event.data === "string" ? event.data : new TextDecoder().decode(event.data);
        const data = JSON.parse(raw);

        // Targeted message forwarding (offer, answer, candidate)
        if (data.to && currentRoom.has(data.to)) {
          const target = currentRoom.get(data.to)!;
          if (target.ws.readyState === 1 /* WebSocket.OPEN */) {
            target.ws.send(raw);
          }
        } else if (data.type === "ping") {
          server.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        // Malformed frame: drop it. Never log the payload; it may contain SDP or candidate data.
      }
    });

    // Close and disconnect handler
    const cleanup = () => {
      currentRoom.delete(peerId);
      if (currentRoom.size === 0) {
        rooms.delete(room);
      } else {
        const peerLeftMsg = JSON.stringify({
          type: "peer-left",
          peerId,
        });

        for (const peer of currentRoom.values()) {
          if (peer.ws.readyState === 1 /* WebSocket.OPEN */) {
            try {
              peer.ws.send(peerLeftMsg);
            } catch {
              // ignore
            }
          }
        }
      }
    };

    server.addEventListener("close", cleanup);
    server.addEventListener("error", cleanup);

    const responseInit: WorkerResponseInit = {
      status: 101,
      webSocket: client,
    };

    return new Response(null, responseInit as ResponseInit);
  },
};

export default worker;
