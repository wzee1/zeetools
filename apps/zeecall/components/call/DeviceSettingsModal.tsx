"use client";

import SettingsIcon from "@zeetools/ui/components/icons/system/settings-icon";
import Button from "@zeetools/ui/components/ui/actions/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@zeetools/ui/components/ui/overlays/dialog";
import DeviceSelector from "@/components/lobby/DeviceSelector";
import { MediaDeviceSummary } from "@/lib/webrtc/media";

export interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function DeviceSettingsModal({
  isOpen,
  onClose,
  audioInputs,
  videoInputs,
  audioOutputs,
  selectedAudioDevice,
  selectedVideoDevice,
  selectedAudioOutput,
  onSelectAudioDevice,
  onSelectVideoDevice,
  onSelectAudioOutput,
}: DeviceSettingsModalProps) {
  return (
    // Escape is handled once, by the page-level keyboard hook, which closes the top-most panel before leaving.
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby={undefined} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-sm overflow-hidden">
        <DialogHeader className="px-5 py-5 pr-14 sm:px-8 sm:pr-14">
          <DialogTitle className="flex items-center gap-2 font-normal">
            <SettingsIcon className="size-4 text-muted" />
            Audio & Video Devices
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-6 sm:px-8 sm:py-7">
          <DeviceSelector
            audioInputs={audioInputs}
            videoInputs={videoInputs}
            audioOutputs={audioOutputs}
            selectedAudioDevice={selectedAudioDevice}
            selectedVideoDevice={selectedVideoDevice}
            selectedAudioOutput={selectedAudioOutput}
            onSelectAudioDevice={onSelectAudioDevice}
            onSelectVideoDevice={onSelectVideoDevice}
            onSelectAudioOutput={onSelectAudioOutput}
          />
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4 sm:px-8">
          <Button variant="secondary" className="h-10 px-4" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
