import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = { title: "UI/Navigation" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const TabsSegmented: Story = {
  name: "Tabs",
  render: () => (
    <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="crop">Crop</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="share" disabled>
            Share
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="text-muted">
          Safe zones for each platform are drawn over the video.
        </TabsContent>
        <TabsContent value="crop" className="text-muted">
          Drag the frame to choose what stays in view.
        </TabsContent>
        <TabsContent value="export" className="text-muted">
          Exports are rendered in your browser.
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="overview" variant="underline">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="text-muted">
          3 files, 46.3 MB in total.
        </TabsContent>
        <TabsContent value="metadata" className="text-muted">
          12 fields found, 4 contain location data.
        </TabsContent>
        <TabsContent value="history" className="text-muted">
          Nothing exported yet.
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const AccordionList: Story = {
  name: "Accordion",
  render: () => (
    <div className="max-w-lg rounded-panel border border-border bg-surface-raised px-4">
      <Accordion type="single" collapsible defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Does anything get uploaded?</AccordionTrigger>
          <AccordionContent>No. Every zee tool runs in your browser, and files never leave your device.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Where are my settings stored?</AccordionTrigger>
          <AccordionContent>In this browser&apos;s local storage. Clearing site data resets them.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="c">
          <AccordionTrigger>Can I use it offline?</AccordionTrigger>
          <AccordionContent>Once the page has loaded, yes. Nothing else needs the network.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
