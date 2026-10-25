import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "../actions/button";
import Alert from "./alert";
import Badge from "./badge";
import Progress from "./progress";
import Skeleton from "./skeleton";

const meta = { title: "UI/Feedback" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Toasts: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => toast("Settings saved")}>Default</Button>
      <Button onClick={() => toast.success("Copied 3 lines")}>Success</Button>
      <Button onClick={() => toast.error("This file type isn't supported. Use a PNG or JPEG.")}>Error</Button>
      <Button onClick={() => toast("Cleared file list", { action: { label: "Undo", onClick: () => toast("Restored") } })}>With action</Button>
    </div>
  ),
};

export const Alerts: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-3">
      <Alert dismissible title="Files stay on this device">
        Nothing is uploaded. Closing the tab clears everything except your settings.
      </Alert>
      <Alert dismissible variant="warning" title="Large file">
        This video is 2.1 GB. Processing may take a few minutes.
      </Alert>
      <Alert dismissible variant="danger" title="This file type isn't supported">
        Use MP4, MOV or WebM.
      </Alert>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Draft</Badge>
      <Badge variant="primary">Processing</Badge>
      <Badge variant="success">Exported</Badge>
      <Badge variant="danger">Failed</Badge>
      <Badge variant="brand">New</Badge>
    </div>
  ),
};

function LiveProgress() {
  const [progress, setProgress] = useState(20);
  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 100 ? 10 : Math.min(100, p + 15 + Math.round(Math.random() * 15)))), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="grid max-w-xl gap-2">
      <div className="flex justify-between text-xs text-muted">
        <span>Exporting interview-final.mp4</span>
        <span className="tabular-nums">{progress}%</span>
      </div>
      <Progress value={progress} />
      <span className="mt-4 text-xs text-muted">Indeterminate</span>
      <Progress value={null} />
    </div>
  );
}

export const ProgressBars: Story = { name: "Progress", render: () => <LiveProgress /> };

export const Skeletons: Story = {
  render: () => (
    <div className="grid max-w-sm gap-3">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  ),
};
