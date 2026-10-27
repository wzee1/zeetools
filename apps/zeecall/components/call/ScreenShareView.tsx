"use client";

import { useRef } from "react";
import { MonitorX } from "lucide-react";
import MicIcon from "@zeetools/ui/components/icons/media/mic-icon";
import { useStreamElement } from "@/hooks/use-stream-element";

export interface ScreenShareViewProps {
  /** The shared screen: our own capture, or the presenter's stream when a peer shares. */
  screenStream: MediaStream;
  presenterName: string;
  /** The presenter's microphone is off: the chip shows it, since their tile is not on screen. */
  isAudioMuted?: boolean;
  /** Our own share: the preview stays muted (no echo of the captured audio) and gets the stop button. */
  isLocalSharing: boolean;
  onStopScreenShare?: () => void;
  /** The speaker a peer's share plays on (their voice comes with it). */
  audioOutput?: string;
  /** Overlaid in the corner, such as our own camera while we share. */
  pip?: React.ReactNode;
}

/** A shared screen, whole (contained, never cropped), with the presenter chip on top. */
export default function ScreenShareView({ screenStream, presenterName, isLocalSharing, onStopScreenShare, audioOutput, pip, isAudioMuted = false }: ScreenShareViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useStreamElement(videoRef, screenStream, { playsAudio: !isLocalSharing, audioOutput });

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-control border border-border bg-black shell:aspect-auto shell:min-h-0 shell:min-w-0 shell:flex-1">
      {/* 4K Screen Share Canvas */}
      <video ref={videoRef} autoPlay playsInline muted={isLocalSharing} className="size-full object-contain" />

      {/* Floating presenter chip. Fixed light-on-dark colours: it sits on the shared screen, not on the page theme. */}
      <div className="absolute top-3 left-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-control border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md sm:top-4 sm:left-4">
        <span className="size-2 rounded-full bg-[#5dbb8a]" />
        <span className="truncate font-medium">
          {presenterName}’s 4K Screen Share
        </span>
        {isAudioMuted && <MicIcon muted className="size-3 shrink-0 text-red-400" />}
        {isLocalSharing && onStopScreenShare && (
          <button
            type="button"
            onClick={onStopScreenShare}
            className="ml-2 flex shrink-0 items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors duration-200 ease-out cursor-pointer"
          >
            <MonitorX className="size-3.5" />
            <span>Stop Sharing</span>
          </button>
        )}
      </div>

      {/* Floating Webcam Picture-In-Picture (PIP) */}
      {pip && <div className="absolute right-3 bottom-3 z-20 flex aspect-video w-[30%] max-w-64 min-w-24 overflow-hidden rounded-control sm:right-5 sm:bottom-5">{pip}</div>}
    </div>
  );
}
