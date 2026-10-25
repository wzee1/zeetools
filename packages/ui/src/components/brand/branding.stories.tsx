import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { motion } from "motion/react";
import { interactive } from "../../lib/motion";
import PrivacyBadge from "./privacy-badge";
import ZeeHeader from "./zee-header";
import ZeeMark from "./zee-mark";

const meta = { title: "Branding" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Header: Story = {
  parameters: { bare: true },
  render: () => <ZeeHeader />,
};

export const Mark: Story = {
  render: () => (
    <div className="grid gap-3">
      <p className="text-muted">Hover a mark: it turns into a tiny terminal window, with the title-bar dots and a blinking caret.</p>
      <div className="flex items-end gap-4">
        {["size-4", "size-6", "size-10", "size-16"].map((size) => (
          <motion.span key={size} {...interactive} className="inline-flex">
            <ZeeMark className={size} />
          </motion.span>
        ))}
      </div>
    </div>
  ),
};

export const Privacy: Story = { name: "Privacy badge", render: () => <PrivacyBadge /> };
