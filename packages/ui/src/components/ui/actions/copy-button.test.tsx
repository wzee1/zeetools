import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../../test/render";
import CopyButton from "./copy-button";

describe("CopyButton", () => {
  it("copies its text and confirms", async () => {
    const { user } = renderWithProviders(<CopyButton text="hello from zee" />);
    await user.click(screen.getByRole("button", { name: /copy/i }));
    await expect(navigator.clipboard.readText()).resolves.toBe("hello from zee");
    expect(screen.getByText("Copied")).not.toHaveAttribute("aria-hidden", "true");
  });

  it("is disabled when there is nothing to copy", () => {
    renderWithProviders(<CopyButton text="" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
