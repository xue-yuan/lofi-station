import { onMount, onCleanup, createEffect, For, Show, type Component } from "solid-js";
import { playerState, setMusicMuted } from "../stores/playerStore";
import {
  ambientMix,
  activePresetId,
  applyPreset,
  clearMix,
  setSoundLevel,
  toggleSound,
} from "../stores/ambientStore";
import { PRESETS, SOUNDS, isSilent } from "../ambient";

interface AmbientMixerProps {
  isOpen: boolean;
  onClose: () => void;
}

const AmbientMixer: Component<AmbientMixerProps> = (props) => {
  const audioRefs: Record<string, HTMLAudioElement> = {};

  onMount(() => {
    SOUNDS.forEach((sound) => {
      const audio = new Audio(sound.url);
      audio.loop = true;
      audio.volume = 0;
      audioRefs[sound.id] = audio;
    });
  });

  onCleanup(() => {
    Object.values(audioRefs).forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
  });

  createEffect(() => {
    const muted = playerState.isMuted;

    SOUNDS.forEach((sound) => {
      const audio = audioRefs[sound.id];
      if (!audio) return;

      const effectiveVolume = muted ? 0 : (ambientMix[sound.id] ?? 0);
      audio.volume = effectiveVolume;

      if (effectiveVolume > 0 && audio.paused) {
        audio.play().catch(() => {});
      } else if (effectiveVolume === 0 && !audio.paused) {
        audio.pause();
      }
    });
  });

  const mixIsSilent = () => isSilent({ ...ambientMix });

  return (
    <div
      class={`fixed bottom-56 left-1/2 -translate-x-1/2 md:absolute md:bottom-full md:mb-8 z-40 transition-all duration-300 origin-bottom ${props.isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"}`}
    >
      <div class="w-[min(300px,calc(100vw-2rem))] h-[min(400px,60vh)] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div class="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <h3 class="font-bold text-white tracking-widest uppercase text-xs">Ambient</h3>
          </div>
          <button
            class="btn btn-xs btn-ghost btn-circle text-white/40 hover:text-white"
            onClick={() => props.onClose()}
            aria-label="Close ambient mixer"
          >
            ✕
          </button>
        </div>

        <div class="px-4 pt-3 pb-2 border-b border-white/5 shrink-0">
          <label class="flex items-center justify-between gap-2 cursor-pointer" for="ambient-only">
            <span class="flex flex-col">
              <span class="text-[10px] uppercase font-bold tracking-widest text-white/60">
                Ambient Only
              </span>
              <span class="text-[9px] text-white/30 leading-tight">
                Mute the music, keep these sounds
              </span>
            </span>
            <input
              id="ambient-only"
              type="checkbox"
              class="toggle toggle-xs toggle-primary"
              checked={playerState.isMusicMuted}
              onChange={(e) => setMusicMuted(e.currentTarget.checked)}
            />
          </label>
          <Show when={playerState.isMusicMuted && mixIsSilent()}>
            <p class="mt-2 text-[9px] leading-snug text-warning/80">
              Nothing is playing — raise a slider below, or switch this off.
            </p>
          </Show>
        </div>

        <div class="px-4 pt-3 pb-2 border-b border-white/5 shrink-0">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase font-bold tracking-widest text-white/40">
              Presets
            </span>
            <Show when={!mixIsSilent()}>
              <button
                class="btn btn-ghost btn-xs h-5 min-h-0 px-1.5 text-[10px] text-white/40 hover:text-white"
                onClick={clearMix}
              >
                Clear
              </button>
            </Show>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <For each={PRESETS}>
              {(preset) => (
                <button
                  class={`btn btn-xs h-6 min-h-0 rounded-full border-0 px-2.5 text-[10px] font-medium normal-case ${
                    activePresetId() === preset.id
                      ? "bg-primary text-primary-content"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                  onClick={() => applyPreset(preset)}
                  aria-pressed={activePresetId() === preset.id}
                >
                  {preset.name}
                </button>
              )}
            </For>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
          <For each={SOUNDS}>
            {(sound) => (
              <div class="flex items-center gap-4">
                <button
                  class={`btn btn-circle btn-sm border-none ${(ambientMix[sound.id] ?? 0) > 0 ? "bg-primary/20 text-primary" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"}`}
                  onClick={() => toggleSound(sound.id)}
                  aria-label={`${(ambientMix[sound.id] ?? 0) > 0 ? "Mute" : "Play"} ${sound.name}`}
                >
                  <sound.icon />
                </button>
                <div class="flex-1 flex flex-col gap-1 min-w-0">
                  <div class="flex justify-between text-[10px] text-white/50 font-bold uppercase tracking-wider">
                    <span>{sound.name}</span>
                    <span>{Math.round((ambientMix[sound.id] ?? 0) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={ambientMix[sound.id] ?? 0}
                    class="range range-xs range-primary"
                    aria-label={`${sound.name} volume`}
                    onInput={(e) => setSoundLevel(sound.id, Number(e.currentTarget.value))}
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
