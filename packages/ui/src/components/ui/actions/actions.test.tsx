import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/render";
import Button from "./button";
import Toggle from "./toggle";

describe("Button", () => {
  it("calls onClick", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(<Button onClick={onClick}>Export</Button>);
    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("ignores clicks while disabled", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <Button onClick={onClick} disabled>
        Export
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Export" }));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Export" })).toBeDisabled();
  });
});

describe("Toggle", () => {
  it("exposes its state through aria-pressed", async () => {
    const { user } = renderWithProviders(<Toggle aria-label="Mute">M</Toggle>);
    const toggle = screen.getByRole("button", { name: "Mute" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});
