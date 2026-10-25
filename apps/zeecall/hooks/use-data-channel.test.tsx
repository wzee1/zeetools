import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDataChannel } from "@/hooks/use-data-channel";
import { decodeChunkPacket } from "@/lib/webrtc/file-transfer";

function fakeChannel() {
  const sent: (string | ArrayBuffer)[] = [];
  const channel = {
    readyState: "open",
    bufferedAmount: 0,
    send: vi.fn((data: string | ArrayBuffer) => sent.push(data)),
    close: vi.fn(),
    onmessage: null,
  } as unknown as RTCDataChannel;
  return { channel, sent };
}

describe("useDataChannel.sendFile", () => {
  it("announces an 8-character base36 file id and tags every chunk with it", async () => {
    const { result } = renderHook(() => useDataChannel({ localPeerName: "me", roomName: "r" }));
    const { channel, sent } = fakeChannel();
    act(() => result.current.registerDataChannel("peer", channel));

    await act(async () => {
      await result.current.sendFile(new File([new Uint8Array([9, 8, 7])], "a.bin"));
    });

    const meta = JSON.parse(sent[0] as string);
    expect(meta.type).toBe("file-meta");
    expect(meta.meta.id).toMatch(/^[a-z0-9]{8}$/);
    expect(meta.meta).toMatchObject({ name: "a.bin", size: 3, totalChunks: 1 });
    const chunk = decodeChunkPacket(sent[1] as ArrayBuffer);
    expect(chunk.fileId).toBe(meta.meta.id);
    expect(Array.from(chunk.payload)).toEqual([9, 8, 7]);
  });

  it("gives successive files distinct ids", async () => {
    const { result } = renderHook(() => useDataChannel({ localPeerName: "me", roomName: "r" }));
    const { channel, sent } = fakeChannel();
    act(() => result.current.registerDataChannel("peer", channel));
    await act(async () => {
      await result.current.sendFile(new File(["a"], "a.txt"));
      await result.current.sendFile(new File(["b"], "b.txt"));
    });
    const ids = sent.filter((s) => typeof s === "string").map((s) => JSON.parse(s as string).meta.id);
    expect(new Set(ids).size).toBe(2);
  });
});
