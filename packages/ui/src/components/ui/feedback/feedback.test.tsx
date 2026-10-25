import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../../../../test/render";
import Alert from "./alert";

describe("Alert", () => {
  it("can be dismissed and reports it", async () => {
    const onDismiss = vi.fn();
    const { user } = renderWithProviders(
      <Alert dismissible onDismiss={onDismiss} title="Large file">
        Processing may take a few minutes.
      </Alert>,
    );
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText("Large file")).not.toBeInTheDocument());
  });

  it("has no dismiss button unless asked", () => {
    renderWithProviders(<Alert title="Files stay on this device" />);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });
});
