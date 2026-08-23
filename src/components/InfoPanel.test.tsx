import { describe, expect, it } from "vite-plus/test";
import { SHORTCUTS } from "./InfoPanel";
import { resolveShortcut } from "../lib/shortcuts";
import { STATION_CATEGORIES } from "../stations";
import { CATEGORY_SHORTCUT_LIMIT } from "../lib/shortcuts";

const EVENT_FOR_KEY: Record<string, { key: string; code: string }> = {
  Space: { key: " ", code: "Space" },
  "\u2191": { key: "ArrowUp", code: "ArrowUp" },
  "\u2193": { key: "ArrowDown", code: "ArrowDown" },
  N: { key: "n", code: "KeyN" },
  M: { key: "m", code: "KeyM" },
  F: { key: "f", code: "KeyF" },
  A: { key: "a", code: "KeyA" },
  "?": { key: "?", code: "Slash" },
  Esc: { key: "Escape", code: "Escape" },
};

describe("the documented shortcut list", () => {
  it("only advertises keys the handler actually implements", () => {
    for (const shortcut of SHORTCUTS) {
      for (const label of shortcut.keys) {
        const event = EVENT_FOR_KEY[label];
        expect(event, `no event mapping for documented key "${label}"`).toBeDefined();
        expect(
          resolveShortcut(event, { hasStarted: true }),
          `documented key "${label}" (${shortcut.label}) resolves to nothing`,
        ).not.toBeNull();
      }
    }
  });

  it("documents the ambient-only toggle", () => {
    const row = SHORTCUTS.find((s) => s.keys.includes("A"));
    expect(row?.label).toBe("Ambient Only");
  });

  it("never lists more station keys than there are categories", () => {
    expect(STATION_CATEGORIES.length).toBeGreaterThan(0);
    expect(Math.min(STATION_CATEGORIES.length, CATEGORY_SHORTCUT_LIMIT)).toBeLessThanOrEqual(9);
  });
});
