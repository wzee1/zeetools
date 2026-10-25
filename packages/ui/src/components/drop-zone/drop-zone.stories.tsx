import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import DropZone from "./drop-zone";

const meta = {
  title: "Tool/DropZone",
  component: DropZone,
  args: { onFiles: fn(), hint: "You can also paste files here.", multiple: true },
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
} satisfies Meta<typeof DropZone>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Multiple: Story = {};

export const SingleImage: Story = { args: { multiple: false, accept: "image/*", hint: "PNG, JPEG or WebP" } };
