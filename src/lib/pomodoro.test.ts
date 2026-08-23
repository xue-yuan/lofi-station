import { describe, expect, it } from "vite-plus/test";
import {
  createDefaultTimeline,
  remainingSeconds,
  sanitiseStage,
  sanitiseTimeline,
  todayKey,
  MAX_STAGE_MINUTES,
} from "./pomodoro";

describe("remainingSeconds", () => {
  it("derives the countdown from a wall-clock deadline", () => {
    const now = 1_000_000;
    expect(remainingSeconds(now + 25 * 60 * 1000, now)).toBe(1500);
    expect(remainingSeconds(now + 1500, now)).toBe(2);
  });

  it("never goes negative when the tab was throttled past the deadline", () => {
    const now = 1_000_000;
    expect(remainingSeconds(now - 60_000, now)).toBe(0);
  });
});

describe("sanitiseStage", () => {
  it("clamps a zero or blank duration to the minimum", () => {
    expect(sanitiseStage({ id: "a", type: "focus", name: "Focus", duration: 0 }, 0)?.duration).toBe(
      1,
    );
    expect(
      sanitiseStage({ id: "a", type: "focus", name: "Focus", duration: -5 }, 0)?.duration,
    ).toBe(1);
  });

  it("caps an absurd duration", () => {
    expect(
      sanitiseStage({ id: "a", type: "focus", name: "Focus", duration: 99999 }, 0)?.duration,
    ).toBe(MAX_STAGE_MINUTES);
  });

  it("falls back to the type default when the duration is unusable", () => {
    expect(sanitiseStage({ id: "a", type: "break", name: "Break" }, 0)?.duration).toBe(5);
    expect(sanitiseStage({ id: "a", type: "long-break", name: "Long" }, 0)?.duration).toBe(15);
  });

  it("rejects entries without a valid stage type", () => {
    expect(sanitiseStage({ id: "a", type: "nap", duration: 5 }, 0)).toBeNull();
    expect(sanitiseStage(null, 0)).toBeNull();
    expect(sanitiseStage("focus", 0)).toBeNull();
  });
});

describe("sanitiseTimeline", () => {
  it("drops invalid stages and keeps the rest", () => {
    const result = sanitiseTimeline([
      { id: "a", type: "focus", name: "Focus", duration: 25 },
      { id: "b", type: "bogus", name: "Nope", duration: 5 },
    ]);
    expect(result).toHaveLength(1);
    expect(result?.[0].id).toBe("a");
  });

  it("returns null when nothing usable survives, so callers can use defaults", () => {
    expect(sanitiseTimeline([])).toBeNull();
    expect(sanitiseTimeline([{ type: "bogus" }])).toBeNull();
    expect(sanitiseTimeline("not an array")).toBeNull();
    expect(sanitiseTimeline(null)).toBeNull();
  });

  it("accepts the shipped default timeline unchanged", () => {
    const defaults = createDefaultTimeline();
    expect(sanitiseTimeline(defaults)).toEqual(defaults);
  });
});

describe("todayKey", () => {
  it("uses the local calendar day, not UTC", () => {
    const localLateEvening = new Date(2026, 2, 5, 23, 30, 0);
    expect(todayKey(localLateEvening)).toBe("2026-03-05");
  });

  it("zero-pads month and day", () => {
    expect(todayKey(new Date(2026, 0, 9, 12, 0, 0))).toBe("2026-01-09");
  });
});
