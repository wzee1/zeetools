import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CountUp from "./count-up";
import InkParagraph from "./ink-paragraph";
import Magnetic from "./magnetic";
import Marquee from "./marquee";
import SplitText from "./split-text";

const meta = { title: "Motion" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const items = ["TypeScript", "React", "Next.js", "Tailwind CSS", "Motion", "Radix", "Vitest", "Cypress", "Storybook"];

export const ScrollMarquee: Story = {
  parameters: { bare: true },
  render: () => (
    <div className="py-16">
      <p className="mb-6 px-8 text-muted">Scroll the page to speed it up; scroll back to reverse it. It only runs while on screen, and holds still with reduced motion.</p>
      <Marquee items={items} className="border-y border-border py-6 text-6xl font-semibold tracking-tight" itemClassName="pr-[0.1em]" />
      <div className="h-[150vh]" />
    </div>
  ),
};

export const SplitTextReveal: Story = {
  render: () => (
    <h1 className="text-[clamp(3rem,12vw,9rem)] leading-[0.85] font-semibold tracking-[-0.045em]">
      <SplitText lines={["Small tools", "that run"]} period />
    </h1>
  ),
};

export const MagneticButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 py-16">
      <p className="w-full text-muted">Move a mouse near the buttons; they lean toward the pointer and spring back.</p>
      <Magnetic>
        <span className="block rounded-full bg-primary px-5 py-2.5 text-primary-foreground">Magnetic</span>
      </Magnetic>
      <Magnetic strength={0.6}>
        <span className="block rounded-full border border-border px-5 py-2.5">Stronger pull</span>
      </Magnetic>
    </div>
  ),
};

export const CountUpNumbers: Story = {
  render: () => (
    <div className="flex gap-12 text-5xl font-semibold tracking-tight">
      <CountUp value="12+ yrs" />
      <CountUp value="4.67" />
      <CountUp value="250" />
    </div>
  ),
};

export const InkingParagraph: Story = {
  parameters: { bare: true },
  render: () => (
    <div className="px-8 py-[60vh]">
      <InkParagraph
        className="max-w-3xl text-4xl leading-tight font-medium tracking-tight"
        text="Scroll down and this paragraph inks in word by word, driven by a single scroll value and a little CSS. With reduced motion it is simply fully inked."
      />
    </div>
  ),
};
