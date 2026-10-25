"use client";

import PageHeader from "@zeetools/ui/components/brand/page-header";
import Stagger from "@zeetools/ui/components/motion/stagger";
import StaggerItem from "@zeetools/ui/components/motion/stagger-item";
import { Card } from "@zeetools/ui/components/ui/display/card";
import CallControls, { type CallControlsProps } from "@/components/call/CallControls";
import CallNotes, { type CallNotesProps } from "@/components/call/CallNotes";
import ConnectionQuality from "@/components/call/ConnectionQuality";
import DeviceSettingsModal, { type DeviceSettingsModalProps } from "@/components/call/DeviceSettingsModal";
import FileDropZone, { type FileDropZoneProps } from "@/components/call/FileDropZone";
import VideoGrid, { type VideoGridProps } from "@/components/call/VideoGrid";
import { CARD } from "@/lib/card-classes";
import type { ConnectionQualityStats } from "@/lib/webrtc/stats";

interface InCallViewProps {
  roomName: string;
  stats: ConnectionQualityStats;
  signalingStatus: string;
  /** Files are being dragged over the window: the card border turns green. */
  isDragging: boolean;
  grid: VideoGridProps;
  controls: CallControlsProps;
  fileDrop: FileDropZoneProps;
  notes: CallNotesProps;
  settings: DeviceSettingsModalProps;
}

/** The call: the video grid is the card's surface, the dock is its footer row, the three panels are dialogs. */
export default function InCallView({ roomName, stats, signalingStatus, isDragging, grid, controls, fileDrop, notes, settings }: InCallViewProps) {
  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader title={`Room #${roomName}`} aside={<ConnectionQuality stats={stats} signalingStatus={signalingStatus} />} />

      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <Card className={CARD} data-dragging={isDragging || undefined}>
          <VideoGrid {...grid} />
          <CallControls {...controls} />
        </Card>
      </StaggerItem>

      {/* The dialogs are portalled by Radix, so the card's container does not trap them. */}
      <FileDropZone {...fileDrop} />
      <CallNotes {...notes} />
      <DeviceSettingsModal {...settings} />
    </Stagger>
  );
}
