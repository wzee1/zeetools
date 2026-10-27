"use client";

import { Users } from "lucide-react";
import { RemotePeerState } from "@/hooks/use-webrtc";
import CopyButtonView from "@zeetools/ui/components/ui/actions/copy-button-view";
import Input from "@zeetools/ui/components/ui/forms/input";
import Kbd from "@zeetools/ui/components/ui/display/kbd";
import { SECTION } from "@/lib/card-classes";
import { cn } from "@zeetools/ui/lib/utils";
import VideoTile from "./VideoTile";
import ScreenShareView from "./ScreenShareView";

export interface VideoGridProps {
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  remotePeers: RemotePeerState[];
  localName: string;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  micLevel: number;
  /** The speaker remote audio plays on. */
  audioOutput: string;
  /** Peers that are sharing their screen right now (they say so over the data channel). */
  sharingPeerIds: string[];
  onStopScreenShare: () => void;
  roomUrl: string;
  inviteCopied: boolean;
  onCopyInvite: () => void;
}

/** Tiles stack on phones (16:9 each); on desktop they split the free height of the card. */
const TILE = "aspect-video shell:aspect-auto";

/** A tile in the strip beside a shared screen: always 16:9. */
const STRIP_TILE = "aspect-video shrink-0";

/** The area under the header row: the card's flex-1 surface while in a call. */
export default function VideoGrid({
  localStream,
  screenStream,
  remotePeers,
  localName,
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  micLevel,
  audioOutput,
  sharingPeerIds,
  onStopScreenShare,
  roomUrl,
  inviteCopied,
  onCopyInvite,
}: VideoGridProps) {
  const totalParticipants = remotePeers.length + 1;
  const surface = "flex flex-col gap-3 p-3 sm:gap-4 sm:p-4 shell:min-h-0 shell:flex-1";

  const localTile = (
    <VideoTile
      stream={localStream}
      name={localName}
      isLocal
      isAudioMuted={isAudioMuted}
      isVideoOff={isVideoOff}
      speakingLevel={micLevel}
      className={TILE}
    />
  );

  const remoteTile = (peer: RemotePeerState, className = TILE) => (
    <VideoTile
      key={peer.id}
      stream={peer.stream}
      name={peer.name}
      isAudioMuted={peer.isAudioMuted}
      isVideoOff={peer.isVideoOff}
      audioOutput={audioOutput}
      className={className}
    />
  );

  // A screen is being shared, by us or by a peer: the screen takes the space, whole, and everyone else sits in a
  // strip beside it (below on phones), so their voices keep playing. A peer's share carries their voice itself.
  const presenter = isScreenSharing && screenStream ? null : remotePeers.find((p) => sharingPeerIds.includes(p.id));
  if ((isScreenSharing && screenStream) || presenter) {
    const strip = presenter
      ? [
          <VideoTile
            key="local"
            stream={localStream}
            name={localName}
            isLocal
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            speakingLevel={micLevel}
            className={STRIP_TILE}
          />,
          ...remotePeers.filter((p) => p.id !== presenter.id).map((p) => remoteTile(p, STRIP_TILE)),
        ]
      : remotePeers.map((p) => remoteTile(p, STRIP_TILE));

    return (
      <div className={cn(surface, "shell:flex-row")}>
        {presenter ? (
          <ScreenShareView
            screenStream={presenter.stream}
            presenterName={presenter.name}
            isAudioMuted={presenter.isAudioMuted}
            isLocalSharing={false}
            audioOutput={audioOutput}
          />
        ) : (
          <ScreenShareView
            screenStream={screenStream!}
            presenterName={localName}
            isAudioMuted={isAudioMuted}
            isLocalSharing
            onStopScreenShare={onStopScreenShare}
            pip={
              localStream && (
                <VideoTile stream={localStream} name={localName} isLocal isAudioMuted={isAudioMuted} isVideoOff={isVideoOff} speakingLevel={micLevel} />
              )
            }
          />
        )}
        {strip.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shell:flex shell:w-64 shell:shrink-0 shell:flex-col shell:overflow-y-auto">{strip}</div>
        )}
      </div>
    );
  }

  // Waiting state: only 1 participant (host alone in room)
  if (remotePeers.length === 0) {
    return (
      <div className="flex flex-col shell:min-h-0 shell:flex-1 shell:flex-row">
        {/* Local Preview Tile */}
        <div className="flex flex-col p-3 sm:p-4 shell:min-h-0 shell:min-w-0 shell:flex-1">
          <VideoTile
            stream={localStream}
            name={localName}
            isLocal
            isAudioMuted={isAudioMuted}
            isVideoOff={isVideoOff}
            speakingLevel={micLevel}
            className={cn(TILE, "shell:flex-1")}
          />
        </div>

        {/* Invite Guest column */}
        <div className={cn(SECTION, "space-y-6 border-t border-border shell:w-80 shell:shrink-0 shell:overflow-y-auto shell:border-t-0 shell:border-l")}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="size-4 shrink-0 text-muted" />
              <h3 className="text-base font-normal text-foreground">Waiting for guest to join</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Share this private room URL with your peer. WebRTC packets will flow directly between your browsers.
            </p>
          </div>

          <Input
            readOnly
            value={roomUrl}
            onFocus={(e) => e.currentTarget.select()}
            aria-label="Room invite link"
            className="h-10 min-w-0 font-mono text-xs"
          />

          <CopyButtonView
            variant="primary"
            copied={inviteCopied}
            onClick={onCopyInvite}
            label="Copy Invite Link"
            copiedLabel="Link Copied!"
            className="h-10 w-full px-4"
          >
            <Kbd hotkey="mod+c" />
          </CopyButtonView>
        </div>
      </div>
    );
  }

  // 1-on-1 Split screen (2 participants total)
  if (totalParticipants === 2) {
    const peer = remotePeers[0];
    return (
      <div className={cn(surface, "sm:grid sm:grid-cols-2 shell:grid-rows-[minmax(0,1fr)]")}>
        {localTile}
        {remoteTile(peer)}
      </div>
    );
  }

  // Multi-peer grid (3 to 4 participants)
  return (
    <div className={cn(surface, "sm:grid sm:grid-cols-2 shell:grid-rows-[repeat(2,minmax(0,1fr))]")}>
      {localTile}
      {remotePeers.map((peer) => remoteTile(peer))}
    </div>
  );
}
