import { describe, expect, it } from "vite-plus/test";
import {
  resolveShortcut,
  shouldPreventDefault,
  isTypingTarget,
  type ShortcutAction,
} from "./shortcuts";

const key = (
  over: Partial<{ key: string; code: string; ctrlKey: boolean; metaKey: boolean; altKey: boolean }>,
) => ({
  key: "",
  code: "",
  ...over,
});

const started = { hasStarted: true };

describe("resolveShortcut", () => {
  it("only accepts Space before the welcome screen is dismissed", () => {
    expect(resolveShortcut(key({ code: "Space" }), { hasStarted: false })).toEqual({
      type: "start",
    });
    expect(resolveShortcut(key({ code: "KeyM" }), { hasStarted: false })).toBeNull();
    expect(resolveShortcut(key({ code: "ArrowUp" }), { hasStarted: false })).toBeNull();
  });

  it("maps the playback keys", () => {
    const cases: [string, ShortcutAction][] = [
      ["Space", { type: "toggleMute" }],
      ["ArrowUp", { type: "volumeUp" }],
      ["ArrowDown", { type: "volumeDown" }],
      ["KeyM", { type: "randomStation" }],
      ["KeyN", { type: "randomChannel" }],
      ["KeyF", { type: "toggleImmersive" }],
      ["KeyA", { type: "toggleAmbientOnly" }],
    ];
    for (const [code, expected] of cases) {
      expect(resolveShortcut(key({ code }), started)).toEqual(expected);
    }
  });

  it("maps number keys to zero-based category indexes", () => {
    expect(resolveShortcut(key({ code: "Digit1" }), started)).toEqual({
      type: "playCategory",
      index: 0,
    });
    expect(resolveShortcut(key({ code: "Digit9" }), started)).toEqual({
      type: "playCategory",
      index: 8,
    });
    expect(resolveShortcut(key({ code: "Numpad3" }), started)).toEqual({
      type: "playCategory",
      index: 2,
    });
  });

  it("ignores Digit0, which has no category", () => {
    expect(resolveShortcut(key({ code: "Digit0" }), started)).toBeNull();
  });

  it("opens the shortcut list on ?", () => {
    expect(resolveShortcut(key({ key: "?", code: "Slash" }), started)).toEqual({
      type: "toggleShortcuts",
    });
  });

  it("leaves browser and OS chords alone", () => {
    expect(resolveShortcut(key({ code: "KeyN", ctrlKey: true }), started)).toBeNull();
    expect(resolveShortcut(key({ code: "KeyN", metaKey: true }), started)).toBeNull();
    expect(resolveShortcut(key({ code: "ArrowUp", altKey: true }), started)).toBeNull();
    expect(resolveShortcut(key({ code: "Digit1", metaKey: true }), started)).toBeNull();
  });

  it("returns null for unmapped keys", () => {
    expect(resolveShortcut(key({ code: "KeyZ" }), started)).toBeNull();
  });

  it("does not fire A before the welcome screen is dismissed", () => {
    expect(resolveShortcut(key({ code: "KeyA" }), { hasStarted: false })).toBeNull();
  });

  it("leaves cmd+A (select all) alone", () => {
    expect(resolveShortcut(key({ code: "KeyA", metaKey: true }), started)).toBeNull();
    expect(resolveShortcut(key({ code: "KeyA", ctrlKey: true }), started)).toBeNull();
  });

  it("closes the control-bar popovers on Escape", () => {
    expect(resolveShortcut(key({ key: "Escape", code: "Escape" }), started)).toEqual({
      type: "closePanel",
    });
  });

  it("does not fire Escape before the welcome screen is dismissed", () => {
    expect(
      resolveShortcut(key({ key: "Escape", code: "Escape" }), { hasStarted: false }),
    ).toBeNull();
  });
});

describe("shouldPreventDefault", () => {
  it("suppresses the default only for keys that scroll or activate", () => {
    expect(shouldPreventDefault({ type: "toggleMute" })).toBe(true);
    expect(shouldPreventDefault({ type: "volumeUp" })).toBe(true);
    expect(shouldPreventDefault({ type: "volumeDown" })).toBe(true);
    expect(shouldPreventDefault({ type: "start" })).toBe(true);
    expect(shouldPreventDefault({ type: "randomChannel" })).toBe(false);
    expect(shouldPreventDefault({ type: "playCategory", index: 0 })).toBe(false);
    expect(shouldPreventDefault({ type: "closePanel" })).toBe(false);
    expect(shouldPreventDefault({ type: "toggleAmbientOnly" })).toBe(false);
  });
});

describe("isTypingTarget", () => {
  it("detects form fields and contenteditable regions", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const div = document.createElement("div");
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    Object.defineProperty(editable, "isContentEditable", { value: true });

    expect(isTypingTarget(input)).toBe(true);
    expect(isTypingTarget(textarea)).toBe(true);
    expect(isTypingTarget(select)).toBe(true);
    expect(isTypingTarget(editable)).toBe(true);
    expect(isTypingTarget(div)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
  });
});
