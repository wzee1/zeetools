import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLocalStore } from "./use-local-store";

describe("useLocalStore", () => {
  it("starts from the initial value and persists updates as JSON", () => {
    const { result } = renderHook(() => useLocalStore("zee:test", { count: 0 }));
    expect(result.current[0]).toEqual({ count: 0 });
    act(() => result.current[1]({ count: 2 }));
    expect(result.current[0]).toEqual({ count: 2 });
    expect(JSON.parse(localStorage.getItem("zee:test")!)).toEqual({ count: 2 });
  });

  it("supports updater functions", () => {
    const { result } = renderHook(() => useLocalStore("zee:n", 1));
    act(() => result.current[1]((n) => n + 1));
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(3);
  });

  it("keeps components using the same key in sync", () => {
    const a = renderHook(() => useLocalStore("zee:shared", "a"));
    const b = renderHook(() => useLocalStore("zee:shared", "a"));
    act(() => a.result.current[1]("changed"));
    expect(b.result.current[0]).toBe("changed");
  });

  it("falls back to the initial value when stored JSON is broken", () => {
    localStorage.setItem("zee:broken", "{not json");
    const { result } = renderHook(() => useLocalStore("zee:broken", 7));
    expect(result.current[0]).toBe(7);
  });
});
