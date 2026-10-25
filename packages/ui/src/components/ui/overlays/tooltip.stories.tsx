import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SettingsIcon from "../../icons/system/settings-icon";
import Button from "../actions/button";
import { Tooltip } from "./tooltip";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  args: { label: "Download file list", hotkey: "mod+s", children: null },
  render: (args) => (
    <div className="p-12">
      <Tooltip {...args}>
        <Button>Hover me</Button>
      </Tooltip>
    </div>
  ),
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithHotkey: Story = {};

export const Plain: Story = { args: { label: "Settings", hotkey: undefined }, render: (args) => (
  <div className="p-12">
    <Tooltip {...args}>
      <Button variant="ghost" size="icon" aria-label="Settings">
        <SettingsIcon />
      </Button>
    </Tooltip>
  </div>
) };
