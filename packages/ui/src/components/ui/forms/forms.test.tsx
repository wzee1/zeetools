import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/render";
import Checkbox from "./checkbox";
import Switch from "./switch";

describe("Checkbox", () => {
  it("toggles when uncontrolled and reports changes", async () => {
    const onCheckedChange = vi.fn();
    const { user } = renderWithProviders(<Checkbox aria-label="Strip location data" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "Strip location data" });
    expect(box).not.toBeChecked();
    await user.click(box);
    expect(box).toBeChecked();
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
  });

  it("respects defaultChecked", () => {
    renderWithProviders(<Checkbox aria-label="Keep name" defaultChecked />);
    expect(screen.getByRole("checkbox", { name: "Keep name" })).toBeChecked();
  });
});

describe("Switch", () => {
  it("switches on and off", async () => {
    const { user } = renderWithProviders(<Switch aria-label="Include audio" />);
    const toggle = screen.getByRole("switch", { name: "Include audio" });
    await user.click(toggle);
    expect(toggle).toBeChecked();
    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });
});
