import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Button from "../actions/button";
import { renderWithProviders } from "../../../../test/render";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

describe("Dialog", () => {
  it("opens from its trigger and closes with the close button and Escape", async () => {
    const { user } = renderWithProviders(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Delete files</Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Delete 3 files?</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Delete files" }));
    expect(screen.getByRole("dialog", { name: "Delete 3 files?" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "Delete files" }));
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("Popover", () => {
  it("has a close button", async () => {
    const { user } = renderWithProviders(
      <Popover>
        <PopoverTrigger asChild>
          <Button>Export settings</Button>
        </PopoverTrigger>
        <PopoverContent>Applied to the next export.</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByRole("button", { name: "Export settings" }));
    expect(screen.getByText("Applied to the next export.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByText("Applied to the next export.")).not.toBeInTheDocument());
  });
});
