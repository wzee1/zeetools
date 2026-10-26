"use client";

import { useEffect } from "react";

/** `setSinkId` picks the speaker a media element plays on; not every browser has it. */
type SinkElement = HTMLMediaElement & { setSinkId?: (sinkId: string) => Promise<void> };

/**
 * Plays a stream in a <video> or <audio> element. With `playsAudio` (a remote stream), it also routes the
 * sound to the chosen speaker and, when the browser refuses to autoplay sound, starts it on the next click.
 * Local previews are muted by the caller and skip both.
 */
export function useStreamElement(
  ref: React.RefObject<HTMLMediaElement | null>,
  stream: MediaStream | null,
  { playsAudio, audioOutput = "" }: { playsAudio: boolean; audioOutput?: string },
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element || !stream) return;
    element.srcObject = stream;
    if (!playsAudio) return;
    const retry = () => {
      element.play().catch(() => {});
    };
    element.play().catch(() => {
      window.addEventListener("pointerdown", retry, { once: true });
      window.addEventListener("keydown", retry, { once: true });
    });
    return () => {
      window.removeEventListener("pointerdown", retry);
      window.removeEventListener("keydown", retry);
    };
  }, [ref, stream, playsAudio]);

  useEffect(() => {
    const element = ref.current as SinkElement | null;
    if (!playsAudio || !element?.setSinkId || !audioOutput) return;
    element.setSinkId(audioOutput).catch(() => {});
  }, [ref, playsAudio, audioOutput]);
}
