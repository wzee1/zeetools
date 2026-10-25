"use client";

import { useEffect, useRef } from "react";
import { MonitorX } from "lucide-react";
import VideoTile from "./VideoTile";

export interface ScreenShareViewProps {
  screenStream: MediaStream;
  localCameraStream: MediaStream | null;
  presenterName: string;
  isLocalSharing: boolean;
  onStopScreenShare: () => void;
  localName: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  micLevel: number;
}

export default function ScreenShareView({
  screenStream,
  localCameraStream,
  presenterName,
  isLocalSharing,
  onStopScreenShare,
  localName,
  isAudioMuted,
  isVideoOff,
  micLevel,
}: ScreenShareViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-control border border-border bg-black shell:aspect-auto shell:min-h-0 shell:flex-1">
      {/* 4K Screen Share Canvas */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="size-full object-contain"
      />

      {/* Floating presenter chip. Fixed light-on-dark colours: it sits on the shared screen, not on the page theme. */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-control border border-white/15 bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-md">
        <span className="size-2 rounded-full bg-[#5dbb8a]" />
        <span className="font-medium">
          {presenterName}’s 4K Screen Share
        </span>
        {isLocalSharing && (
          <button
            type="button"
            onClick={onStopScreenShare}
            className="ml-2 flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors duration-200 ease-out cursor-pointer"
          >
            <MonitorX className="size-3.5" />
            <span>Stop Sharing</span>
          </button>
        )}
      </div>

      {/* Floating Webcam Picture-In-Picture (PIP) */}
      {localCameraStream && (
        <div className="absolute right-5 bottom-5 z-20 flex aspect-video w-48 overflow-hidden rounded-control sm:w-64">
          <VideoTile
            stream={localCameraStream}
            name={localName}
            isLocal
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            speakingLevel={micLevel}
          />
        </div>
      )}
    </div>
  );
}
