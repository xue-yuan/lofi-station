import { createMemo, Show, type Component } from "solid-js";
import { playerState, setVolume, toggleMute, setStation } from "../stores/playerStore";
import { STATIONS } from "../stations";

const VolumeUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
);
const MutedLargeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
);
const VolumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
);
const MutedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
);
const NextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
);
const PrevIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
);

interface ControlPanelProps {
    onToggleAmbient?: () => void;
    isAmbientOpen?: boolean;
    isImmersive?: boolean;
    onToggleImmersive?: () => void;
}

const ControlPanel: Component<ControlPanelProps> = (props) => {
    const currentStationIndex = createMemo(() =>
        STATIONS.findIndex(s => s.id === playerState.currentStationId)
    );

    const currentStation = createMemo(() => STATIONS[currentStationIndex()]);

    const handleNext = () => {
        const nextIndex = (currentStationIndex() + 1) % STATIONS.length;
        setStation(STATIONS[nextIndex].id);
    };

    const handlePrev = () => {
        let prevIndex = currentStationIndex() - 1;
        if (prevIndex < 0) prevIndex = STATIONS.length - 1;
        setStation(STATIONS[prevIndex].id);
    };

    return (
        <div class="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-base-300/90 to-transparent pb-10 pt-20">
            <div class="max-w-4xl mx-auto flex flex-col md:grid md:grid-cols-3 items-center gap-6 p-4 bg-base-100/60 backdrop-blur-md rounded-box border border-base-content/10 shadow-lg relative">
                <div class="flex items-center gap-4 w-full md:justify-self-start overflow-hidden">
                    <div class="avatar flex-shrink-0">
                        <div class="w-12 rounded-xl">
                            <img src={currentStation().thumbnail} alt="Station" />
                        </div>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden relative group">
                        <div class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-base-100/10 to-transparent z-10 pointer-events-none"></div>
                        <div class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-base-100/10 to-transparent z-10 pointer-events-none"></div>
                        <div class="w-full overflow-hidden mask-linear-fade">
                            <div class="flex w-max animate-marquee hover:pause gap-8">
                                <h3 class="font-bold text-sm md:text-md px-2 text-white whitespace-nowrap">
                                    {currentStation().title}
                                </h3>
                                <h3 class="font-bold text-sm md:text-md px-2 text-white whitespace-nowrap" aria-hidden="true">
                                    {currentStation().title}
                                </h3>
                            </div>
                        </div>
                        <p class="text-xs text-base-content/70 px-2 mt-1 truncate">Live Radio</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 md:justify-self-center">
                    <button class="btn btn-circle btn-ghost btn-sm" onClick={handlePrev}>
                        <PrevIcon />
                    </button>
                    <button
                        class="btn btn-circle btn-primary btn-lg shadow-glow"
                        onClick={toggleMute}
                        disabled={playerState.isLoading}
                    >
                        <Show when={!playerState.isLoading} fallback={<span class="loading loading-spinner text-primary-content"></span>}>
                            {playerState.isMuted ? <MutedLargeIcon /> : <VolumeUpIcon />}
                        </Show>
                    </button>
                    <button class="btn btn-circle btn-ghost btn-sm" onClick={handleNext}>
                        <NextIcon />
                    </button>
                </div>
                <div class="flex items-center gap-4 min-w-[150px] md:justify-self-end">
                    <div class="flex items-center gap-1">
                        <button
                            class={`btn btn-circle btn-ghost btn-sm ${props.isImmersive ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                            onClick={() => props.onToggleImmersive?.()}
                            title={props.isImmersive ? "Disable Immersive Mode" : "Enable Immersive Mode"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        </button>
                        <button
                            class={`btn btn-circle btn-ghost btn-sm ${props.isAmbientOpen ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                            onClick={() => props.onToggleAmbient?.()}
                            title="Ambient Mixer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        </button>
                    </div>
                    <div class="h-4 w-[1px] bg-white/10"></div>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-circle btn-ghost btn-xs" onClick={toggleMute}>
                            {playerState.isMuted || playerState.volume === 0 ? <MutedIcon /> : <VolumeIcon />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={playerState.volume}
                            class="range range-xs range-primary w-20"
                            onInput={(e) => setVolume(Number(e.currentTarget.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
