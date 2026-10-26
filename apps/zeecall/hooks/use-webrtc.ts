"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRtcConfiguration } from "@/lib/webrtc/config";
import { samplePeerStats, ConnectionQualityStats } from "@/lib/webrtc/stats";
import { SignalingClient, SignalingStatus } from "@/lib/signaling/client";
import { PeerInfo } from "@/lib/signaling/types";

export interface RemotePeerState {
  id: string;
  name: string;
  stream: MediaStream;
  connectionState: RTCPeerConnectionState;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
}

export interface UseWebRtcOptions {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  onDataChannelReady?: (peerId: string, channel: RTCDataChannel) => void;
  onDataChannelClosed?: (peerId: string) => void;
}

export function useWebRtc({
  localStream,
  screenStream,
  onDataChannelReady,
  onDataChannelClosed,
}: UseWebRtcOptions) {
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeerState>>(new Map());
  const [signalingStatus, setSignalingStatus] = useState<SignalingStatus>("idle");
  const [overallStats, setOverallStats] = useState<ConnectionQualityStats>({
    rttMs: 0,
    packetLossPercent: 0,
    connectionMode: "unknown",
    jitterMs: 0,
    bytesReceived: 0,
    bytesSent: 0,
  });

  const signalingRef = useRef<SignalingClient | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const candidateQueuesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localPeerRef = useRef<PeerInfo | null>(null);
  // Names from the join announcements, so the answering side can label the tile too.
  const peerNamesRef = useRef<Map<string, string>>(new Map());
  // The last offer taken from each peer, recorded before any await, so a copy that arrives mid-answer is dropped.
  const lastOfferRef = useRef<Map<string, string>>(new Map());
  const roomRef = useRef<string>("");

  const localStreamRef = useRef(localStream);
  const screenStreamRef = useRef(screenStream);
  const onDataChannelReadyRef = useRef(onDataChannelReady);
  const onDataChannelClosedRef = useRef(onDataChannelClosed);

  useEffect(() => {
    localStreamRef.current = localStream;
    screenStreamRef.current = screenStream;
    onDataChannelReadyRef.current = onDataChannelReady;
    onDataChannelClosedRef.current = onDataChannelClosed;
  }, [localStream, screenStream, onDataChannelReady, onDataChannelClosed]);

  // Sync tracks to peer connection
  // Each connection has one audio and one video slot (transceiver) from the start. Tracks are swapped in place with
  // replaceTrack, so starting a screen share, or turning a camera on later, never needs a new negotiation.
  const syncTracksToPeerConnection = useCallback((pc: RTCPeerConnection) => {
    // The screen's video takes the camera's place; the microphone keeps the audio slot (screen audio is not sent).
    const video = screenStreamRef.current?.getVideoTracks()[0] ?? localStreamRef.current?.getVideoTracks()[0] ?? null;
    const audio = localStreamRef.current?.getAudioTracks()[0] ?? null;

    for (const [kind, track] of [["audio", audio], ["video", video]] as const) {
      const transceiver = pc.getTransceivers().find((t) => t.currentDirection !== "stopped" && t.receiver.track.kind === kind);
      if (transceiver) {
        if (transceiver.sender.track !== track) {
          transceiver.sender.replaceTrack(track).catch((e) => console.warn("replaceTrack error:", e));
        }
      } else if (track) {
        try {
          pc.addTrack(track, localStreamRef.current || new MediaStream());
        } catch {
          // ignore already added
        }
      }
    }
  }, []);

  /** The calling side makes sure both slots exist before its offer, even without a camera or a microphone. */
  const ensureTransceivers = useCallback((pc: RTCPeerConnection) => {
    for (const kind of ["audio", "video"] as const) {
      if (!pc.getTransceivers().some((t) => t.receiver.track.kind === kind)) {
        pc.addTransceiver(kind, { direction: "sendrecv" });
      }
    }
  }, []);

  // Sync local tracks whenever localStream or screenStream changes
  useEffect(() => {
    peerConnectionsRef.current.forEach((pc) => {
      syncTracksToPeerConnection(pc);
    });
  }, [localStream, screenStream, syncTracksToPeerConnection]);

  // Create PeerConnection instance
  const createPeerConnection = useCallback(
    (peerId: string, peerName: string): RTCPeerConnection => {
      const config = getRtcConfiguration();
      const pc = new RTCPeerConnection(config);

      peerConnectionsRef.current.set(peerId, pc);
      candidateQueuesRef.current.set(peerId, []);

      // Stream received from remote peer
      const remoteStream = new MediaStream();

      pc.ontrack = (event) => {
        event.streams[0]?.getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });

        // Also add individual track if not in stream
        if (event.track && !remoteStream.getTracks().includes(event.track)) {
          remoteStream.addTrack(event.track);
        }

        setRemotePeers((prev) => {
          const next = new Map(prev);
          next.set(peerId, {
            id: peerId,
            name: peerName,
            stream: remoteStream,
            connectionState: pc.connectionState,
          });
          return next;
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && signalingRef.current) {
          signalingRef.current.sendCandidate(peerId, event.candidate.toJSON());
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "disconnected" || state === "failed" || state === "closed") {
          // Keep stream or remove
          if (state === "closed" || state === "failed") {
            setRemotePeers((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
          }
        } else {
          setRemotePeers((prev) => {
            const existing = prev.get(peerId);
            if (!existing) {
              // Connected but nothing received yet (no camera or mic on that side): still show the person.
              if (state !== "connected") return prev;
              const next = new Map(prev);
              next.set(peerId, { id: peerId, name: peerName, stream: remoteStream, connectionState: state });
              return next;
            }
            const next = new Map(prev);
            next.set(peerId, {
              ...existing,
              connectionState: state,
            });
            return next;
          });
        }
      };

      pc.ondatachannel = (event) => {
        const channel = event.channel;
        channel.binaryType = "arraybuffer";
        channel.onopen = () => {
          onDataChannelReadyRef.current?.(peerId, channel);
        };
        channel.onclose = () => {
          onDataChannelClosedRef.current?.(peerId);
        };
      };

      syncTracksToPeerConnection(pc);

      return pc;
    },
    [syncTracksToPeerConnection]
  );

  // Drops one peer's connection (a stale one is replaced by a fresh call)
  const closePeer = useCallback((peerId: string) => {
    const pc = peerConnectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(peerId);
    }
    candidateQueuesRef.current.delete(peerId);
    lastOfferRef.current.delete(peerId);
    setRemotePeers((prev) => {
      if (!prev.has(peerId)) return prev;
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
    onDataChannelClosedRef.current?.(peerId);
  }, []);

  // Drain buffered candidates once remote description is set
  const drainCandidateQueue = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const queue = candidateQueuesRef.current.get(peerId) || [];
    for (const cand of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.warn("Failed to add buffered candidate:", err);
      }
    }
    candidateQueuesRef.current.set(peerId, []);
  }, []);

  // Initiate call to a remote peer (Host / polite initiator)
  const initiateCallToPeer = useCallback(
    async (peer: PeerInfo) => {
      // The same peer can be announced twice (the worker and the same-browser channel both deliver it).
      const existing = peerConnectionsRef.current.get(peer.id);
      if (existing && !["disconnected", "failed", "closed"].includes(existing.connectionState)) return;
      if (existing) closePeer(peer.id);

      const pc = createPeerConnection(peer.id, peer.name);

      // Create data channel on the offering side
      try {
        const channel = pc.createDataChannel("zeecall-data", { ordered: true });
        channel.binaryType = "arraybuffer";
        channel.onopen = () => {
          onDataChannelReadyRef.current?.(peer.id, channel);
        };
        channel.onclose = () => {
          onDataChannelClosedRef.current?.(peer.id);
        };
      } catch (err) {
        console.warn("Failed to create data channel:", err);
      }

      ensureTransceivers(pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      signalingRef.current?.sendOffer(peer.id, offer);
    },
    [createPeerConnection, closePeer, ensureTransceivers]
  );

  // Join Room
  const joinRoom = useCallback(
    (room: string, peer: PeerInfo) => {
      roomRef.current = room;
      localPeerRef.current = peer;

      const signaling = new SignalingClient({
        onStatusChange: (status) => setSignalingStatus(status),
        onPeersSnapshot: (peers) => {
          // Existing peers in the room: the same tie-break as for a newcomer, since they learn about us too
          peers.forEach((p) => {
            peerNamesRef.current.set(p.id, p.name);
            if (localPeerRef.current && localPeerRef.current.id < p.id) {
              initiateCallToPeer(p);
            }
          });
        },
        onPeerJoined: (remotePeer) => {
          peerNamesRef.current.set(remotePeer.id, remotePeer.name);
          // If our peer ID is lexicographically lower, we initiate the offer
          // This deterministic tie-breaking prevents offer collision
          if (localPeerRef.current && localPeerRef.current.id < remotePeer.id) {
            initiateCallToPeer(remotePeer);
          }
        },
        onPeerLeft: (peerId) => {
          const pc = peerConnectionsRef.current.get(peerId);
          if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(peerId);
          }
          candidateQueuesRef.current.delete(peerId);
          setRemotePeers((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
          onDataChannelClosedRef.current?.(peerId);
        },
        onOffer: async (from, sdp) => {
          // The same offer delivered a second time (worker and same-browser channel): already being answered.
          if (lastOfferRef.current.get(from) === sdp.sdp) return;
          let pc = peerConnectionsRef.current.get(from);
          // A different offer on a connection that already took one is a new call (that tab reloaded): start fresh.
          if (pc && (lastOfferRef.current.has(from) || pc.remoteDescription || pc.connectionState === "failed" || pc.connectionState === "closed")) {
            closePeer(from);
            pc = undefined;
          }
          lastOfferRef.current.set(from, sdp.sdp ?? "");
          if (!pc) {
            pc = createPeerConnection(from, peerNamesRef.current.get(from) ?? "Peer");
          }

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await drainCandidateQueue(from, pc);

          // Slots the offer created for kinds we had no track for start receive-only; open them both ways, so a
          // camera or screen share added later only needs replaceTrack.
          pc.getTransceivers().forEach((t) => {
            if (t.direction === "recvonly") t.direction = "sendrecv";
          });
          syncTracksToPeerConnection(pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          signalingRef.current?.sendAnswer(from, answer);
        },
        onAnswer: async (from, sdp) => {
          const pc = peerConnectionsRef.current.get(from);
          // Only an outstanding offer takes an answer; a repeated answer is ignored.
          if (!pc || pc.signalingState !== "have-local-offer") return;

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await drainCandidateQueue(from, pc);
        },
        onCandidate: async (from, candidate) => {
          const pc = peerConnectionsRef.current.get(from);
          if (pc && pc.remoteDescription && pc.remoteDescription.type) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.warn("Failed to add ice candidate:", err);
            }
          } else {
            // Buffer candidate until remote description is applied
            const queue = candidateQueuesRef.current.get(from) || [];
            queue.push(candidate);
            candidateQueuesRef.current.set(from, queue);
          }
        },
      });

      signalingRef.current = signaling;
      signaling.connect(room, peer);
    },
    [createPeerConnection, drainCandidateQueue, initiateCallToPeer, closePeer, syncTracksToPeerConnection]
  );

  // Leave Room & teardown
  const leaveRoom = useCallback(() => {
    if (signalingRef.current) {
      signalingRef.current.disconnect();
      signalingRef.current = null;
    }

    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch {
        // ignore
      }
    });
    peerConnectionsRef.current.clear();
    candidateQueuesRef.current.clear();
    peerNamesRef.current.clear();
    lastOfferRef.current.clear();
    setRemotePeers(new Map());
    setSignalingStatus("disconnected");
  }, []);

  // Poll connection stats
  useEffect(() => {
    if (peerConnectionsRef.current.size === 0) return;

    const interval = setInterval(async () => {
      // Sample first connected peer connection
      for (const pc of peerConnectionsRef.current.values()) {
        if (pc.connectionState === "connected") {
          const stats = await samplePeerStats(pc);
          setOverallStats(stats);
          break;
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [remotePeers]);

  // A tab that reloads or closes says goodbye first, so the others drop its connection and take its next join fresh
  useEffect(() => {
    const onPageHide = () => leaveRoom();
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [leaveRoom]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return {
    remotePeers: Array.from(remotePeers.values()),
    signalingStatus,
    overallStats,
    joinRoom,
    leaveRoom,
  };
}
