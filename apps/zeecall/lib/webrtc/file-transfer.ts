export const CHUNK_SIZE = 64 * 1024; // 64KB

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  totalChunks: number;
}

export interface FileTransferProgress {
  fileId: string;
  fileName: string;
  fileSize: number;
  transferredBytes: number;
  progress: number; // 0.0 to 1.0
  speedBytesPerSec: number;
  direction: "send" | "receive";
  peerId: string;
  status: "transferring" | "completed" | "error";
  blobUrl?: string;
}

interface InFlightReceive {
  meta: FileMetadata;
  peerId: string;
  receivedChunks: Map<number, Uint8Array>;
  receivedBytes: number;
  startTime: number;
  lastProgressUpdate: number;
}

/**
 * Encodes a 64KB binary chunk with an efficient 24-byte header:
 * - 16 bytes: fileId (ASCII/UTF-8 padded)
 * - 4 bytes: Uint32 chunkIndex
 * - 4 bytes: Uint32 totalChunks
 */
export function encodeChunkPacket(
  fileId: string,
  chunkIndex: number,
  totalChunks: number,
  chunkData: Uint8Array
): ArrayBuffer {
  const headerSize = 24;
  const buffer = new ArrayBuffer(headerSize + chunkData.byteLength);
  const view = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  // 16 bytes fileId
  const encoder = new TextEncoder();
  const idBytes = encoder.encode(fileId.slice(0, 16));
  uint8View.set(idBytes, 0);

  // 4 bytes chunkIndex (Big-Endian)
  view.setUint32(16, chunkIndex, false);

  // 4 bytes totalChunks (Big-Endian)
  view.setUint32(20, totalChunks, false);

  // Payload
  uint8View.set(chunkData, headerSize);

  return buffer;
}

/**
 * Decodes the 24-byte chunk packet header.
 */
export function decodeChunkPacket(buffer: ArrayBuffer): {
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  payload: Uint8Array;
} {
  const headerSize = 24;
  const view = new DataView(buffer);
  const uint8View = new Uint8Array(buffer);

  // Read fileId
  const idBytes = uint8View.subarray(0, 16);
  let idLength = 0;
  while (idLength < 16 && idBytes[idLength] !== 0) {
    idLength++;
  }
  const fileId = new TextDecoder().decode(idBytes.subarray(0, idLength));

  // Read indices
  const chunkIndex = view.getUint32(16, false);
  const totalChunks = view.getUint32(20, false);

  // Read payload
  const payload = uint8View.subarray(headerSize);

  return { fileId, chunkIndex, totalChunks, payload };
}

export class FileReceiverManager {
  private inFlight = new Map<string, InFlightReceive>();

  public registerIncomingFile(meta: FileMetadata, peerId: string): void {
    this.inFlight.set(meta.id, {
      meta,
      peerId,
      receivedChunks: new Map(),
      receivedBytes: 0,
      startTime: Date.now(),
      lastProgressUpdate: Date.now(),
    });
  }

  public handleChunk(
    buffer: ArrayBuffer,
    onProgress: (progress: FileTransferProgress) => void,
    onComplete: (progress: FileTransferProgress, blob: Blob) => void
  ): void {
    const { fileId, chunkIndex, totalChunks, payload } = decodeChunkPacket(buffer);
    const session = this.inFlight.get(fileId);
    if (!session) return;

    if (!session.receivedChunks.has(chunkIndex)) {
      session.receivedChunks.set(chunkIndex, new Uint8Array(payload));
      session.receivedBytes += payload.byteLength;
    }

    const now = Date.now();
    const elapsedSec = Math.max(0.1, (now - session.startTime) / 1000);
    const speed = session.receivedBytes / elapsedSec;
    const progressRatio = Math.min(1, session.receivedBytes / session.meta.size);

    if (session.receivedChunks.size === totalChunks || session.receivedBytes >= session.meta.size) {
      // Reassemble file
      const sortedChunks: Uint8Array[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunk = session.receivedChunks.get(i);
        if (chunk) sortedChunks.push(chunk);
      }

      const blob = new Blob(sortedChunks as unknown as BlobPart[], {
        type: session.meta.type || "application/octet-stream",
      });
      const blobUrl = URL.createObjectURL(blob);

      const completeProgress: FileTransferProgress = {
        fileId: session.meta.id,
        fileName: session.meta.name,
        fileSize: session.meta.size,
        transferredBytes: session.meta.size,
        progress: 1,
        speedBytesPerSec: speed,
        direction: "receive",
        peerId: session.peerId,
        status: "completed",
        blobUrl,
      };

      this.inFlight.delete(fileId);
      onComplete(completeProgress, blob);
    } else {
      // Periodic progress dispatch
      if (now - session.lastProgressUpdate > 100) {
        session.lastProgressUpdate = now;
        onProgress({
          fileId: session.meta.id,
          fileName: session.meta.name,
          fileSize: session.meta.size,
          transferredBytes: session.receivedBytes,
          progress: progressRatio,
          speedBytesPerSec: speed,
          direction: "receive",
          peerId: session.peerId,
          status: "transferring",
        });
      }
    }
  }

  public cleanup(): void {
    this.inFlight.clear();
  }
}

/**
 * Triggers a client-side download for an assembled file blob.
 */
export function triggerFileDownload(blobUrl: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
