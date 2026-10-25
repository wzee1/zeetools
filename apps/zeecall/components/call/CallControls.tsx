"use client";

import { ScreenShare, Video, VideoOff, PhoneOff } from "lucide-react";
import FileIcon from "@zeetools/ui/components/icons/media/file-icon";
import MicIcon from "@zeetools/ui/components/icons/media/mic-icon";
import SettingsIcon from "@zeetools/ui/components/icons/system/settings-icon";
import UploadIcon from "@zeetools/ui/components/icons/actions/upload-icon";
import Button from "@zeetools/ui/components/ui/actions/button";
import { Tooltip } from "@zeetools/ui/components/ui/overlays/tooltip";
import { FOOTER } from "@/lib/card-classes";
import { cn } from "@zeetools/ui/lib/utils";
import DockButton from "./DockButton";
import IconSwap from "./IconSwap";

export interface CallControlsProps {
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isFileDropOpen: boolean;
  isNotesOpen: boolean;
  isSettingsOpen: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleFileDrop: () => void;
  onToggleNotes: () => void;
  onToggleSettings: () => void;
  onLeaveCall: () => void;
}

/** The call's dock: the card's footer row, with the controls centred and Leave last after a hairline divider. */
export default function CallControls({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  isFileDropOpen,
  isNotesOpen,
  isSettingsOpen,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleFileDrop,
  onToggleNotes,
  onToggleSettings,
  onLeaveCall,
}: CallControlsProps) {
  return (
    <div className={cn(FOOTER, "flex-row flex-wrap items-center justify-center gap-1 px-3 py-4 select-none sm:gap-1.5")}>
      {/* Microphone Toggle (M) */}
      <DockButton
        onClick={onToggleAudio}
        tone={isAudioMuted ? "alert" : "neutral"}
        title={isAudioMuted ? "Unmute Microphone (M)" : "Mute Microphone (M)"}
        label={isAudioMuted ? "Unmute" : "Mute"}
        hotkey="m"
      >
        <MicIcon muted={isAudioMuted} />
      </DockButton>

      {/* Camera Toggle (V) */}
      <DockButton
        onClick={onToggleVideo}
        tone={isVideoOff ? "alert" : "neutral"}
        title={isVideoOff ? "Turn on Camera (V)" : "Turn off Camera (V)"}
        label={isVideoOff ? "Camera On" : "Camera Off"}
        hotkey="v"
      >
        <IconSwap active={isVideoOff} on={<VideoOff className="size-4" />} off={<Video className="size-4" />} />
      </DockButton>

      {/* 4K Screen Share Toggle (S) */}
      <DockButton
        onClick={onToggleScreenShare}
        tone={isScreenSharing ? "on" : "neutral"}
        pressed={isScreenSharing}
        title="4K Screen Share (S)"
        label="4K Screen Share"
        hotkey="s"
      >
        <ScreenShare className="size-4" />
      </DockButton>

      {/* File Drop Panel (Cmd + D) */}
      <DockButton
        onClick={onToggleFileDrop}
        tone={isFileDropOpen ? "on" : "neutral"}
        pressed={isFileDropOpen}
        title="Direct File Drop (⌘D)"
        label="File Drop"
        hotkey="mod+d"
      >
        <UploadIcon />
      </DockButton>

      {/* Synced Notes / Scratchpad */}
      <DockButton onClick={onToggleNotes} tone={isNotesOpen ? "on" : "neutral"} pressed={isNotesOpen} title="Call Notes" label="Meeting Notes">
        <FileIcon />
      </DockButton>

      {/* Hardware Device Settings */}
      <DockButton onClick={onToggleSettings} tone={isSettingsOpen ? "on" : "neutral"} pressed={isSettingsOpen} title="Device Settings">
        <SettingsIcon />
      </DockButton>

      <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />

      {/* End Call Button (Esc) */}
      <Tooltip label="Leave Call" hotkey="escape">
        <Button variant="danger" onClick={onLeaveCall} aria-label="Leave Call (Esc)" className="size-9 sm:size-10">
          <PhoneOff className="size-4" />
        </Button>
      </Tooltip>
    </div>
  );
}
