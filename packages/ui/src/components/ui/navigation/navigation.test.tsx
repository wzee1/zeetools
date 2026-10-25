import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../../test/render";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
  it("shows the panel for the selected tab", async () => {
    const { user } = renderWithProviders(
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="crop">Crop</TabsTrigger>
          <TabsTrigger value="share" disabled>
            Share
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview">Safe zones</TabsContent>
        <TabsContent value="crop">Drag the frame</TabsContent>
        <TabsContent value="share">Share link</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Safe zones")).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Crop" }));
    expect(screen.getByText("Drag the frame")).toBeVisible();
    expect(screen.queryByText("Safe zones")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Share" }));
    expect(screen.queryByText("Share link")).not.toBeInTheDocument();
  });
});
