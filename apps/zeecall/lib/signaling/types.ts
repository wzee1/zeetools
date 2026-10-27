export interface PeerInfo {
  id: string;
  name: string;
  joinedAt: number;
}

export type SignalingMessage =
  | {
      type: "join";
      room: string;
      peer: PeerInfo;
    }
  | {
      type: "peers-snapshot";
      peers: PeerInfo[];
    }
  | {
      type: "peer-joined";
      peer: PeerInfo;
    }
  | {
      type: "peer-left";
      peerId: string;
    }
  | {
      type: "signal-offer";
      /** Set by the sender; the receiver drops a second copy of the same id. */
      id?: string;
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "signal-answer";
      /** Set by the sender; the receiver drops a second copy of the same id. */
      id?: string;
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "signal-candidate";
      /** Set by the sender; the receiver drops a second copy of the same id. */
      id?: string;
      from: string;
      to: string;
      candidate: RTCIceCandidateInit;
    }
  | {
      type: "ping";
    }
  | {
      type: "pong";
    };
