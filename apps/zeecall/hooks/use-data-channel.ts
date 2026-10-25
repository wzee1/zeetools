"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { randomId } from "@/lib/room";
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

export interface UseDataChannelOptions {
  localPeerName: string;
  roomName: string;
}

export function useDataChannel({ localPeerName, roomName }: UseDataChannelOptions) {
  const channelsRef = useRef<Map<string, RTCDataChannel>>(new Map());
  const receiverManagerRef = useRef<FileReceiverManager>(new FileReceiverManager());

  const [activeTransfers, setActiveTransfers] = useState<FileTransferProgress[]>([]);
  const [notes, setNotes] = useState<string>("# Meeting Scratchpad\n\n- Quick sync notes...\n- Action items:\n  - [ ] ");
  const [lastNotesUpdatedAt, setLastNotesUpdatedAt] = useState<number>(0);

  // Register channel
  const registerDataChannel = useCallback((peerId: string, channel: RTCDataChannel) => {
    channelsRef.current.set(peerId, channel);

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
          } else if (parsed.type === "notes-sync") {
            const sync = parsed as NotesSyncPayload;
            setNotes((prevNotes) => {
              if (sync.updatedAt > lastNotesUpdatedAt) {
                setLastNotesUpdatedAt(sync.updatedAt);
                return sync.content;
              }
              return prevNotes;
            });
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
            if (completeProgress.blobUrl) {
              triggerFileDownload(completeProgress.blobUrl, completeProgress.fileName);
            }
          }
        );
      }
    };
  }, [lastNotesUpdatedAt]);

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
      setLastNotesUpdatedAt(now);

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
    (callDurationSeconds: number, attendeeNames: string[]) => {
      const dateStr = new Date().toISOString().split("T")[0];
      const minutes = Math.floor(callDurationSeconds / 60);
      const seconds = callDurationSeconds % 60;
      const durationStr = `${minutes}m ${seconds}s`;

      const markdownContent = [
        `# zeecall Meeting Summary — ${dateStr}`,
        ``,
        `- **Room**: ${roomName || "Private Call"}`,
        `- **Duration**: ${durationStr}`,
        `- **Attendees**: ${attendeeNames.length > 0 ? attendeeNames.join(", ") : localPeerName}`,
        `- **Timestamp**: ${new Date().toLocaleString()}`,
        ``,
        `---`,
        ``,
        `## Meeting Notes`,
        ``,
        notes,
        ``,
        `---`,
        `*Generated by [zeecall](https://call.wzee.dev) — Zero-account WebRTC conferencing*`,
      ].join("\n");

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
    registerDataChannel,
    unregisterDataChannel,
  };
}
