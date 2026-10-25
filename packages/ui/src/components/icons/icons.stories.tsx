import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import CloseIcon from "./actions/close-icon";
import CopyIcon from "./actions/copy-icon";
import CropIcon from "./actions/crop-icon";
import DownloadIcon from "./actions/download-icon";
import EraserIcon from "./actions/eraser-icon";
import PlusIcon from "./actions/plus-icon";
import RefreshIcon from "./actions/refresh-icon";
import ScissorsIcon from "./actions/scissors-icon";
import SendIcon from "./actions/send-icon";
import TrashIcon from "./actions/trash-icon";
import UndoIcon from "./actions/undo-icon";
import UploadIcon from "./actions/upload-icon";
import WandIcon from "./actions/wand-icon";
import CameraIcon from "./media/camera-icon";
import ClockIcon from "./media/clock-icon";
import EyeIcon from "./media/eye-icon";
import FileIcon from "./media/file-icon";
import HeadphonesIcon from "./media/headphones-icon";
import ImageIcon from "./media/image-icon";
import MailIcon from "./media/mail-icon";
import MessageIcon from "./media/message-icon";
import MicIcon from "./media/mic-icon";
import PlayPauseIcon from "./media/play-pause-icon";
import VolumeIcon from "./media/volume-icon";
import ChevronDownIcon from "./navigation/chevron-down-icon";
import ChevronRightIcon from "./navigation/chevron-right-icon";
import ExternalLinkIcon from "./navigation/external-link-icon";
import LinkIcon from "./navigation/link-icon";
import MoreIcon from "./navigation/more-icon";
import SearchIcon from "./navigation/search-icon";
import AlertIcon from "./status/alert-icon";
import BellIcon from "./status/bell-icon";
import BookmarkIcon from "./status/bookmark-icon";
import CheckIcon from "./status/check-icon";
import FlagIcon from "./status/flag-icon";
import HeartIcon from "./status/heart-icon";
import InfoIcon from "./status/info-icon";
import LockIcon from "./status/lock-icon";
import ShieldCheckIcon from "./status/shield-check-icon";
import StarIcon from "./status/star-icon";
import ZapIcon from "./status/zap-icon";
import GlobeIcon from "./system/globe-icon";
import KeyboardIcon from "./system/keyboard-icon";
import SettingsIcon from "./system/settings-icon";
import SparklesIcon from "./system/sparkles-icon";
import ThemeIcon from "./system/theme-icon";
import Button from "../ui/actions/button";
import { Tooltip } from "../ui/overlays/tooltip";
import type { IconProps } from "./svg";

const meta = { title: "Foundations/Icons" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const icons = {
  AlertIcon,
  BellIcon,
  BookmarkIcon,
  CameraIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  CropIcon,
  DownloadIcon,
  EraserIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileIcon,
  FlagIcon,
  GlobeIcon,
  HeadphonesIcon,
  HeartIcon,
  ImageIcon,
  InfoIcon,
  KeyboardIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  MessageIcon,
  MicIcon,
  MoreIcon,
  PlayPauseIcon,
  PlusIcon,
  RefreshIcon,
  ScissorsIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  ThemeIcon,
  TrashIcon,
  UndoIcon,
  UploadIcon,
  VolumeIcon,
  WandIcon,
  ZapIcon,
};

// Icons without a state prop; they animate from their parent's hover and press.
const hoverIcons = Object.entries(icons).filter(
  ([name]) => !["ThemeIcon", "CopyIcon", "CheckIcon", "MicIcon", "HeadphonesIcon", "EyeIcon", "LockIcon", "HeartIcon", "PlayPauseIcon", "VolumeIcon", "StarIcon", "BookmarkIcon"].includes(name),
) as [string, (props: IconProps) => React.ReactNode][];

export const Hover: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-3">
      <p className="text-muted">Hover or press each icon. Leave halfway through: every part reverses smoothly from wherever it is.</p>
      <div className="flex flex-wrap gap-1">
        {hoverIcons.map(([name, Icon]) => (
          <Tooltip key={name} label={name.replace(/Icon$/, "")}>
            <Button variant="ghost" size="icon" aria-label={name}>
              <Icon />
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  ),
};

function StateIcon({ label, render }: { label: string; render: (on: boolean) => React.ReactNode }) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button variant="ghost" size="icon" aria-label={label} aria-pressed={on} onClick={() => setOn((v) => !v)}>
        {render(on)}
      </Button>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}

export const WithState: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-3">
      <p className="text-muted">Click to toggle each icon&apos;s state.</p>
      <div className="flex flex-wrap gap-4">
        <StateIcon label="Theme" render={(on) => <ThemeIcon theme={on ? "dark" : "light"} />} />
        <StateIcon label="Copied" render={(on) => <CopyIcon copied={on} />} />
        <StateIcon label="Checked" render={(on) => <CheckIcon checked={on} />} />
        <StateIcon label="Muted" render={(on) => <MicIcon muted={on} />} />
        <StateIcon label="Deafened" render={(on) => <HeadphonesIcon deafened={on} />} />
        <StateIcon label="Hidden" render={(on) => <EyeIcon hidden={on} />} />
        <StateIcon label="Unlocked" render={(on) => <LockIcon locked={!on} />} />
        <StateIcon label="Liked" render={(on) => <HeartIcon liked={on} className={on ? "text-danger" : undefined} />} />
        <StateIcon label="Playing" render={(on) => <PlayPauseIcon playing={on} />} />
        <StateIcon label="Sound off" render={(on) => <VolumeIcon muted={on} />} />
        <StateIcon label="Starred" render={(on) => <StarIcon starred={on} className={on ? "text-[#e8a400]" : undefined} />} />
        <StateIcon label="Saved" render={(on) => <BookmarkIcon saved={on} className={on ? "text-primary-text" : undefined} />} />
      </div>
    </div>
  ),
};
