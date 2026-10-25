import { afterEach, describe, expect, it, vi } from "vitest";
import { formatHotkey, matchesHotkey } from "./use-hotkeys";

type Keys = Partial<Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey">>;

const press = (keys: Keys) => ({ metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...keys }) as KeyboardEvent;

const onPlatform = (platform: string) => vi.stubGlobal("navigator", { platform });

afterEach(() => vi.unstubAllGlobals());

describe("matchesHotkey", () => {
  it("treats mod as ⌘ on macOS", () => {
    onPlatform("MacIntel");
    expect(matchesHotkey(press({ key: "k", metaKey: true }), "mod+k")).toBe(true);
    expect(matchesHotkey(press({ key: "k", ctrlKey: true }), "mod+k")).toBe(false);
  });

  it("treats mod as Ctrl elsewhere", () => {
    onPlatform("Win32");
    expect(matchesHotkey(press({ key: "k", ctrlKey: true }), "mod+k")).toBe(true);
    expect(matchesHotkey(press({ key: "k", metaKey: true }), "mod+k")).toBe(false);
  });

  it("requires shift when the hotkey names it, ignoring the key's case", () => {
    onPlatform("MacIntel");
    expect(matchesHotkey(press({ key: "C", metaKey: true, shiftKey: true }), "mod+shift+c")).toBe(true);
    expect(matchesHotkey(press({ key: "c", metaKey: true }), "mod+shift+c")).toBe(false);
  });

  it("does not fire a plain letter hotkey while shift is held", () => {
    onPlatform("MacIntel");
    expect(matchesHotkey(press({ key: "t" }), "t")).toBe(true);
    expect(matchesHotkey(press({ key: "T", shiftKey: true }), "t")).toBe(false);
  });

  it("matches shifted symbols without listing shift", () => {
    onPlatform("MacIntel");
    expect(matchesHotkey(press({ key: "?", shiftKey: true }), "?")).toBe(true);
  });

  it("rejects extra modifiers", () => {
    onPlatform("MacIntel");
    expect(matchesHotkey(press({ key: "k", metaKey: true, altKey: true }), "mod+k")).toBe(false);
  });
});

describe("formatHotkey", () => {
  it("uses symbols on macOS", () => {
    expect(formatHotkey("mod+shift+c", true)).toEqual(["⌘", "⇧", "C"]);
    expect(formatHotkey("alt+enter", true)).toEqual(["⌥", "↵"]);
  });

  it("uses words elsewhere", () => {
    expect(formatHotkey("mod+shift+c", false)).toEqual(["Ctrl", "Shift", "C"]);
  });

  it("names special keys", () => {
    expect(formatHotkey("escape", true)).toEqual(["Esc"]);
    expect(formatHotkey("mod+backspace", true)).toEqual(["⌘", "⌫"]);
  });
});
