import { createSignal, onCleanup, type Component } from "solid-js";

const DigitalClock: Component = () => {
    const [time, setTime] = createSignal(new Date());

    const timer = setInterval(() => setTime(new Date()), 1000);
    onCleanup(() => clearInterval(timer));

    const format = (num: number) => num.toString().padStart(2, '0');

    const dateString = () => {
        return time().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div class="flex flex-col items-start pointer-events-none select-none">
            <div class="flex items-baseline gap-2">
                <span class="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-lg opacity-90">
                    {format(time().getHours())}:{format(time().getMinutes())}
                </span>
                <span class="text-2xl md:text-3xl font-bold text-white/80 w-10">
                    {format(time().getSeconds())}
                </span>
            </div>

            <div class="text-lg md:text-xl text-white/80 font-bold uppercase tracking-[0.2em] ml-1 mt-[-10px] drop-shadow-md">
                {dateString()}
            </div>
        </div>
    );
};

export default DigitalClock;
