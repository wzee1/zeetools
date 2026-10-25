import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DownloadIcon from "../../icons/actions/download-icon";
import PlusIcon from "../../icons/actions/plus-icon";
import TrashIcon from "../../icons/actions/trash-icon";
import Button from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Export", variant: "secondary", size: "md", disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "icon"] },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Primary: Story = { args: { variant: "primary", children: "Export video" } };

export const Danger: Story = {
  args: { variant: "danger" },
  render: (args) => (
    <Button {...args}>
      <TrashIcon />
      Delete 3 files
    </Button>
  ),
};

export const WithIcon: Story = {
  args: { variant: "primary" },
  render: (args) => (
    <Button {...args}>
      <DownloadIcon />
      Download
    </Button>
  ),
};

export const IconOnly: Story = {
  args: { variant: "ghost", size: "icon" },
  render: (args) => (
    <Button {...args} aria-label="Add file">
      <PlusIcon />
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid gap-3">
      {(["primary", "secondary", "ghost", "danger"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-3">
          <span className="w-20 text-xs text-muted">{variant}</span>
          <Button variant={variant} size="sm">
            Small
          </Button>
          <Button variant={variant}>Medium</Button>
          <Button variant={variant}>
            <DownloadIcon />
            With icon
          </Button>
          <Button variant={variant} size="icon" aria-label="Delete">
            <TrashIcon />
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
};
