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
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "signal-answer";
      from: string;
      to: string;
      sdp: RTCSessionDescriptionInit;
    }
  | {
      type: "signal-candidate";
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
