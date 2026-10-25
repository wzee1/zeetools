"use client";

import { useEffect, useState } from "react";
import { watchAudioLevel } from "@/lib/webrtc/audio-level";

/** The live audio level (0–1) of a stream, such as a remote peer's, for the speaking state of its tile. */
export function useAudioLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState(0);
  // Remote tracks are added to the same stream object one by one; re-run once the audio track is there.
  const audioTracks = stream?.getAudioTracks().length ?? 0;

  useEffect(() => {
    if (!stream || audioTracks === 0) return;
    const stop = watchAudioLevel(stream, setLevel);
    return () => {
      stop();
      setLevel(0);
    };
  }, [stream, audioTracks]);

  return stream && audioTracks > 0 ? level : 0;
}
