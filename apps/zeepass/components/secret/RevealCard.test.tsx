import { act } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import RevealCard from "@/components/secret/RevealCard";
import { renderWithProviders } from "@/test/render";

const ID = "123e4567-e89b-12d3-a456-426614174000";

afterEach(() => {
  window.location.hash = "";
  vi.unstubAllGlobals();
});

describe("RevealCard", () => {
  it("shows the reveal interstitial when the link carries a key", async () => {
    window.location.hash = "#key=abc_DEF-123";
    const { findByRole } = renderWithProviders(<RevealCard id={ID} />);
    expect(await findByRole("button", { name: /reveal secret/i })).toBeEnabled();
  });

  it("explains that the key is missing when the hash is absent or malformed", async () => {
    window.location.hash = "#nokey";
    const { findByText } = renderWithProviders(<RevealCard id={ID} />);
    expect(await findByText("Decryption Key Missing")).toBeInTheDocument();
  });

  it("hydrates server markup without a mismatch when the hash holds a key", async () => {
    // Server render: there is no window, so the URL hash cannot be read.
    vi.stubGlobal("window", undefined);
    const html = renderToString(<RevealCard id={ID} />);
    vi.unstubAllGlobals();

    window.location.hash = "#key=abc_DEF-123";
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <RevealCard id={ID} />, { onRecoverableError });
    });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector("button")).not.toBeNull();
    act(() => root?.unmount());
    container.remove();
  });
});
