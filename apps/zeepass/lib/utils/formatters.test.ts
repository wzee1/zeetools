import { describe, expect, it } from "vitest";
import { base64UrlToBuffer, bufferToBase64Url } from "./formatters";

describe("base64url formatters", () => {
  it("round-trips arbitrary bytes", () => {
    const bytes = new Uint8Array(256).map((_, i) => i);
    const decoded = new Uint8Array(base64UrlToBuffer(bufferToBase64Url(bytes.buffer)));
    expect(Array.from(decoded)).toEqual(Array.from(bytes));
  });

  it("uses the URL-safe alphabet without padding", () => {
    // 0xfb 0xff 0xfe encodes to "+//+" in standard base64 and 1 and 2 byte inputs need padding.
    expect(bufferToBase64Url(new Uint8Array([0xfb, 0xff, 0xfe]).buffer)).toBe("-__-");
    expect(bufferToBase64Url(new Uint8Array([1]).buffer)).toBe("AQ");
    expect(bufferToBase64Url(new Uint8Array([1, 2]).buffer)).toBe("AQI");
  });

  it("handles the empty buffer", () => {
    expect(bufferToBase64Url(new ArrayBuffer(0))).toBe("");
    expect(base64UrlToBuffer("").byteLength).toBe(0);
  });

  it("rejects input that is not base64", () => {
    expect(() => base64UrlToBuffer("***")).toThrow();
  });
});
