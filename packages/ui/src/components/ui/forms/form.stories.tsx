import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import Checkbox from "./checkbox";
import Input from "./input";
import Label from "./label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "./select";
import Slider from "./slider";
import Switch from "./switch";
import Textarea from "./textarea";

const meta = { title: "UI/Form" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Inputs: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor="name">File name</Label>
        <Input id="name" placeholder="interview-final.mp4" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="width">Width</Label>
        <Input id="width" defaultValue="-20" aria-invalid />
        <p className="text-xs text-danger">Enter a width of at least 1 px.</p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" disabled defaultValue="Read only" />
      </div>
      <div className="grid gap-1.5 sm:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Paste a Jira ticket or spec…" />
      </div>
    </div>
  ),
};

export const SelectMenu: Story = {
  name: "Select",
  render: () => (
    <div className="grid max-w-xs gap-1.5">
      <Label>Aspect ratio</Label>
      <Select defaultValue="9:16">
        <SelectTrigger>
          <SelectValue placeholder="Choose a ratio" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Vertical</SelectLabel>
            <SelectItem value="9:16">9:16 · Reels, Shorts, TikTok</SelectItem>
            <SelectItem value="4:5">4:5 · Instagram feed</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Horizontal</SelectLabel>
            <SelectItem value="16:9">16:9 · YouTube</SelectItem>
            <SelectItem value="1:1">1:1 · Square</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Label className="mt-4">Disabled</Label>
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Upload a video first" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

function VolumeSlider() {
  const [volume, setVolume] = useState([60]);
  return (
    <div className="grid max-w-xs gap-1.5">
      <div className="flex items-center justify-between">
        <Label>Volume</Label>
        <span className="text-xs text-muted tabular-nums">{volume[0]}%</span>
      </div>
      <Slider value={volume} onValueChange={setVolume} max={100} step={1} />
      <Label className="mt-4">Disabled</Label>
      <Slider defaultValue={[30]} disabled />
    </div>
  );
}

export const Sliders: Story = { name: "Slider", render: () => <VolumeSlider /> };

export const Switches: Story = {
  name: "Switch",
  render: () => (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Switch id="s1" defaultChecked />
        <Label htmlFor="s1">Show a toast when export finishes</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="s2" />
        <Label htmlFor="s2">Include audio</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="s3" disabled />
        <Label htmlFor="s3">Disabled</Label>
      </div>
    </div>
  ),
};

export const Checkboxes: Story = {
  name: "Checkbox",
  render: () => (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="c1" defaultChecked />
        <Label htmlFor="c1">Strip location data</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c2" />
        <Label htmlFor="c2">Keep original file name</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c3" disabled />
        <Label htmlFor="c3">Disabled</Label>
      </div>
    </div>
  ),
};
