import { createSignal, onMount, onCleanup, createEffect, For, type Component } from "solid-js";
import { playerState } from "../stores/playerStore";

interface SoundTrack {
    id: string;
    name: string;
    icon: any;
    url: string;
}

interface AmbientMixerProps {
    isOpen: boolean;
    onClose: () => void;
}

const RainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 13v6m4 0v6m4-6v6" /></svg>;
const FireIcon = () => <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>;
const BirdsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>;
const ThunderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

const SOUNDS: SoundTrack[] = [
    { id: 'rain', name: 'Rain', icon: RainIcon, url: '/sounds/rain.mp3' },
    { id: 'fire', name: 'Campfire', icon: FireIcon, url: '/sounds/campfire.mp3' },
    { id: 'birds', name: 'Birds', icon: BirdsIcon, url: '/sounds/birds.mp3' },
    { id: 'thunder', name: 'Thunder', icon: ThunderIcon, url: '/sounds/thunder.mp3' },
];

const AmbientMixer: Component<AmbientMixerProps> = (props) => {
    const audioRefs: { [key: string]: HTMLAudioElement } = {};
    const [volumes, setVolumes] = createSignal<{ [key: string]: number }>({
        rain: 0,
        fire: 0,
        birds: 0,
        thunder: 0
    });

    onMount(() => {
        SOUNDS.forEach(s => {
            const audio = new Audio(s.url);
            audio.loop = true;
            audio.volume = 0;
            audioRefs[s.id] = audio;
        });
    });

    onCleanup(() => {
        Object.values(audioRefs).forEach(audio => {
            audio.pause();
            audio.src = "";
        });
    });

    const handleVolumeChange = (id: string, vol: number) => {
        setVolumes(prev => ({ ...prev, [id]: vol }));
    };

    createEffect(() => {
        const muted = playerState.isMuted;
        const currentVolumes = volumes();

        Object.keys(audioRefs).forEach(id => {
            const audio = audioRefs[id];
            if (!audio) return;

            const userVolume = currentVolumes[id] || 0;
            // If global mute is on, effective volume is 0. Otherwise, use user set volume.
            const effectiveVolume = muted ? 0 : userVolume;

            audio.volume = effectiveVolume;

            if (effectiveVolume > 0 && audio.paused) {
                audio.play().catch(e => console.error("Audio play failed:", e));
            } else if (effectiveVolume === 0 && !audio.paused) {
                audio.pause();
            }
        });
    });

    return (
        <div
            class={`absolute bottom-full mb-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 origin-bottom ${props.isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
        >
            <div class="w-[300px] h-[400px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div class="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        <h3 class="font-bold text-white tracking-widest uppercase text-xs">Ambient</h3>
                    </div>
                    <button class="btn btn-xs btn-ghost btn-circle text-white/40 hover:text-white" onClick={props.onClose}>✕</button>
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
                    <For each={SOUNDS}>
                        {(sound) => (
                            <div class="flex items-center gap-4">
                                <button
                                    class={`btn btn-circle btn-sm border-none ${volumes()[sound.id] > 0 ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                    onClick={() => handleVolumeChange(sound.id, volumes()[sound.id] > 0 ? 0 : 0.5)}
                                >
                                    <sound.icon />
                                </button>
                                <div class="flex-1 flex flex-col gap-1 min-w-0">
                                    <div class="flex justify-between text-[10px] text-white/50 font-bold uppercase tracking-wider">
                                        <span>{sound.name}</span>
                                        <span>{Math.round(volumes()[sound.id] * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volumes()[sound.id]}
                                        class="range range-xs range-primary"
                                        onInput={(e) => handleVolumeChange(sound.id, Number(e.currentTarget.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
};

export default AmbientMixer;

