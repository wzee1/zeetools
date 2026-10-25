"use client";

import { useEffect, useRef } from "react";
import { Video, VideoOff } from "lucide-react";
import MicIcon from "@zeetools/ui/components/icons/media/mic-icon";
import Button from "@zeetools/ui/components/ui/actions/button";
import IconSwap from "@/components/call/IconSwap";
import { cn } from "@zeetools/ui/lib/utils";

export interface PreCallPreviewProps {
  localStream: MediaStream | null;
  micLevel: number;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  displayName: string;
}

/** The camera preview: the lobby card's main surface, with the mic and camera toggles and a live level bar. */
export default function PreCallPreview({
  localStream,
  micLevel,
  isAudioMuted,
  isVideoOff,
  onToggleAudio,
  onToggleVideo,
  displayName,
}: PreCallPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // The toggles sit on live camera video, so they use fixed light-on-dark colours, not the page theme.
  const toggle = (off: boolean) =>
    cn(
      "size-10 text-white enabled:hover:bg-white/25 enabled:hover:text-white",
      off ? "bg-danger-solid enabled:hover:bg-danger-solid-hover" : "bg-white/15",
    );

  return (
    <div className="relative aspect-video overflow-hidden bg-black shell:aspect-auto shell:min-h-0 shell:min-w-0 shell:flex-1">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 size-full -scale-x-100 object-cover transition-opacity duration-300 ease-out",
          isVideoOff ? "opacity-0" : "opacity-100",
        )}
      />

      {isVideoOff && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface text-muted">
          <div className="mb-2 flex size-20 items-center justify-center rounded-control border border-border bg-surface-raised text-2xl font-normal text-foreground uppercase">
            {displayName.slice(0, 2) || "ZC"}
          </div>
          <span className="text-xs text-muted">Camera is off</span>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-control border border-white/15 bg-black/60 p-1.5 backdrop-blur-md">
        <Button
          variant="ghost"
          onClick={onToggleAudio}
          className={toggle(isAudioMuted)}
          aria-label={isAudioMuted ? "Unmute microphone (M)" : "Mute microphone (M)"}
          title={isAudioMuted ? "Unmute microphone (M)" : "Mute microphone (M)"}
        >
          <MicIcon muted={isAudioMuted} />
        </Button>

        <Button
          variant="ghost"
          onClick={onToggleVideo}
          className={toggle(isVideoOff)}
          aria-label={isVideoOff ? "Turn on camera (V)" : "Turn off camera (V)"}
          title={isVideoOff ? "Turn on camera (V)" : "Turn off camera (V)"}
        >
          <IconSwap active={isVideoOff} on={<VideoOff className="size-4" />} off={<Video className="size-4" />} />
        </Button>
      </div>

      {/* Live mic level, along the bottom edge */}
      <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/20">
        <div
          className="h-full w-full origin-left bg-white transition-transform duration-75 ease-out"
          style={{ transform: `scaleX(${isAudioMuted ? 0 : micLevel})` }}
        />
      </div>
    </div>
  );
}
