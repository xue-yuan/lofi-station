import { createSignal, onMount, onCleanup, For, type Component } from "solid-js";

interface SoundTrack {
    id: string;
    name: string;
    icon: any;
    url: string;
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

const AmbientMixer: Component = () => {
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

        const audio = audioRefs[id];
        if (audio) {
            if (vol > 0 && audio.paused) {
                audio.play().catch(e => console.error("Audio play failed:", e));
            } else if (vol === 0 && !audio.paused) {
                audio.pause();
            }
            audio.volume = vol;
        }
    };

    return (
        <div class="p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 w-64">
            <h2 class="text-xs text-white/60 uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
                <span>Ambient Mixer</span>
            </h2>
            <div class="flex flex-col gap-4">
                <For each={SOUNDS}>
                    {(sound) => (
                        <div class="flex items-center gap-3">
                            <div class={`text-white transition-opacity ${volumes()[sound.id] > 0 ? 'opacity-100 text-primary' : 'opacity-40'}`}>
                                <sound.icon />
                            </div>
                            <div class="flex-1 flex flex-col gap-1 min-w-0">
                                <div class="flex justify-between text-[10px] text-white/50">
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
    );
};

export default AmbientMixer;
