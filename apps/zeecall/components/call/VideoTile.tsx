"use client";

import { useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import MicIcon from "@zeetools/ui/components/icons/media/mic-icon";
import { cn } from "@zeetools/ui/lib/utils";
import { useAudioLevel } from "@/hooks/use-audio-level";
import { useStreamElement } from "@/hooks/use-stream-element";

export interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
  /** The local mic level (0.0 to 1.0); remote tiles measure their own stream instead. */
  speakingLevel?: number;
  /** The speaker the remote audio plays on (a device id from enumerateDevices); empty means the system default. */
  audioOutput?: string;
  className?: string;
  onToggleFullscreen?: () => void;
}

export default function VideoTile({
  stream,
  name,
  isLocal = false,
  isAudioMuted = false,
  isVideoOff = false,
  speakingLevel = 0,
  audioOutput = "",
  className,
  onToggleFullscreen,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useStreamElement(videoRef, stream, { playsAudio: !isLocal, audioOutput });

  const remoteLevel = useAudioLevel(isLocal ? null : stream);
  const level = isLocal ? speakingLevel : remoteLevel;
  const isSpeaking = level > 0.08 && !isAudioMuted;

  const toggleTileFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
      return;
    }

    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      onDoubleClick={toggleTileFullscreen}
      className={cn(
        "group relative min-h-0 w-full overflow-hidden rounded-control border bg-black transition-[border-color] duration-200 ease-out select-none",
        isSpeaking ? "border-primary" : "border-border",
        className
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={cn(
          "absolute inset-0 size-full object-cover transition-opacity duration-300 ease-out",
          isLocal ? "-scale-x-100" : "",
          isVideoOff ? "opacity-0" : "opacity-100"
        )}
      />

      {/* Video Disabled Avatar Fallback */}
      {isVideoOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface px-3 pb-10">
          {/* Bottom padding keeps the avatar and caption clear of the name chip on small tiles. */}
          <div className="flex size-14 items-center justify-center rounded-control border border-border bg-surface-raised text-xl font-normal text-foreground uppercase sm:size-20 sm:text-2xl">
            {name.slice(0, 2) || "U"}
          </div>
          <span className="mt-3 max-w-full truncate text-xs text-muted">{name} (Camera off)</span>
        </div>
      )}

      {/* The overlays below sit on live video: fixed light-on-dark colours keep them legible in both themes. */}
      {/* Top Controls Overlay */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 ease-out">
        <button
          type="button"
          onClick={toggleTileFullscreen}
          className="p-1.5 rounded-control bg-black/60 text-white/85 hover:text-white hover:bg-black/75 backdrop-blur-md border border-white/15 transition-colors duration-200 ease-out cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
        </button>
      </div>

      {/* Participant chip & VU indicator */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-control border border-white/15 bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-md">
        <span className="font-medium max-w-[120px] truncate">
          {name} {isLocal && "(You)"}
        </span>

        {isAudioMuted ? (
          <MicIcon muted className="size-3 text-red-400" />
        ) : (
          <div className="flex items-end gap-0.5 h-3" aria-hidden>
            {(isSpeaking ? [1, 0.83, 0.67] : [0.5, 0.33, 0.5]).map((scale, i) => (
              <span
                key={i}
                // scaleY keeps the animation on the compositor; heights would trigger layout.
                style={{ transform: `scaleY(${scale})` }}
                className={cn(
                  "h-3 w-0.5 origin-bottom rounded-full transition-[transform,background-color] duration-100 ease-out",
                  isSpeaking ? "bg-[#5dbb8a]" : "bg-white/40"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
