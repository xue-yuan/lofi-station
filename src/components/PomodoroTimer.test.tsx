import { beforeEach, afterEach, describe, expect, it, vi } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import PomodoroTimer from "./PomodoroTimer";

const flushMicrotasks = () => new Promise<void>((resolve) => queueMicrotask(resolve));

const readClock = () => {
  const digits = Array.from(document.querySelectorAll<HTMLElement>(".countdown span[style]")).map(
    (el) => el.style.getPropertyValue("--value").trim(),
  );
  return `${digits[0]}${digits[1]}:${digits[2]}${digits[3]}`;
};

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PomodoroTimer", () => {
  it("renders the first stage of the default timeline", () => {
    render(() => <PomodoroTimer />);
    expect(readClock()).toBe("25:00");
    expect(screen.getByRole("button", { name: "START" })).toBeInTheDocument();
  });

  it("counts down from wall-clock time, not from tick count", async () => {
    render(() => <PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "START" }));
    await flushMicrotasks();

    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(readClock()).toBe("15:00");
  });

  it("restores persisted settings on remount", () => {
    const { unmount } = render(() => <PomodoroTimer />);
    fireEvent.click(screen.getByLabelText("Open timer settings"));

    const durationInput = screen.getAllByLabelText(/duration in minutes/)[0];
    fireEvent.input(durationInput, { target: { value: "40" } });
    unmount();

    render(() => <PomodoroTimer />);
    expect(readClock()).toBe("40:00");
  });

  it("rejects a blank duration instead of collapsing the stage to zero", () => {
    render(() => <PomodoroTimer />);
    fireEvent.click(screen.getByLabelText("Open timer settings"));

    const durationInput = screen.getAllByLabelText(/duration in minutes/)[0];
    fireEvent.input(durationInput, { target: { value: "" } });

    expect(readClock()).toBe("25:00");
  });

  it("clamps an out-of-range duration", () => {
    render(() => <PomodoroTimer />);
    fireEvent.click(screen.getByLabelText("Open timer settings"));

    const durationInput = screen.getAllByLabelText(/duration in minutes/)[0];
    fireEvent.input(durationInput, { target: { value: "9999" } });

    expect(readClock()).toBe("120:00");
  });

  it("starts a new day at zero tomatoes when the stored date is stale", () => {
    localStorage.setItem("daily_pomodoro_stats", JSON.stringify({ date: "2020-01-01", count: 7 }));
    render(() => <PomodoroTimer />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("ignores a corrupted settings blob and falls back to defaults", () => {
    localStorage.setItem("lofi_pomodoro_settings", "{{{not json");
    expect(() => render(() => <PomodoroTimer />)).not.toThrow();
    expect(readClock()).toBe("25:00");
  });
});
