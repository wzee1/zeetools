"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMediaStream } from "@/hooks/use-media-stream";
import { useWebRtc } from "@/hooks/use-webrtc";
import { useDataChannel } from "@/hooks/use-data-channel";
import { useKeyboardControls } from "@/hooks/use-keyboard-controls";
import { useSessionValue } from "@/hooks/use-session-value";
import { usePublishCallStatus } from "@/hooks/use-call-status";
import { useCopyInvite } from "@/hooks/use-copy-invite";
import { useDialogAtEscape } from "@/hooks/use-dialog-at-escape";
import { useHashRoom } from "@/hooks/use-hash-room";
import { useRoomHistory } from "@/hooks/use-room-history";
import { useWindowFileDrop } from "@/hooks/use-window-file-drop";
import { cn } from "@zeetools/ui/lib/utils";
import { generateRoomSlug, randomId } from "@/lib/room";
import CreateRoomView from "@/components/views/CreateRoomView";
import LobbyView from "@/components/views/LobbyView";
import InCallView from "@/components/views/InCallView";
import ConfirmDialog from "@/components/call/ConfirmDialog";
import IncomingFileDialog from "@/components/call/IncomingFileDialog";
import PeerAudio from "@/components/call/PeerAudio";

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
  // The room this tab's call is live in. The call keeps running while another room or the create view is open;
  // the call view shows only while the URL names this room.
  const [joinedRoom, setJoinedRoom] = useState<string>("");
  const inCall = roomName !== "" && joinedRoom === roomName;
  // Asks before something ends the call: Esc in the call, or joining another room while one is live.
  const [confirm, setConfirm] = useState<"leave" | "switch" | null>(null);
  const { remember } = useRoomHistory();

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
    receivedFiles,
    saveFile,
    discardFile,
    sharingPeerIds,
    announceScreenShare,
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

  // Every room opened here is listed in the sidebar ("On this device"), so it is one click away later.
  useEffect(() => {
    if (roomName) remember(roomName);
  }, [roomName, remember]);

  // Leaving a lobby for the create view turns its camera preview off. A live call keeps running in the background
  // (its row in the sidebar shows the timer); only Leave ends it.
  const previousRoomRef = useRef(roomName);
  useEffect(() => {
    const previous = previousRoomRef.current;
    previousRoomRef.current = roomName;
    if (previous !== "" && roomName === "" && !joinedRoom) stopAll();
  }, [roomName, joinedRoom, stopAll]);

  // Peers are told when we share our screen, so they show it whole instead of as a cropped camera tile.
  useEffect(() => {
    announceScreenShare(isScreenSharing);
  }, [isScreenSharing, announceScreenShare]);

  // Call duration counter (runs while the call is live, on screen or not)
  useEffect(() => {
    if (!joinedRoom) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [joinedRoom]);

  // The sidebar marks the live room with the elapsed time.
  usePublishCallStatus(joinedRoom || null, callDuration);

  // Create room action
  const handleCreateRoom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const slug = customRoomInput.trim() || generateRoomSlug();
    if (typeof window !== "undefined") {
      window.location.hash = `room=${slug}`;
    }
  };

  // Join Call action
  const joinCall = () => {
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

  // One call at a time: joining another room while a call is live asks first.
  const handleJoinCall = () => {
    if (!roomName) return;
    if (joinedRoom && joinedRoom !== roomName) setConfirm("switch");
    else joinCall();
  };

  const confirmSwitch = () => {
    setConfirm(null);
    leaveRoom();
    joinCall();
  };

  // Leave Call action
  const handleLeaveCall = useCallback(() => {
    setConfirm(null);
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
      else if (!dialogAtEscapeRef.current) setConfirm("leave");
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

  // A received file waits in memory until the user saves or discards it.
  const pendingFile =
    activeTransfers.find((t) => t.direction === "receive" && t.status === "completed" && receivedFiles[t.fileId] === "pending") ?? null;
  const pendingSender = remotePeers.find((p) => p.id === pendingFile?.peerId)?.name ?? "Peer";

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
                sharingPeerIds,
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
                receivedFiles,
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

      {/* Away from the call view the tiles are gone, so the peers' voices play from here. */}
      {joinedRoom && view !== "call" && remotePeers.map((peer) => <PeerAudio key={peer.id} stream={peer.stream} audioOutput={selectedAudioOutput} />)}

      <IncomingFileDialog file={pendingFile} senderName={pendingSender} onSave={saveFile} onDiscard={discardFile} />

      <ConfirmDialog
        open={confirm === "leave"}
        title="Leave the call?"
        description={<>You will disconnect from Room #{joinedRoom}.</>}
        confirmLabel="Leave Call"
        onConfirm={handleLeaveCall}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "switch"}
        title="Leave the current call?"
        description={<>You are in a call in Room #{joinedRoom}. Joining Room #{roomName} ends it.</>}
        confirmLabel={`Join Call #${roomName}`}
        onConfirm={confirmSwitch}
        onCancel={() => setConfirm(null)}
      />
    </main>
  );
}
