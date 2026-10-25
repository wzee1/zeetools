import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { useSessionValue } from "@/hooks/use-session-value";

function Probe({ k }: { k: string }) {
  const [value] = useSessionValue(k, () => "client", "server", true);
  return <span>{value}</span>;
}

describe("useSessionValue", () => {
  beforeEach(() => sessionStorage.clear());

  it("renders the server value on the server", () => {
    expect(renderToString(<Probe k="t:ssr" />)).toContain("server");
  });

  it("creates, persists and reuses a value", () => {
    const first = renderHook(() => useSessionValue("t:persist", () => "made", "", true));
    expect(first.result.current[0]).toBe("made");
    expect(sessionStorage.getItem("t:persist")).toBe("made");
  });

  it("does not store a default without persist, but stores explicit sets (including empty)", () => {
    const { result } = renderHook(() => useSessionValue("t:name", () => "Guest-1", "Anonymous", false));
    expect(result.current[0]).toBe("Guest-1");
    expect(sessionStorage.getItem("t:name")).toBeNull();
    act(() => result.current[1](""));
    expect(result.current[0]).toBe("");
    expect(sessionStorage.getItem("t:name")).toBe("");
  });
});
