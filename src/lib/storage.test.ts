import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { clampNumber, readJSON, readString, writeJSON, writeString } from "./storage";

describe("readJSON", () => {
  beforeEach(() => localStorage.clear());

  it("falls back instead of throwing on malformed JSON", () => {
    localStorage.setItem("k", "{not json");
    expect(readJSON("k", { safe: true })).toEqual({ safe: true });
  });

  it("falls back when the validator rejects the value", () => {
    const isNumberArray = (v: unknown): v is number[] =>
      Array.isArray(v) && v.every((n) => typeof n === "number");

    localStorage.setItem("k", JSON.stringify(["a", "b"]));
    expect(readJSON<number[]>("k", [], isNumberArray)).toEqual([]);

    localStorage.setItem("k", JSON.stringify([1, 2]));
    expect(readJSON<number[]>("k", [], isNumberArray)).toEqual([1, 2]);
  });

  it("returns the fallback for a missing key", () => {
    expect(readJSON("absent", "fallback")).toBe("fallback");
  });

  it("survives a localStorage that throws on read", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(readJSON("k", "fallback")).toBe("fallback");
    expect(readString("k", "fallback")).toBe("fallback");
    spy.mockRestore();
  });
});

describe("writes", () => {
  beforeEach(() => localStorage.clear());

  it("swallows quota errors rather than propagating them", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    expect(() => writeJSON("k", { a: 1 })).not.toThrow();
    expect(() => writeString("k", "v")).not.toThrow();
    spy.mockRestore();
  });

  it("round-trips through readJSON", () => {
    writeJSON("k", { a: 1 });
    expect(readJSON("k", null)).toEqual({ a: 1 });
  });
});

describe("clampNumber", () => {
  it("keeps values inside the range", () => {
    expect(clampNumber(5, 1, 10, 3)).toBe(5);
    expect(clampNumber(0, 1, 10, 3)).toBe(1);
    expect(clampNumber(99, 1, 10, 3)).toBe(10);
  });

  it("falls back for values that are not finite numbers", () => {
    expect(clampNumber("", 1, 120, 25)).toBe(25);
    expect(clampNumber(undefined, 1, 120, 25)).toBe(25);
    expect(clampNumber(null, 1, 120, 25)).toBe(25);
    expect(clampNumber("abc", 1, 120, 25)).toBe(25);
    expect(clampNumber(Number.NaN, 1, 120, 25)).toBe(25);
    expect(clampNumber(Infinity, 1, 120, 25)).toBe(25);
  });

  it("parses numeric strings", () => {
    expect(clampNumber("42", 1, 120, 25)).toBe(42);
  });
});
