import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import TrashIcon from "../../icons/actions/trash-icon";
import Button from "../actions/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

const meta = { title: "UI/Dialog", component: Dialog } satisfies Meta<typeof Dialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">
          <TrashIcon />
          Delete files
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete 3 files?</DialogTitle>
          <DialogDescription>They are removed from this browser. Files on your device are not touched.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 px-5 py-4">
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="danger" onClick={() => toast.success("Deleted 3 files")}>
              Delete files
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
};
