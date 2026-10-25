import { describe, expect, it, vi } from "vitest";
import {
  CHUNK_SIZE,
  decodeChunkPacket,
  encodeChunkPacket,
  FileReceiverManager,
} from "@/lib/webrtc/file-transfer";

describe("chunk packet header", () => {
  it("round-trips file id, indices and payload", () => {
    const payload = new Uint8Array([1, 2, 3, 4, 5]);
    const packet = encodeChunkPacket("abc123xy", 7, 42, payload);
    expect(packet.byteLength).toBe(24 + payload.byteLength);

    const decoded = decodeChunkPacket(packet);
    expect(decoded.fileId).toBe("abc123xy");
    expect(decoded.chunkIndex).toBe(7);
    expect(decoded.totalChunks).toBe(42);
    expect(Array.from(decoded.payload)).toEqual([1, 2, 3, 4, 5]);
  });

  it("writes indices big-endian after the 16-byte id field", () => {
    const view = new DataView(encodeChunkPacket("id", 0x01020304, 0x0a0b0c0d, new Uint8Array(0)));
    expect(view.getUint32(16, false)).toBe(0x01020304);
    expect(view.getUint32(20, false)).toBe(0x0a0b0c0d);
  });

  it("truncates ids longer than 16 bytes", () => {
    const decoded = decodeChunkPacket(
      encodeChunkPacket("0123456789abcdefOVERFLOW", 0, 1, new Uint8Array(0))
    );
    expect(decoded.fileId).toBe("0123456789abcdef");
  });
});

describe("FileReceiverManager", () => {
  const meta = { id: "file0001", name: "a.bin", size: 6, type: "", totalChunks: 2 };

  it("reassembles chunks and reports completion", () => {
    const manager = new FileReceiverManager();
    manager.registerIncomingFile(meta, "peer-1");
    const original = URL.createObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:test");

    const onProgress = vi.fn();
    const onComplete = vi.fn();
    manager.handleChunk(encodeChunkPacket("file0001", 1, 2, new Uint8Array([4, 5, 6])), onProgress, onComplete);
    expect(onComplete).not.toHaveBeenCalled();
    manager.handleChunk(encodeChunkPacket("file0001", 0, 2, new Uint8Array([1, 2, 3])), onProgress, onComplete);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [progress] = onComplete.mock.calls[0];
    expect(progress).toMatchObject({ fileId: "file0001", status: "completed", progress: 1, peerId: "peer-1" });
    expect(progress.blobUrl).toBe("blob:test");
    URL.createObjectURL = original;
  });

  it("ignores chunks for unknown files", () => {
    const manager = new FileReceiverManager();
    const onComplete = vi.fn();
    manager.handleChunk(encodeChunkPacket("nope", 0, 1, new Uint8Array(1)), vi.fn(), onComplete);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("uses 64KB chunks", () => {
    expect(CHUNK_SIZE).toBe(65536);
  });
});
