import {
  createSignal,
  onCleanup,
  onMount,
  createEffect,
  on,
  untrack,
  For,
  type Component,
} from "solid-js";
import {
  createDefaultTimeline,
  DEFAULT_DURATIONS,
  MAX_STAGE_MINUTES,
  MIN_STAGE_MINUTES,
  remainingSeconds,
  sanitiseTimeline,
  todayKey,
  type Stage,
  type StageType,
} from "../lib/pomodoro";
import { clampNumber, readJSON, writeJSON } from "../lib/storage";

const SETTINGS_KEY = "lofi_pomodoro_settings";
const STATS_KEY = "daily_pomodoro_stats";
const TICK_MS = 250;

interface StoredSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  autoStart: boolean;
  timeline: Stage[];
  currentStageIndex: number;
}

interface StoredStats {
  date: string;
  count: number;
}

const PomodoroTimer: Component = () => {
  const stored = readJSON<Partial<StoredSettings>>(SETTINGS_KEY, {});
  const storedTimeline = sanitiseTimeline(stored.timeline) ?? createDefaultTimeline();

  const [focusTime, setFocusTime] = createSignal(
    clampNumber(stored.focusTime, 1, 60, DEFAULT_DURATIONS.focus),
  );
  const [shortBreakTime, setShortBreakTime] = createSignal(
    clampNumber(stored.shortBreakTime, 1, 30, DEFAULT_DURATIONS.break),
  );
  const [longBreakTime, setLongBreakTime] = createSignal(
    clampNumber(stored.longBreakTime, 1, 60, DEFAULT_DURATIONS["long-break"]),
  );
  const [autoStart, setAutoStart] = createSignal(stored.autoStart === true);
  const [timeline, setTimeline] = createSignal<Stage[]>(storedTimeline);
  const [currentStageIndex, setCurrentStageIndex] = createSignal(
    clampNumber(stored.currentStageIndex, 0, storedTimeline.length - 1, 0),
  );

  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
  const [timeLeft, setTimeLeft] = createSignal(storedTimeline[0].duration * 60);
  const [isActive, setIsActive] = createSignal(false);
  const [dailyTomatoes, setDailyTomatoes] = createSignal(0);

  let timerInterval: ReturnType<typeof setInterval> | undefined;
  let autoStartTimer: ReturnType<typeof setTimeout> | undefined;
  let endsAt = 0;

  const currentStage = (): Stage => {
    const t = timeline();
    if (t.length === 0) {
      return { id: "empty", type: "focus", name: "Focus", duration: focusTime() };
    }
    return t[currentStageIndex() % t.length];
  };

  const syncDailyTomatoes = (): StoredStats => {
    const today = todayKey();
    const data = readJSON<StoredStats>(STATS_KEY, { date: today, count: 0 });
    const valid =
      typeof data?.date === "string" && typeof data?.count === "number" && data.date === today;

    const reconciled: StoredStats = valid
      ? { date: today, count: Math.max(0, Math.floor(data.count)) }
      : { date: today, count: 0 };

    if (!valid) writeJSON(STATS_KEY, reconciled);
    setDailyTomatoes(reconciled.count);
    return reconciled;
  };

  createEffect(() => {
    const snapshot: StoredSettings = {
      focusTime: focusTime(),
      shortBreakTime: shortBreakTime(),
      longBreakTime: longBreakTime(),
      autoStart: autoStart(),
      timeline: timeline(),
      currentStageIndex: currentStageIndex(),
    };
    writeJSON(SETTINGS_KEY, snapshot);
  });

  createEffect(
    on([timeline, currentStageIndex], () => {
      if (!untrack(isActive)) setTimeLeft(currentStage().duration * 60);
    }),
  );

  const stopInterval = () => {
    clearInterval(timerInterval);
    timerInterval = undefined;
  };

  const tick = () => {
    const left = remainingSeconds(endsAt);
    setTimeLeft(left);
    if (left <= 0) finishTimer();
  };

  const startRunning = () => {
    const seconds = timeLeft() > 0 ? timeLeft() : currentStage().duration * 60;
    if (seconds <= 0) return;

    endsAt = Date.now() + seconds * 1000;
    setTimeLeft(seconds);
    setIsActive(true);
    stopInterval();
    timerInterval = setInterval(tick, TICK_MS);
  };

  const stopTimer = () => {
    setIsActive(false);
    stopInterval();
  };

  onMount(() => {
    syncDailyTomatoes();

    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      syncDailyTomatoes();
      if (isActive()) tick();
    };
    document.addEventListener("visibilitychange", onVisibility);
    onCleanup(() => document.removeEventListener("visibilitychange", onVisibility));
  });

  onCleanup(() => {
    stopInterval();
    clearTimeout(autoStartTimer);
  });

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
  };

  const notifyStageFinished = (stageName: string) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
      new Notification("Lofi Radio", {
        body: `${stageName} finished!`,
        icon: "/favicon.ico",
      });
    } catch {}
  };

  const playAlarmSound = (isFocus: boolean) => {
    try {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(isFocus ? 880 : 523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
      osc.onended = () => void ctx.close().catch(() => {});
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const advanceStage = () => {
    const t = timeline();
    if (t.length === 0) return;
    const nextIndex = (currentStageIndex() + 1) % t.length;
    setCurrentStageIndex(nextIndex);
    setTimeLeft(t[nextIndex].duration * 60);
  };

  function finishTimer() {
    stopInterval();
    const finished = currentStage();
    playAlarmSound(finished.type === "focus");

    if (finished.type === "focus") {
      const current = syncDailyTomatoes();
      const next = { date: current.date, count: current.count + 1 };
      setDailyTomatoes(next.count);
      writeJSON(STATS_KEY, next);
    }

    notifyStageFinished(finished.name);
    advanceStage();

    if (autoStart()) {
      clearTimeout(autoStartTimer);
      autoStartTimer = setTimeout(() => startRunning(), 1000);
    } else {
      setIsActive(false);
    }
  }

  const toggleTimer = async () => {
    if (timeline().length === 0) return;
    if (isActive()) {
      stopTimer();
      return;
    }
    await requestNotificationPermission();
    startRunning();
  };

  const skipStage = () => {
    stopTimer();
    advanceStage();
  };

  const resetCurrentStage = () => {
    stopTimer();
    setTimeLeft(currentStage().duration * 60);
  };

  const defaultDurationFor = (type: StageType) => {
    switch (type) {
      case "focus":
        return focusTime();
      case "break":
        return shortBreakTime();
      case "long-break":
        return longBreakTime();
    }
  };

  const addStage = (type: StageType, name: string) => {
    setTimeline([
      ...timeline(),
      {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        name,
        duration: defaultDurationFor(type),
      },
    ]);
  };

  const removeStage = (id: string, index: number) => {
    const next = timeline().filter((s) => s.id !== id);

    if (next.length === 0) {
      stopTimer();
      setTimeline([]);
      setTimeLeft(0);
      setCurrentStageIndex(0);
      return;
    }

    setTimeline(next);

    if (index === currentStageIndex()) {
      stopTimer();
      const safeIndex = Math.min(currentStageIndex(), next.length - 1);
      setCurrentStageIndex(safeIndex);
      setTimeLeft(next[safeIndex].duration * 60);
    } else if (index < currentStageIndex()) {
      setCurrentStageIndex(currentStageIndex() - 1);
    }
  };

  const updateStageDuration = (index: number, rawValue: string) => {
    const stages = timeline();
    const stage = stages[index];
    if (!stage) return;

    const duration = clampNumber(rawValue, MIN_STAGE_MINUTES, MAX_STAGE_MINUTES, stage.duration);
    setTimeline(stages.map((s, i) => (i === index ? { ...s, duration } : s)));

    if (index === currentStageIndex() && !isActive()) setTimeLeft(duration * 60);
  };

  const isPartiallyElapsed = () => timeLeft() < currentStage().duration * 60;

  const dotClass = (type: StageType) =>
    type === "focus" ? "bg-primary" : type === "break" ? "bg-secondary" : "bg-accent";
  const textClass = (type: StageType) =>
    type === "focus" ? "text-primary" : type === "break" ? "text-secondary" : "text-accent";
  const buttonClass = (type: StageType) =>
    type === "focus" ? "btn-primary" : type === "break" ? "btn-secondary" : "btn-accent";

  return (
    <div class="w-full h-full flex flex-col relative overflow-hidden transition-all duration-300">
      <div
        class={`absolute inset-0 bg-black/90 z-20 transition-transform duration-300 p-4 flex flex-col gap-3 ${isSettingsOpen() ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!isSettingsOpen()}
      >
        <div class="flex justify-between items-center mb-1 border-b border-white/10 pb-2">
          <span class="text-xs font-bold uppercase tracking-widest text-white">Timer Settings</span>
          <button
            class="btn btn-xs btn-ghost btn-circle text-white"
            onClick={() => setIsSettingsOpen(false)}
            aria-label="Close timer settings"
          >
            ✕
          </button>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-4">
          <div class="space-y-3">
            <div class="text-[10px] text-white/40 uppercase font-bold">Default Durations</div>
            <div class="flex flex-col gap-1">
              <label class="flex justify-between text-[10px] text-white/60" for="pomodoro-focus">
                <span>Focus</span>
                <span>{focusTime()}m</span>
              </label>
              <input
                id="pomodoro-focus"
                type="range"
                min="1"
                max="60"
                value={focusTime()}
                onInput={(e) =>
                  setFocusTime(clampNumber(e.currentTarget.value, 1, 60, focusTime()))
                }
                class="range range-xs range-primary"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="flex justify-between text-[10px] text-white/60" for="pomodoro-short">
                <span>Short Break</span>
                <span>{shortBreakTime()}m</span>
              </label>
              <input
                id="pomodoro-short"
                type="range"
                min="1"
                max="30"
                value={shortBreakTime()}
                onInput={(e) =>
                  setShortBreakTime(clampNumber(e.currentTarget.value, 1, 30, shortBreakTime()))
                }
                class="range range-xs range-secondary"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="flex justify-between text-[10px] text-white/60" for="pomodoro-long">
                <span>Long Break</span>
                <span>{longBreakTime()}m</span>
              </label>
              <input
                id="pomodoro-long"
                type="range"
                min="1"
                max="60"
                value={longBreakTime()}
                onInput={(e) =>
                  setLongBreakTime(clampNumber(e.currentTarget.value, 1, 60, longBreakTime()))
                }
                class="range range-xs range-accent"
              />
            </div>
          </div>
          <div class="divider my-0 opacity-50" />
          <div class="flex flex-col gap-2">
            <span class="text-[10px] uppercase font-bold text-white/40">Sequence</span>
            <div class="flex flex-col gap-1 max-h-[160px] overflow-y-auto custom-scrollbar p-1 bg-black/20 rounded-box">
              <For each={timeline()}>
                {(stage, i) => (
                  <div
                    class={`flex justify-between items-center p-1.5 rounded ${i() === currentStageIndex() ? "bg-white/20 border border-white/20" : "bg-white/5 hover:bg-white/10"}`}
                  >
                    <div class="flex items-center gap-2 flex-1">
                      <span class="text-[10px] font-mono opacity-30 w-3">{i() + 1}.</span>
                      <div class={`w-1.5 h-1.5 rounded-full ${dotClass(stage.type)}`} />
                      <span
                        class={`text-xs truncate ${i() === currentStageIndex() ? "text-white font-bold" : "text-white/80"}`}
                      >
                        {stage.name}
                      </span>
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                        type="number"
                        min={MIN_STAGE_MINUTES}
                        max={MAX_STAGE_MINUTES}
                        class="input input-xs input-ghost w-12 text-right p-0 pr-1 text-[10px] h-5"
                        value={stage.duration}
                        aria-label={`${stage.name} duration in minutes`}
                        onInput={(e) => updateStageDuration(i(), e.currentTarget.value)}
                        onBlur={(e) => {
                          e.currentTarget.value = String(timeline()[i()]?.duration ?? "");
                        }}
                      />
                      <span class="text-[9px] opacity-50 -ml-1">m</span>
                      <button
                        class="btn btn-xs btn-ghost btn-square text-error opacity-40 hover:opacity-100 h-5 w-5 min-h-0"
                        onClick={() => removeStage(stage.id, i())}
                        aria-label={`Remove ${stage.name} stage`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
            <div class="grid grid-cols-3 gap-1 mt-1">
              <button
                class="btn btn-xs btn-outline btn-primary text-[9px] px-0"
                onClick={() => addStage("focus", "Focus")}
              >
                + Focus
              </button>
              <button
                class="btn btn-xs btn-outline btn-secondary text-[9px] px-0"
                onClick={() => addStage("break", "Short")}
              >
                + Short
              </button>
              <button
                class="btn btn-xs btn-outline btn-accent text-[9px] px-0"
                onClick={() => addStage("long-break", "Long")}
              >
                + Long
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col h-full gap-4 justify-between p-2">
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <div
                class={`badge badge-xs transition-all duration-300 ${
                  isActive()
                    ? "badge-success animate-pulse shadow-[0_0_10px_#22c55e]"
                    : isPartiallyElapsed()
                      ? "badge-error shadow-[0_0_10px_#fa0000]"
                      : "badge-ghost opacity-50"
                }`}
              />
              <span
                class={`text-xs font-bold uppercase tracking-widest ${textClass(currentStage().type)}`}
              >
                {currentStage().name}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <div class="tooltip tooltip-bottom" data-tip="Daily Tomatoes">
                <div class="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 mr-1">
                  <span class="text-sm" aria-hidden="true">
                    🍅
                  </span>
                  <span class="text-xs font-mono font-bold text-white/80">
                    <span class="sr-only">Completed today: </span>
                    {dailyTomatoes()}
                  </span>
                </div>
              </div>
              <label class="text-[10px] text-white/40 uppercase" for="pomodoro-autostart">
                Auto
              </label>
              <input
                id="pomodoro-autostart"
                type="checkbox"
                class="toggle toggle-xs toggle-primary"
                checked={autoStart()}
                onChange={(e) => setAutoStart(e.currentTarget.checked)}
              />
              <button
                class="btn btn-xs btn-ghost btn-circle text-white/50 hover:text-white ml-1"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open timer settings"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex justify-between gap-1 overflow-x-auto custom-scrollbar pb-1">
            <For each={timeline()}>
              {(s, i) => (
                <div
                  class={`h-1 min-w-[8px] flex-1 rounded-full transition-all duration-300 ${
                    i() === currentStageIndex()
                      ? dotClass(s.type)
                      : i() < currentStageIndex()
                        ? "bg-white/20"
                        : "bg-white/5"
                  }`}
                  title={`${s.name}: ${s.duration}m`}
                />
              )}
            </For>
          </div>
        </div>

        <div class="text-center py-5 relative flex-1 flex items-center justify-center">
          <span
            class="countdown font-mono text-6xl text-white"
            role="timer"
            aria-live="off"
            aria-label={`${Math.floor(timeLeft() / 60)} minutes ${timeLeft() % 60} seconds remaining`}
          >
            <span style={{ "--value": Math.floor(timeLeft() / 60 / 10) }} />
            <span style={{ "--value": Math.floor(timeLeft() / 60) % 10 }} />:
            <span style={{ "--value": Math.floor((timeLeft() % 60) / 10) }} />
            <span style={{ "--value": timeLeft() % 10 }} />
          </span>
        </div>

        <div class="flex gap-2 justify-center">
          <button
            class={`btn btn-sm flex-1 ${
              isActive()
                ? "btn-warning text-black hover:bg-yellow-500 border-yellow-500"
                : isPartiallyElapsed()
                  ? "btn-success text-white"
                  : buttonClass(currentStage().type)
            }`}
            onClick={toggleTimer}
            disabled={timeline().length === 0}
          >
            {isActive() ? "STOP" : isPartiallyElapsed() ? "RESUME" : "START"}
          </button>
          <button
            class="btn btn-sm btn-ghost btn-square text-white/40 hover:text-white"
            onClick={skipStage}
            title="Skip Stage"
            aria-label="Skip to next stage"
            disabled={timeline().length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
          <button
            class="btn btn-sm btn-ghost btn-square text-white/40 hover:text-white"
            onClick={resetCurrentStage}
            title="Reset"
            aria-label="Reset current stage"
            disabled={timeline().length === 0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
