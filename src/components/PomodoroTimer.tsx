import { createSignal, onCleanup, type Component } from "solid-js";

const PomodoroTimer: Component = () => {
    const [durationMinutes, setDurationMinutes] = createSignal(25);
    const [timeLeft, setTimeLeft] = createSignal(25 * 60);
    const [isActive, setIsActive] = createSignal(false);

    let timerInterval: any;

    onCleanup(() => clearInterval(timerInterval));

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }
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

            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

            osc.start();
            osc.stop(ctx.currentTime + 2);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const toggleTimer = async () => {
        if (!isActive()) {
            await requestNotificationPermission();

            if (timeLeft() === 0) {
                setTimeLeft(durationMinutes() * 60);
            }

            setIsActive(true);
            timerInterval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        finishTimer();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setIsActive(false);
            clearInterval(timerInterval);
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        clearInterval(timerInterval);
        setTimeLeft(durationMinutes() * 60);
    };

    const finishTimer = () => {
        setIsActive(false);
        clearInterval(timerInterval);

        playAlarmSound();

        if (Notification.permission === "granted") {
            new Notification("Lofi Station", {
                body: "Time's up! Take a break.",
                icon: "/favicon.ico"
            });
        }
    };

    const handleSliderChange = (val: number) => {
        setDurationMinutes(val);
        if (!isActive()) {
            setTimeLeft(val * 60);
        }
    };

    return (
        <div class="card glass w-64 shadow-xl border border-white/10 flex flex-col">
            <div class="card-body p-4 flex flex-col h-full">
                <h2 class="card-title text-sm text-white/80 uppercase tracking-widest flex justify-between items-center">
                    <span>Pomodoro</span>
                    <div class={`badge ${isActive() ? 'badge-success badge-xs animate-pulse' : 'badge-ghost badge-xs'}`}></div>
                </h2>

                <div class="text-center py-2">
                    <span class="countdown font-mono text-5xl text-white">
                        <span style={{ "--value": Math.floor(Math.floor(timeLeft() / 60) / 10) } as any}></span>
                        <span style={{ "--value": Math.floor(timeLeft() / 60) % 10 } as any}></span>:
                        <span style={{ "--value": Math.floor(timeLeft() % 60 / 10) } as any}></span>
                        <span style={{ "--value": Math.floor(timeLeft() % 10) } as any}></span>
                    </span>
                </div>

                <div class="flex flex-col gap-3">
                    <div class="flex flex-col gap-1">
                        <input
                            type="range"
                            min="1"
                            max="30"
                            step="1"
                            value={durationMinutes()}
                            class="range range-xs range-primary"
                            onInput={(e) => handleSliderChange(Number(e.currentTarget.value))}
                            disabled={isActive()}
                        />
                        <div class="flex justify-between text-xs px-1 text-white/50">
                            <span>5m</span>
                            <span>15m</span>
                            <span>30m</span>
                        </div>
                        <div class="text-center text-xs text-primary font-bold">
                            Target: {durationMinutes()} min
                        </div>
                    </div>

                    <div class="flex gap-2 justify-center">
                        <button
                            class={`btn btn-sm flex-1 ${isActive() ? 'btn-warning' : 'btn-primary'}`}
                            onClick={toggleTimer}
                        >
                            {isActive() ? 'PAUSE' : 'START'}
                        </button>
                        <button
                            class="btn btn-sm btn-ghost"
                            onClick={resetTimer}
                            disabled={isActive() && timeLeft() !== 0}
                        >
                            RESET
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimer;
