import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { toast } from "sonner";
import CopyIcon from "../../icons/actions/copy-icon";
import RefreshIcon from "../../icons/actions/refresh-icon";
import TrashIcon from "../../icons/actions/trash-icon";
import ExternalLinkIcon from "../../icons/navigation/external-link-icon";
import MoreIcon from "../../icons/navigation/more-icon";
import SettingsIcon from "../../icons/system/settings-icon";
import Button from "../actions/button";
import Label from "../forms/label";
import Slider from "../forms/slider";
import Switch from "../forms/switch";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = { title: "UI/Menus and popovers" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function OptionsMenu() {
  const [showHidden, setShowHidden] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          Options
          <MoreIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>File</DropdownMenuLabel>
        <DropdownMenuItem hotkey="mod+shift+c">
          <CopyIcon />
          Copy file list
        </DropdownMenuItem>
        <DropdownMenuItem hotkey="mod+r">
          <RefreshIcon />
          Reload
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ExternalLinkIcon />
            Open in
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>zeecut</DropdownMenuItem>
            <DropdownMenuItem>zeeclean</DropdownMenuItem>
            <DropdownMenuItem>zeeprompt</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={showHidden} onCheckedChange={setShowHidden} onSelect={(e) => e.preventDefault()}>
          Show hidden files
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" hotkey="mod+backspace" onSelect={() => toast("Cleared file list")}>
          <TrashIcon />
          Clear file list
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const Dropdown: Story = { render: () => <OptionsMenu /> };

export const PopoverPanel: Story = {
  name: "Popover",
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <SettingsIcon />
          Export settings
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid gap-3">
        <div>
          <p className="font-medium">Export settings</p>
          <p className="text-muted">Applied to the next export.</p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="quality">Quality</Label>
          <Slider id="quality" defaultValue={[80]} />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="audio" defaultChecked />
          <Label htmlFor="audio">Include audio</Label>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
