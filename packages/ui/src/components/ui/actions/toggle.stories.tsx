import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import HeadphonesIcon from "../../icons/media/headphones-icon";
import MicIcon from "../../icons/media/mic-icon";
import SettingsIcon from "../../icons/system/settings-icon";
import { Tooltip } from "../overlays/tooltip";
import Button from "./button";
import Toggle from "./toggle";

const meta = { title: "UI/Toggle" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function VoiceBar() {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 rounded-panel border border-border bg-surface p-1">
        <Tooltip label={muted ? "Unmute" : "Mute"}>
          <Toggle aria-label="Mute" pressed={muted} onPressedChange={setMuted}>
            <MicIcon muted={muted} />
          </Toggle>
        </Tooltip>
        <Tooltip label={deafened ? "Undeafen" : "Deafen"}>
          <Toggle
            aria-label="Deafen"
            pressed={deafened}
            onPressedChange={(on) => {
              setDeafened(on);
              setMuted(on);
            }}
          >
            <HeadphonesIcon deafened={deafened} />
          </Toggle>
        </Tooltip>
        <Tooltip label="Settings">
          <Button variant="ghost" size="icon" aria-label="Settings">
            <SettingsIcon />
          </Button>
        </Tooltip>
      </div>
      <p className="text-muted">Deafening also mutes, like Discord.</p>
    </div>
  );
}

export const Toggles: Story = { render: () => <VoiceBar /> };
