"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMediaStream } from "@/hooks/use-media-stream";
import { useWebRtc } from "@/hooks/use-webrtc";
import { useDataChannel } from "@/hooks/use-data-channel";
import { useKeyboardControls } from "@/hooks/use-keyboard-controls";
import { useSessionValue } from "@/hooks/use-session-value";
import { usePublishCallSeconds } from "@/hooks/use-call-status";
import { useCopyInvite } from "@/hooks/use-copy-invite";
import { useDialogAtEscape } from "@/hooks/use-dialog-at-escape";
import { useHashRoom } from "@/hooks/use-hash-room";
import { useWindowFileDrop } from "@/hooks/use-window-file-drop";
import { cn } from "@zeetools/ui/lib/utils";
import { generateRoomSlug, randomId } from "@/lib/room";
import CreateRoomView from "@/components/views/CreateRoomView";
import LobbyView from "@/components/views/LobbyView";
import InCallView from "@/components/views/InCallView";

// Same curve out as in: the incoming view staggers itself in (see Stagger in @zeetools/ui).
const exit = { opacity: 0, y: -6, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] as const } };

export default function ZeeCallPage() {
  const roomName = useHashRoom();
  const [customRoomInput, setCustomRoomInput] = useState<string>("");
  const [peerId] = useSessionValue("zeecall_peer_id", () => randomId(8), "", true);
  const [displayName, setDisplayName] = useSessionValue(
    "zeecall_display_name",
    () => `Guest-${randomId(4)}`,
    "Anonymous",
    false
  );
  // The room this tab joined; the call is only on while the URL still names it.
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const inCall = roomName !== "" && joinedRoom === roomName;
  if (joinedRoom !== "" && joinedRoom !== roomName) setJoinedRoom("");

  // Modals & Overlays
  const [isFileDropOpen, setIsFileDropOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Media Stream Controller
  const {
    localStream,
    screenStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    micLevel,
    audioInputs,
    videoInputs,
    audioOutputs,
    selectedAudioDevice,
    selectedVideoDevice,
    selectedAudioOutput,
    setSelectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioOutput,
    startMedia,
    toggleAudio,
    setAudioMuted,
    toggleVideo,
    toggleScreenShare,
    stopScreenShare,
    stopAll,
  } = useMediaStream();

  // WebRTC Coordinator
  const {
    remotePeers,
    signalingStatus,
    overallStats,
    joinRoom,
    leaveRoom,
  } = useWebRtc({
    localStream,
    screenStream,
    onDataChannelReady: (peer, channel) => registerDataChannel(peer, channel),
    onDataChannelClosed: (peer) => unregisterDataChannel(peer),
  });

  // DataChannel Controller (Files & Notes)
  const {
    notes,
    updateNotes,
    exportNotesAsMarkdown,
    activeTransfers,
    sendFile,
    registerDataChannel,
    unregisterDataChannel,
  } = useDataChannel({
    localPeerName: displayName || "Anonymous",
    roomName,
  });

  // Push-to-talk state restoration
  const wasMutedBeforePushRef = useRef(false);

  // Start preview camera when entering lobby
  useEffect(() => {
    if (roomName && !inCall && !localStream) {
      startMedia();
    }
  }, [roomName, inCall, localStream, startMedia]);

  // The sidebar, the brand link and Back can all take the room out of the URL: a live call or camera must not
  // keep running behind the create view, so this does what the Leave button does (both calls are idempotent).
  const previousRoomRef = useRef(roomName);
  useEffect(() => {
    const previous = previousRoomRef.current;
    previousRoomRef.current = roomName;
    if (previous !== "" && previous !== roomName) {
      leaveRoom();
      stopAll();
    }
  }, [roomName, leaveRoom, stopAll]);

  // Call duration counter
  useEffect(() => {
    if (!inCall) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [inCall]);

  // The sidebar shows the elapsed time on the room row (a number only; nothing is stored).
  usePublishCallSeconds(inCall ? callDuration : null);

  // Create room action
  const handleCreateRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const slug = customRoomInput.trim() || generateRoomSlug();
    if (typeof window !== "undefined") {
      window.location.hash = `room=${slug}`;
    }
  };

  // Join Call action
  const handleJoinCall = () => {
    if (!roomName) return;
    setJoinedRoom(roomName);
    setCallDuration(0);
    setIsFileDropOpen(false);
    setIsNotesOpen(false);
    setIsSettingsOpen(false);
    joinRoom(roomName, {
      id: peerId,
      name: displayName || "Anonymous",
      joinedAt: Date.now(),
    });
  };

  // Leave Call action
  const handleLeaveCall = useCallback(() => {
    leaveRoom();
    stopAll();
    setJoinedRoom("");
    setIsFileDropOpen(false);
    setIsNotesOpen(false);
    setIsSettingsOpen(false);
    if (typeof window !== "undefined") {
      window.location.hash = "";
    }
  }, [leaveRoom, stopAll]);

  // Copy Invite link
  const roomInviteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/#room=${roomName}`
    : `https://call.wzee.dev/#room=${roomName}`;

  const { copied: inviteCopied, copy: handleCopyInvite } = useCopyInvite(roomInviteUrl);

  // Whether a dialog that is not one of the call's panels (palette, shortcuts, phone drawer) took this Escape.
  const dialogAtEscapeRef = useDialogAtEscape(inCall);

  // Keyboard Shortcuts Handler
  useKeyboardControls({
    enabled: inCall,
    onToggleMic: toggleAudio,
    onToggleCamera: toggleVideo,
    onToggleScreenShare: toggleScreenShare,
    onPushToTalkStart: () => {
      wasMutedBeforePushRef.current = isAudioMuted;
      if (isAudioMuted) {
        setAudioMuted(false);
      }
    },
    onPushToTalkEnd: () => {
      if (wasMutedBeforePushRef.current) {
        setAudioMuted(true);
      }
    },
    onToggleFullscreen: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    },
    onCopyInvite: handleCopyInvite,
    onToggleFileDrop: () => setIsFileDropOpen((prev) => !prev),
    onEscape: () => {
      if (isFileDropOpen) setIsFileDropOpen(false);
      else if (isNotesOpen) setIsNotesOpen(false);
      else if (isSettingsOpen) setIsSettingsOpen(false);
      else if (!dialogAtEscapeRef.current) handleLeaveCall();
    },
  });

  // Files dropped anywhere on the window in a call go to the peer (and never open in the tab).
  const isDraggingFiles = useWindowFileDrop(inCall, (files) => {
    setIsFileDropOpen(true);
    files.forEach((file) => sendFile(file));
  });

  const devices = {
    audioInputs,
    videoInputs,
    audioOutputs,
    selectedAudioDevice,
    selectedVideoDevice,
    selectedAudioOutput,
    onSelectAudioDevice: (id: string) => {
      setSelectedAudioDevice(id);
      startMedia(id, selectedVideoDevice);
    },
    onSelectVideoDevice: (id: string) => {
      setSelectedVideoDevice(id);
      startMedia(selectedAudioDevice, id);
    },
    onSelectAudioOutput: setSelectedAudioOutput,
  };

  const view = !roomName ? "create" : inCall ? "call" : "lobby";

  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col px-5 py-10 selection:bg-primary/25 sm:px-10 sm:py-12 shell:min-h-0 shell:flex-1",
        view === "call" ? "max-w-none" : "max-w-4xl",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view} exit={exit} className="flex flex-col shell:min-h-0 shell:flex-1">
          {/* VIEW 1: HOME (No room specified in URL hash) */}
          {view === "create" && (
            <CreateRoomView slug={customRoomInput} onChangeSlug={setCustomRoomInput} onCreate={handleCreateRoom} />
          )}

          {/* VIEW 2: LOBBY (Room specified, testing devices before entering call) */}
          {view === "lobby" && (
            <LobbyView
              roomName={roomName}
              preview={{
                localStream,
                micLevel,
                isAudioMuted,
                isVideoOff,
                onToggleAudio: toggleAudio,
                onToggleVideo: toggleVideo,
              }}
              displayName={displayName}
              onChangeDisplayName={setDisplayName}
              devices={devices}
              onJoin={handleJoinCall}
            />
          )}

          {/* VIEW 3: IN-CALL (Active peer grid & controls) */}
          {view === "call" && (
            <InCallView
              roomName={roomName}
              // The last sample stays behind when everyone else leaves; alone, the tag shows the signaling state again.
              stats={remotePeers.length > 0 ? overallStats : { ...overallStats, connectionMode: "unknown", rttMs: 0, packetLossPercent: 0 }}
              signalingStatus={signalingStatus}
              isDragging={isDraggingFiles}
              grid={{
                localStream,
                screenStream,
                remotePeers,
                localName: displayName,
                isAudioMuted,
                isVideoOff,
                isScreenSharing,
                micLevel,
                audioOutput: selectedAudioOutput,
                onStopScreenShare: stopScreenShare,
                roomUrl: roomInviteUrl,
                inviteCopied,
                onCopyInvite: handleCopyInvite,
              }}
              controls={{
                isAudioMuted,
                isVideoOff,
                isScreenSharing,
                isFileDropOpen,
                isNotesOpen,
                isSettingsOpen,
                onToggleAudio: toggleAudio,
                onToggleVideo: toggleVideo,
                onToggleScreenShare: toggleScreenShare,
                onToggleFileDrop: () => setIsFileDropOpen((prev) => !prev),
                onToggleNotes: () => setIsNotesOpen((prev) => !prev),
                onToggleSettings: () => setIsSettingsOpen((prev) => !prev),
                onLeaveCall: handleLeaveCall,
              }}
              fileDrop={{
                isOpen: isFileDropOpen,
                onClose: () => setIsFileDropOpen(false),
                onSendFile: sendFile,
                transfers: activeTransfers,
              }}
              notes={{
                isOpen: isNotesOpen,
                onClose: () => setIsNotesOpen(false),
                notes,
                onUpdateNotes: updateNotes,
                onExportNotes: () =>
                  exportNotesAsMarkdown(
                    callDuration,
                    remotePeers.map((p) => p.name)
                  ),
                callDurationSeconds: callDuration,
              }}
              settings={{
                isOpen: isSettingsOpen,
                onClose: () => setIsSettingsOpen(false),
                ...devices,
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
