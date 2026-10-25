import { afterEach, describe, expect, it, vi } from "vitest";
import { getUserMediaStream } from "@/lib/webrtc/media";

function fakeStream(kinds: string[]) {
  return { kinds } as unknown as MediaStream;
}

/** Stubs getUserMedia so that only the listed kinds can be opened; asking for a missing one rejects the whole call. */
function stubDevices(available: string[]) {
  const getUserMedia = vi.fn(async (c: MediaStreamConstraints) => {
    const wanted = (["audio", "video"] as const).filter((k) => c[k]);
    if (wanted.some((k) => !available.includes(k))) throw new DOMException("Requested device not found", "NotFoundError");
    return fakeStream(wanted);
  });
  Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true });
  return getUserMedia;
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "mediaDevices");
});

describe("getUserMediaStream", () => {
  it("asks for camera and microphone together when both exist", async () => {
    const gum = stubDevices(["audio", "video"]);
    expect(await getUserMediaStream()).toEqual(fakeStream(["audio", "video"]));
    expect(gum).toHaveBeenCalledTimes(1);
  });

  it("falls back to the microphone alone without a camera", async () => {
    stubDevices(["audio"]);
    expect(await getUserMediaStream()).toEqual(fakeStream(["audio"]));
  });

  it("falls back to the camera alone without a microphone", async () => {
    stubDevices(["video"]);
    expect(await getUserMediaStream()).toEqual(fakeStream(["video"]));
  });

  it("throws the first error when no device can be opened", async () => {
    stubDevices([]);
    await expect(getUserMediaStream()).rejects.toThrow("Requested device not found");
  });
});
