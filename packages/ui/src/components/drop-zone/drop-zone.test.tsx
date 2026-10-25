import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../test/render";
import DropZone from "./drop-zone";

const file = (name: string, type = "text/plain") => new File(["x"], name, { type });

describe("DropZone", () => {
  it("passes browsed files on", async () => {
    const onFiles = vi.fn();
    const { user, container } = renderWithProviders(<DropZone onFiles={onFiles} />);
    await user.upload(container.querySelector("input[type=file]")!, [file("a.txt"), file("b.txt")]);
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.txt" }), expect.objectContaining({ name: "b.txt" })]);
  });

  it("keeps only the first file when multiple is off", () => {
    const onFiles = vi.fn();
    renderWithProviders(<DropZone onFiles={onFiles} multiple={false} />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [file("a.png", "image/png"), file("b.png", "image/png")] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: "a.png" })]);
  });

  it("shows a release prompt while a file is dragged over", () => {
    renderWithProviders(<DropZone onFiles={() => {}} />);
    const zone = screen.getByRole("button");
    fireEvent.dragOver(zone);
    expect(screen.getByText("Release to add")).not.toHaveAttribute("aria-hidden", "true");
    fireEvent.dragLeave(zone, { relatedTarget: document.body });
    expect(screen.getByText("Release to add")).toHaveAttribute("aria-hidden", "true");
  });

  it("ignores an empty drop", () => {
    const onFiles = vi.fn();
    renderWithProviders(<DropZone onFiles={onFiles} />);
    fireEvent.drop(screen.getByRole("button"), { dataTransfer: { files: [] } });
    expect(onFiles).not.toHaveBeenCalled();
  });
});
