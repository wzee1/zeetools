"use client";

import { MediaDeviceSummary } from "@/lib/webrtc/media";
import { fieldStyles } from "@zeetools/ui/components/ui/forms/input";
import { useId } from "react";
import { Video } from "lucide-react";
import MicIcon from "@zeetools/ui/components/icons/media/mic-icon";
import VolumeIcon from "@zeetools/ui/components/icons/media/volume-icon";
import { cn } from "@zeetools/ui/lib/utils";

export interface DeviceSelectorProps {
  audioInputs: MediaDeviceSummary[];
  videoInputs: MediaDeviceSummary[];
  audioOutputs: MediaDeviceSummary[];
  selectedAudioDevice: string;
  selectedVideoDevice: string;
  selectedAudioOutput: string;
  onSelectAudioDevice: (id: string) => void;
  onSelectVideoDevice: (id: string) => void;
  onSelectAudioOutput: (id: string) => void;
}

export default function DeviceSelector({
  audioInputs,
  videoInputs,
  audioOutputs,
  selectedAudioDevice,
  selectedVideoDevice,
  selectedAudioOutput,
  onSelectAudioDevice,
  onSelectVideoDevice,
  onSelectAudioOutput,
}: DeviceSelectorProps) {
  const micId = useId();
  const cameraId = useId();
  const outputId = useId();

  return (
    <div className="space-y-5 text-sm">
      {/* Microphone Selector */}
      <div className="space-y-2">
        <label htmlFor={micId} className="flex items-center gap-2 text-xs font-medium text-muted">
          <MicIcon className="size-4 text-muted" />
          <span>Microphone</span>
        </label>
        <select
          id={micId}
          value={selectedAudioDevice}
          onChange={(e) => onSelectAudioDevice(e.target.value)}
          className={cn(fieldStyles, "h-10")}
        >
          {audioInputs.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
            </option>
          ))}
          {audioInputs.length === 0 && <option value="">Default Microphone</option>}
        </select>
      </div>

      {/* Camera Selector */}
      <div className="space-y-2">
        <label htmlFor={cameraId} className="flex items-center gap-2 text-xs font-medium text-muted">
          <Video className="size-4 text-muted" />
          <span>Camera</span>
        </label>
        <select
          id={cameraId}
          value={selectedVideoDevice}
          onChange={(e) => onSelectVideoDevice(e.target.value)}
          className={cn(fieldStyles, "h-10")}
        >
          {videoInputs.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
            </option>
          ))}
          {videoInputs.length === 0 && <option value="">Default Camera</option>}
        </select>
      </div>

      {/* Speaker Selector (if available) */}
      {audioOutputs.length > 0 && (
        <div className="space-y-2">
          <label htmlFor={outputId} className="flex items-center gap-2 text-xs font-medium text-muted">
            <VolumeIcon className="size-4 text-muted" />
            <span>Audio Output</span>
          </label>
          <select
            id={outputId}
            value={selectedAudioOutput}
            onChange={(e) => onSelectAudioOutput(e.target.value)}
            className={cn(fieldStyles, "h-10")}
          >
            {audioOutputs.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
