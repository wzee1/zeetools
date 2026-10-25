import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Button from "../actions/button";
import Skeleton from "../feedback/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import Separator from "./separator";

const meta = { title: "UI/Card" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const CardPanel: Story = {
  name: "Card",
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>interview-final.mp4</CardTitle>
        <CardDescription>1920 × 1080 · 46 MB</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Skeleton className="aspect-video w-full" />
        <Separator />
        <p className="text-muted">Ready to export as 9:16.</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Export</Button>
      </CardFooter>
    </Card>
  ),
};
