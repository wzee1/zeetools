import { describe, it, expect, vi } from "vitest";
import {
  encodeChunkPacket,
  decodeChunkPacket,
  FileReceiverManager,
  FileMetadata,
} from "@/lib/webrtc/file-transfer";

describe("WebRTC File Transfer Protocol", () => {
  it("encodes and decodes a chunk packet with 24-byte header", () => {
    const fileId = "test-file-12345";
    const chunkIndex = 2;
    const totalChunks = 5;
    const testData = new Uint8Array([10, 20, 30, 40, 50]);

    const encoded = encodeChunkPacket(fileId, chunkIndex, totalChunks, testData);
    expect(encoded.byteLength).toBe(24 + 5);

    const decoded = decodeChunkPacket(encoded);
    expect(decoded.fileId).toBe("test-file-12345");
    expect(decoded.chunkIndex).toBe(2);
    expect(decoded.totalChunks).toBe(5);
    expect(Array.from(decoded.payload)).toEqual([10, 20, 30, 40, 50]);
  });

  it("handles multi-chunk reassembly in FileReceiverManager", () => {
    const receiver = new FileReceiverManager();
    const meta: FileMetadata = {
      id: "abc-987",
      name: "hello.txt",
      size: 10,
      type: "text/plain",
      totalChunks: 2,
    };

    receiver.registerIncomingFile(meta, "peer-1");

    const chunk0 = new Uint8Array([1, 2, 3, 4, 5]);
    const chunk1 = new Uint8Array([6, 7, 8, 9, 10]);

    const packet0 = encodeChunkPacket(meta.id, 0, 2, chunk0);
    const packet1 = encodeChunkPacket(meta.id, 1, 2, chunk1);

    const onProgress = vi.fn();
    const onComplete = vi.fn();

    // In a test environment, stub URL.createObjectURL if needed
    if (typeof URL.createObjectURL !== "function") {
      URL.createObjectURL = vi.fn(() => "blob:test-url");
    }

    receiver.handleChunk(packet0, onProgress, onComplete);
    expect(onComplete).not.toHaveBeenCalled();

    receiver.handleChunk(packet1, onProgress, onComplete);
    expect(onComplete).toHaveBeenCalledTimes(1);

    const [completeProgress, blob] = onComplete.mock.calls[0];
    expect(completeProgress.status).toBe("completed");
    expect(completeProgress.fileSize).toBe(10);
    expect(blob).toBeInstanceOf(Blob);
  });
});
