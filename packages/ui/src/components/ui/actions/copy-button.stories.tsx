import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CopyButton from "./copy-button";

const meta = { title: "UI/Copy button" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Copy: Story = {
  render: () => (
    <div className="flex gap-3">
      <CopyButton text="Hello from zee" />
      <CopyButton text="" label="Nothing to copy" />
    </div>
  ),
};
