"use client";

import { useRef } from "react";
import { useStreamElement } from "@/hooks/use-stream-element";

/** Plays one peer's voice while the call view is not on screen (the tiles that normally play it are unmounted). */
export default function PeerAudio({ stream, audioOutput }: { stream: MediaStream; audioOutput: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useStreamElement(audioRef, stream, { playsAudio: true, audioOutput });
  return <audio ref={audioRef} autoPlay />;
}
