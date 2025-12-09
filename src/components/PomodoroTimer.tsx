import { createSignal, onCleanup, createEffect, on, untrack, type Component, For } from "solid-js";

interface Stage {
    id: string;
    type: 'focus' | 'break' | 'long-break';
    name: string;
}

const PomodoroTimer: Component = () => {
    const [focusTime, setFocusTime] = createSignal(25);
    const [shortBreakTime, setShortBreakTime] = createSignal(5);
    const [longBreakTime, setLongBreakTime] = createSignal(15);
    const [isSettingsOpen, setIsSettingsOpen] = createSignal(false);
    const defaultTimeline: Stage[] = [
        { id: '1', type: 'focus', name: 'Focus' },
        { id: '2', type: 'break', name: 'Short Break' },
        { id: '3', type: 'focus', name: 'Focus' },
        { id: '4', type: 'break', name: 'Short Break' },
        { id: '5', type: 'focus', name: 'Focus' },
        { id: '6', type: 'long-break', name: 'Long Break' },
    ];
    const [timeline, setTimeline] = createSignal<Stage[]>(defaultTimeline);
    const [currentStageIndex, setCurrentStageIndex] = createSignal(0);
    const [timeLeft, setTimeLeft] = createSignal(25 * 60);
    const [isActive, setIsActive] = createSignal(false);
    const [autoStart, setAutoStart] = createSignal(false);

    let timerInterval: any;

    onCleanup(() => clearInterval(timerInterval));

    const getDuration = (type: string) => {
        switch (type) {
            case 'focus': return focusTime();
            case 'break': return shortBreakTime();
            case 'long-break': return longBreakTime();
            default: return 25;
        }
    };

    const currentStage = () => {
        const t = timeline();
        if (t.length === 0) return { name: 'Focus', type: 'focus', duration: focusTime() };
        const stage = t[currentStageIndex() % t.length];
        return { ...stage, duration: getDuration(stage.type) };
    };

    createEffect(on([focusTime, shortBreakTime, longBreakTime, timeline, currentStageIndex], () => {
        if (!untrack(isActive)) {
            setTimeLeft(currentStage().duration * 60);
        }
    }));

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) return;
        if (Notification.permission !== "denied" && Notification.permission !== "granted") {
            await Notification.requestPermission();
        }
    };

    const playAlarmSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const isFocus = currentStage().type === 'focus';
            osc.frequency.setValueAtTime(isFocus ? 880 : 523.25, ctx.currentTime);

            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
            osc.start();
            osc.stop(ctx.currentTime + 1.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const nextStage = () => {
        const t = timeline();
        if (t.length === 0) return 0;
        const nextIndex = (currentStageIndex() + 1) % t.length;
        setCurrentStageIndex(nextIndex);

        const nextStageObj = t[nextIndex];
        const duration = getDuration(nextStageObj.type);
        setTimeLeft(duration * 60);

        return nextIndex;
    };

    const finishTimer = () => {
        clearInterval(timerInterval);
        playAlarmSound();

        if (Notification.permission === "granted") {
            new Notification("Lofi Station", {
                body: `${currentStage().name} finished!`,
                icon: "/favicon.ico"
            });
        }

        nextStage();

        if (autoStart()) {
            setTimeout(() => {
                startRunning();
            }, 1000);
        } else {
            setIsActive(false);
        }
    };

    const startRunning = () => {
        setIsActive(true);
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const current = timeLeft();
            if (current <= 1) {
                finishTimer();
            } else {
                setTimeLeft(current - 1);
            }
        }, 1000);
    };

    const toggleTimer = async () => {
        if (timeline().length === 0) return;

        if (!isActive()) {
            await requestNotificationPermission();
            startRunning();
        } else {
            stopTimer();
        }
    };

    const stopTimer = () => {
        setIsActive(false);
        clearInterval(timerInterval);
    };

    const skipStage = () => {
        setIsActive(false);
        clearInterval(timerInterval);
        nextStage();
    };

    const resetCurrentStage = () => {
        setIsActive(false);
        clearInterval(timerInterval);
        setTimeLeft(currentStage().duration * 60);
    };

    const addStage = (type: 'focus' | 'break' | 'long-break', name: string) => {
        const newStage: Stage = {
            id: Date.now().toString() + Math.random(),
            type,
            name
        };
        setTimeline([...timeline(), newStage]);
    };

    const removeStage = (id: string, index: number) => {
        const newTimeline = timeline().filter(s => s.id !== id);

        if (newTimeline.length === 0) {
            setTimeline([]);
            setIsActive(false);
            clearInterval(timerInterval);
            setTimeLeft(0);
            setCurrentStageIndex(0);
            return;
        }

        setTimeline(newTimeline);

        if (index === currentStageIndex()) {
            if (index >= newTimeline.length) {
                setCurrentStageIndex(0);
            }
            setIsActive(false);
            clearInterval(timerInterval);
            const t = newTimeline;
            const newStage = t[currentStageIndex() % t.length];
            const duration = getDuration(newStage.type);
            setTimeLeft(duration * 60);

        } else if (index < currentStageIndex()) {
            setCurrentStageIndex(currentStageIndex() - 1);
        }
    };

    return (
        <div class="w-full flex flex-col relative overflow-hidden transition-all duration-300 min-h-[280px]">
            <div class={`absolute inset-0 bg-black/90 z-20 transition-transform duration-300 p-4 flex flex-col gap-3 ${isSettingsOpen() ? 'translate-x-0' : 'translate-x-full'}`}>
                <div class="flex justify-between items-center mb-1 border-b border-white/10 pb-2">
                    <span class="text-xs font-bold uppercase tracking-widest text-white">Timer Settings</span>
                    <button class="btn btn-xs btn-ghost btn-circle text-white" onClick={() => setIsSettingsOpen(false)}>✕</button>
                </div>

                <div class="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-4">
                    <div class="space-y-3">
                        <div class="flex flex-col gap-1">
                            <div class="flex justify-between text-[10px] text-white/60"><span>Focus</span><span>{focusTime()}m</span></div>
                            <input type="range" min="1" max="60" value={focusTime()} onInput={(e) => setFocusTime(Number(e.currentTarget.value))} class="range range-xs range-primary" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <div class="flex justify-between text-[10px] text-white/60"><span>Short Break</span><span>{shortBreakTime()}m</span></div>
                            <input type="range" min="1" max="30" value={shortBreakTime()} onInput={(e) => setShortBreakTime(Number(e.currentTarget.value))} class="range range-xs range-secondary" />
                        </div>
                        <div class="flex flex-col gap-1">
                            <div class="flex justify-between text-[10px] text-white/60"><span>Long Break</span><span>{longBreakTime()}m</span></div>
                            <input type="range" min="1" max="60" value={longBreakTime()} onInput={(e) => setLongBreakTime(Number(e.currentTarget.value))} class="range range-xs range-accent" />
                        </div>
                    </div>

                    <div class="divider my-0 opacity-50"></div>

                    <div class="flex flex-col gap-2">
                        <span class="text-[10px] uppercase font-bold text-white/40">Sequence</span>
                        <div class="flex flex-col gap-1 max-h-[120px] overflow-y-auto custom-scrollbar p-1 bg-black/20 rounded-box">
                            <For each={timeline()}>
                                {(stage, i) => (
                                    <div class={`flex justify-between items-center p-1.5 rounded  marker:group ${i() === currentStageIndex() ? 'bg-white/20 border border-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] font-mono opacity-30">{i() + 1}.</span>
                                            <div class={`w-1.5 h-1.5 rounded-full ${stage.type === 'focus' ? 'bg-primary' : stage.type === 'break' ? 'bg-secondary' : 'bg-accent'}`}></div>
                                            <span class={`text-xs ${i() === currentStageIndex() ? 'text-white font-bold' : 'text-white/80'}`}>{stage.name}</span>
                                            {i() === currentStageIndex() && <span class="text-[8px] uppercase bg-white/20 px-1 rounded text-white/60 ml-2">Active</span>}
                                        </div>
                                        <button
                                            class="btn btn-xs btn-ghost btn-square text-error opacity-40 hover:opacity-100"
                                            onClick={() => removeStage(stage.id, i())}
                                        >×</button>
                                    </div>
                                )}
                            </For>
                        </div>
                        <div class="grid grid-cols-3 gap-1 mt-1">
                            <button class="btn btn-xs btn-outline btn-primary text-[9px] px-0" onClick={() => addStage('focus', 'Focus')}>+ Focus</button>
                            <button class="btn btn-xs btn-outline btn-secondary text-[9px] px-0" onClick={() => addStage('break', 'Short')}>+ Short</button>
                            <button class="btn btn-xs btn-outline btn-accent text-[9px] px-0" onClick={() => addStage('long-break', 'Long')}>+ Long</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col h-full gap-4 justify-between p-2">
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <div class={`badge badge-xs transition-all duration-300 ${isActive()
                                ? 'badge-success animate-pulse shadow-[0_0_10px_#22c55e]'
                                : timeLeft() < currentStage().duration * 60
                                    ? 'badge-error shadow-[0_0_10px_#fa0000]'
                                    : 'badge-ghost opacity-50'
                                }`}></div>
                            <span class={`text-xs font-bold uppercase tracking-widest ${currentStage().type === 'focus' ? 'text-primary' : currentStage().type === 'break' ? 'text-secondary' : 'text-accent'}`}>
                                {currentStage().name}
                            </span>
                        </div>

                        <div class="flex items-center gap-1">
                            <span class="text-[10px] text-white/40 uppercase">Auto</span>
                            <input
                                type="checkbox"
                                class="toggle toggle-xs toggle-primary"
                                checked={autoStart()}
                                onChange={(e) => setAutoStart(e.currentTarget.checked)}
                            />
                            <button class="btn btn-xs btn-ghost btn-circle text-white/50 hover:text-white ml-1" onClick={() => setIsSettingsOpen(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </button>
                        </div>
                    </div>
                    <div class="flex justify-between gap-1 overflow-x-auto custom-scrollbar pb-1">
                        <For each={timeline()}>
                            {(s, i) => (
                                <div
                                    class={`h-1 min-w-[8px] flex-1 rounded-full transition-all duration-300 ${i() === currentStageIndex() ? (s.type === 'focus' ? 'bg-primary' : s.type === 'break' ? 'bg-secondary' : 'bg-accent') :
                                        i() < currentStageIndex() ? 'bg-white/20' : 'bg-white/5'
                                        }`}
                                ></div>
                            )}
                        </For>
                    </div>
                </div>

                <div class="text-center py-2 relative group flex-1 flex items-center justify-center">
                    <span class={`countdown font-mono text-6xl text-white`}>
                        <span style={{ "--value": Math.floor(Math.floor(timeLeft() / 60) / 10) } as any}></span>
                        <span style={{ "--value": Math.floor(timeLeft() / 60) % 10 } as any}></span>:
                        <span style={{ "--value": Math.floor(timeLeft() % 60 / 10) } as any}></span>
                        <span style={{ "--value": Math.floor(timeLeft() % 10) } as any}></span>
                    </span>
                </div>

                <div class="flex gap-2 justify-center">
                    <button
                        class={`btn btn-sm flex-1 ${isActive()
                            ? 'btn-warning text-black hover:bg-yellow-500 border-yellow-500'
                            : timeLeft() < currentStage().duration * 60
                                ? 'btn-success text-white'
                                : (currentStage().type === 'focus' ? 'btn-primary' : currentStage().type === 'break' ? 'btn-secondary' : 'btn-accent')
                            }`}
                        onClick={toggleTimer}
                        disabled={timeline().length === 0}
                    >
                        {isActive() ? 'STOP' : timeLeft() < currentStage().duration * 60 ? 'RESUME' : 'START'}
                    </button>
                    <button
                        class="btn btn-sm btn-ghost btn-square text-white/40 hover:text-white"
                        onClick={skipStage}
                        title="Skip Stage"
                        disabled={timeline().length === 0}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                    <button
                        class="btn btn-sm btn-ghost btn-square text-white/40 hover:text-white"
                        onClick={resetCurrentStage}
                        title="Reset"
                        disabled={timeline().length === 0}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimer;
