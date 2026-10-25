import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { useCommands, type Command } from "./commands";

function Registers({ commands }: { commands: Command[] }) {
  useCommands(commands);
  return null;
}

describe("command menu", () => {
  it("lists registered commands and runs the chosen one", async () => {
    const run = vi.fn();
    const { user } = renderWithProviders(<Registers commands={[{ id: "crop", label: "Crop to 9:16", run }]} />);

    await user.keyboard("{Control>}k{/Control}");
    const input = await screen.findByPlaceholderText("Search or run a command…");
    expect(screen.getByText("Crop to 9:16")).toBeInTheDocument();

    await user.type(input, "crop");
    await user.keyboard("{Enter}");
    expect(run).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByPlaceholderText("Search or run a command…")).not.toBeInTheDocument());
  });

  it("filters out commands that do not match", async () => {
    const { user } = renderWithProviders(
      <Registers
        commands={[
          { id: "crop", label: "Crop to 9:16", run: () => {} },
          { id: "clean", label: "Strip metadata", run: () => {} },
        ]}
      />,
    );
    await user.keyboard("{Control>}k{/Control}");
    await user.type(await screen.findByPlaceholderText("Search or run a command…"), "metadata");
    expect(screen.getByText("Strip metadata")).toBeInTheDocument();
    expect(screen.queryByText("Crop to 9:16")).not.toBeInTheDocument();
  });

  it("runs a command from its hotkey", async () => {
    const run = vi.fn();
    const { user } = renderWithProviders(<Registers commands={[{ id: "clear", label: "Clear", hotkey: "mod+backspace", run }]} />);
    await user.keyboard("{Control>}{Backspace}{/Control}");
    expect(run).toHaveBeenCalledOnce();
  });

  it("skips single-key hotkeys while typing in a field", async () => {
    const run = vi.fn();
    const { user } = renderWithProviders(
      <>
        <Registers commands={[{ id: "toast", label: "Toast", hotkey: "t", run }]} />
        <input aria-label="Name" />
      </>,
    );
    await user.type(screen.getByRole("textbox", { name: "Name" }), "t");
    expect(run).not.toHaveBeenCalled();
    await user.click(document.body);
    await user.keyboard("t");
    expect(run).toHaveBeenCalledOnce();
  });

  it("opens the shortcuts dialog with ?", async () => {
    const { user } = renderWithProviders(<Registers commands={[{ id: "clear", label: "Clear file list", hotkey: "mod+backspace", run: () => {} }]} />);
    await user.keyboard("?");
    expect(await screen.findByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
    expect(screen.getByText("Clear file list")).toBeInTheDocument();
  });
});
