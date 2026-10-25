import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RevealObserver from "./reveal-observer";

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

describe("RevealObserver", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.reveals;
  });

  it("reveals each marked element once it intersects, then stops watching it", async () => {
    let fire: Callback = () => {};
    const observe = vi.fn();
    const unobserve = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: Callback) {
          fire = callback;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect() {}
      },
    );

    const { container } = render(
      <>
        <RevealObserver />
        <p data-reveal="up">Seen</p>
        <p data-reveal="up">Not yet</p>
        <p>Not marked</p>
      </>,
    );
    const [seen, notYet] = container.querySelectorAll<HTMLElement>("[data-reveal]");
    expect(observe).toHaveBeenCalledTimes(2);
    expect(document.documentElement.dataset.reveals).toBe("on");

    act(() => fire([{ target: seen, isIntersecting: true }, { target: notYet, isIntersecting: false }]));
    expect(seen).toHaveAttribute("data-revealed");
    expect(notYet).not.toHaveAttribute("data-revealed");
    expect(unobserve).toHaveBeenCalledWith(seen);

    // Elements that mount later are picked up too.
    const late = document.createElement("div");
    late.dataset.reveal = "fade";
    await act(async () => {
      container.appendChild(late);
      await Promise.resolve();
    });
    expect(observe).toHaveBeenCalledWith(late);
  });
});
