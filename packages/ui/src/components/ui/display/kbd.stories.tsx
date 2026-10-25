import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Kbd from "./kbd";

const meta = {
  title: "UI/Kbd",
  component: Kbd,
  args: { hotkey: "mod+shift+c" },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Examples: Story = {
  render: () => (
    <div className="grid gap-3">
      <p className="text-muted">Hold any of these keys: the matching hints light up.</p>
      <div className="flex flex-wrap items-center gap-4">
        {["mod+k", "mod+shift+c", "alt+enter", "?", "escape", "mod+backspace"].map((hotkey) => (
          <Kbd key={hotkey} hotkey={hotkey} />
        ))}
      </div>
    </div>
  ),
};
