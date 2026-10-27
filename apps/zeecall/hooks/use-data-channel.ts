"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { randomId } from "@/lib/room";
import { buildNotesMarkdown } from "@/lib/notes";
import {
  CHUNK_SIZE,
  encodeChunkPacket,
  FileMetadata,
  FileReceiverManager,
  FileTransferProgress,
  triggerFileDownload,
} from "@/lib/webrtc/file-transfer";

interface NotesSyncPayload {
  type: "notes-sync";
  content: string;
  updatedAt: number;
  senderName: string;
}

/** A participant's microphone and camera, as they tell their peers. */
export interface MediaState {
  audioMuted: boolean;
  videoOff: boolean;
}

/** What happened to a file a peer sent: it waits in memory until the user saves or discards it. */
export type ReceivedFileState = "pending" | "saved" | "discarded";

export interface UseDataChannelOptions {
  localPeerName: string;
  roomName: string;
}

export function useDataChannel({ localPeerName, roomName }: UseDataChannelOptions) {
  const channelsRef = useRef<Map<string, RTCDataChannel>>(new Map());
  const receiverManagerRef = useRef<FileReceiverManager>(new FileReceiverManager());

  const [activeTransfers, setActiveTransfers] = useState<FileTransferProgress[]>([]);
  const [notes, setNotes] = useState<string>("");
  // 0 until the pad is edited here or a peer's edit arrives: an untouched pad never overwrites anyone's notes.
  const notesUpdatedAtRef = useRef(0);
  const notesRef = useRef("");
  // What each peer says about their microphone and camera (a tile shows it).
  const [peerMedia, setPeerMedia] = useState<Record<string, MediaState>>({});
  const localMediaRef = useRef<MediaState | null>(null);
  const [receivedFiles, setReceivedFiles] = useState<Record<string, ReceivedFileState>>({});
  // Peers sharing their screen; a share replaces their camera track, so the receiver has to be told.
  const [sharingPeerIds, setSharingPeerIds] = useState<string[]>([]);
  const localSharingRef = useRef(false);

  // Register channel
  const registerDataChannel = useCallback((peerId: string, channel: RTCDataChannel) => {
    channelsRef.current.set(peerId, channel);
    // A peer that connects while we share learns it straight away.
    if (localSharingRef.current && channel.readyState === "open") {
      channel.send(JSON.stringify({ type: "screen-share", active: true }));
    }
    // A newcomer learns our mic and camera, and any notes written so far, as soon as the channel opens.
    const sendHello = () => {
      try {
        if (localMediaRef.current) channel.send(JSON.stringify({ type: "media-state", ...localMediaRef.current }));
        if (notesUpdatedAtRef.current > 0) {
          const payload: NotesSyncPayload = {
            type: "notes-sync",
            content: notesRef.current,
            updatedAt: notesUpdatedAtRef.current,
            senderName: localPeerName,
          };
          channel.send(JSON.stringify(payload));
        }
      } catch {
        // ignore
      }
    };
    if (channel.readyState === "open") sendHello();

    channel.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "file-meta") {
            receiverManagerRef.current.registerIncomingFile(parsed.meta, peerId);
            setActiveTransfers((prev) => {
              const filtered = prev.filter((t) => t.fileId !== parsed.meta.id);
              return [
                ...filtered,
                {
                  fileId: parsed.meta.id,
                  fileName: parsed.meta.name,
                  fileSize: parsed.meta.size,
                  transferredBytes: 0,
                  progress: 0,
                  speedBytesPerSec: 0,
                  direction: "receive",
                  peerId,
                  status: "transferring",
                },
              ];
            });
          } else if (parsed.type === "screen-share") {
            const active = parsed.active === true;
            setSharingPeerIds((prev) => (active ? [...prev.filter((id) => id !== peerId), peerId] : prev.filter((id) => id !== peerId)));
          } else if (parsed.type === "notes-sync") {
            const sync = parsed as NotesSyncPayload;
            if (typeof sync.content === "string" && sync.updatedAt > notesUpdatedAtRef.current) {
              notesUpdatedAtRef.current = sync.updatedAt;
              notesRef.current = sync.content;
              setNotes(sync.content);
            }
          } else if (parsed.type === "media-state") {
            const state: MediaState = { audioMuted: parsed.audioMuted === true, videoOff: parsed.videoOff === true };
            setPeerMedia((prev) => ({ ...prev, [peerId]: state }));
          }
        } catch {
          // ignore invalid json
        }
      } else if (event.data instanceof ArrayBuffer) {
        receiverManagerRef.current.handleChunk(
          event.data,
          (progress) => {
            setActiveTransfers((prev) => {
              const next = prev.filter((t) => t.fileId !== progress.fileId);
              next.push(progress);
              return next;
            });
          },
          (completeProgress) => {
            setActiveTransfers((prev) => {
              const next = prev.filter((t) => t.fileId !== completeProgress.fileId);
              next.push(completeProgress);
              return next;
            });
            // Nothing is written to disk until the user says so (see saveFile / discardFile).
            if (completeProgress.blobUrl) {
              setReceivedFiles((prev) => ({ ...prev, [completeProgress.fileId]: "pending" }));
            }
          }
        );
      }
    };
  }, [localPeerName]);

  // Unregister channel
  const unregisterDataChannel = useCallback((peerId: string) => {
    const channel = channelsRef.current.get(peerId);
    if (channel) {
      try {
        channel.close();
      } catch {
        // ignore
      }
    }
    channelsRef.current.delete(peerId);
    setSharingPeerIds((prev) => prev.filter((id) => id !== peerId));
    setPeerMedia((prev) => {
      if (!(peerId in prev)) return prev;
      const rest = { ...prev };
      delete rest[peerId];
      return rest;
    });
  }, []);

  // Tell every peer whether our microphone and camera are on
  const announceMediaState = useCallback((state: MediaState) => {
    localMediaRef.current = state;
    const msg = JSON.stringify({ type: "media-state", ...state });
    channelsRef.current.forEach((ch) => {
      if (ch.readyState === "open") {
        try {
          ch.send(msg);
        } catch {
          // ignore
        }
      }
    });
  }, []);

  // Tell every peer whether we are sharing our screen now
  const announceScreenShare = useCallback((active: boolean) => {
    localSharingRef.current = active;
    const msg = JSON.stringify({ type: "screen-share", active });
    channelsRef.current.forEach((ch) => {
      if (ch.readyState === "open") {
        try {
          ch.send(msg);
        } catch {
          // ignore
        }
      }
    });
  }, []);

  // Save a received file to disk, after the user agreed
  const saveFile = useCallback((transfer: FileTransferProgress) => {
    if (!transfer.blobUrl) return;
    triggerFileDownload(transfer.blobUrl, transfer.fileName);
    setReceivedFiles((prev) => ({ ...prev, [transfer.fileId]: "saved" }));
  }, []);

  // Drop a received file without saving it
  const discardFile = useCallback((transfer: FileTransferProgress) => {
    if (transfer.blobUrl) URL.revokeObjectURL(transfer.blobUrl);
    setReceivedFiles((prev) => ({ ...prev, [transfer.fileId]: "discarded" }));
  }, []);

  // Send File to all peers
  const sendFile = useCallback(async (file: File) => {
    const fileId = randomId(8);
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const meta: FileMetadata = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      totalChunks,
    };

    const initialProgress: FileTransferProgress = {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      transferredBytes: 0,
      progress: 0,
      speedBytesPerSec: 0,
      direction: "send",
      peerId: "all",
      status: "transferring",
    };

    setActiveTransfers((prev) => [...prev, initialProgress]);

    // Broadcast file-meta packet
    const metaMessage = JSON.stringify({ type: "file-meta", meta });
    channelsRef.current.forEach((ch) => {
      if (ch.readyState === "open") {
        ch.send(metaMessage);
      }
    });

    const startTime = Date.now();
    let sentBytes = 0;

    // Send chunks sequentially with backpressure check
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const slice = file.slice(start, end);
      const arrayBuffer = await slice.arrayBuffer();
      const packet = encodeChunkPacket(fileId, chunkIndex, totalChunks, new Uint8Array(arrayBuffer));

      // Wait if bufferedAmount is high
      for (const channel of channelsRef.current.values()) {
        if (channel.readyState === "open") {
          while (channel.bufferedAmount > 512 * 1024) {
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          try {
            channel.send(packet);
          } catch (e) {
            console.warn("Failed sending chunk to peer:", e);
          }
        }
      }

      sentBytes += (end - start);
      const elapsed = Math.max(0.1, (Date.now() - startTime) / 1000);
      const speed = sentBytes / elapsed;
      const ratio = Math.min(1, sentBytes / file.size);

      setActiveTransfers((prev) => {
        const next = prev.filter((t) => t.fileId !== fileId);
        next.push({
          ...initialProgress,
          transferredBytes: sentBytes,
          progress: ratio,
          speedBytesPerSec: speed,
          status: ratio >= 1 ? "completed" : "transferring",
        });
        return next;
      });
    }
  }, []);

  // Update & sync scratchpad notes
  const updateNotes = useCallback(
    (newContent: string) => {
      const now = Date.now();
      setNotes(newContent);
      notesRef.current = newContent;
      notesUpdatedAtRef.current = now;

      const payload: NotesSyncPayload = {
        type: "notes-sync",
        content: newContent,
        updatedAt: now,
        senderName: localPeerName,
      };

      const msg = JSON.stringify(payload);
      channelsRef.current.forEach((ch) => {
        if (ch.readyState === "open") {
          try {
            ch.send(msg);
          } catch {
            // ignore
          }
        }
      });
    },
    [localPeerName]
  );

  // Export Notes to Markdown file
  const exportNotesAsMarkdown = useCallback(
    (callDurationSeconds: number, remoteNames: string[]) => {
      const dateStr = new Date().toISOString().split("T")[0];

      const markdownContent = buildNotesMarkdown({
        roomName,
        durationSeconds: callDurationSeconds,
        attendees: [localPeerName, ...remoteNames],
        notes,
        date: dateStr,
        timestamp: new Date().toLocaleString(),
      });

      const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      triggerFileDownload(url, `zeecall-notes-${dateStr}.md`);
    },
    [notes, roomName, localPeerName]
  );

  useEffect(() => {
    const receiver = receiverManagerRef.current;
    return () => {
      receiver.cleanup();
    };
  }, []);

  return {
    notes,
    updateNotes,
    exportNotesAsMarkdown,
    activeTransfers,
    sendFile,
    receivedFiles,
    saveFile,
    discardFile,
    sharingPeerIds,
    announceScreenShare,
    peerMedia,
    announceMediaState,
    registerDataChannel,
    unregisterDataChannel,
  };
}
