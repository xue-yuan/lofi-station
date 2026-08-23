import { For, type Component } from "solid-js";

export interface SoundTrack {
  id: string;
  name: string;
  icon: Component;
  url: string;
}

export interface AmbientPreset {
  id: string;
  name: string;
  mix: Record<string, number>;
}

export type VolumeMap = Record<string, number>;

const svg = (...paths: string[]) => {
  const Icon: Component = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <For each={paths}>{(d) => <path d={d} />}</For>
    </svg>
  );
  return Icon;
};

export const AMBIENT_ICONS = {
  rain: svg(
    "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
    "M8 19v2m4-2v2m4-2v2",
  ),
  fire: svg(
    "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
    "M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z",
  ),
  birds: svg(
    "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
  ),
  thunder: svg("M13 10V3L4 14h7v7l9-11h-7z"),
  wind: svg("M3 8h11a3 3 0 10-3-3", "M3 12h15a3 3 0 11-3 3", "M3 16h8"),
  waves: svg(
    "M2 8c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2",
    "M2 14c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2",
    "M2 20c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2",
  ),
  cafe: svg("M4 8h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5V8z", "M17 9h2a2 2 0 110 4h-2", "M7 2v3m4-3v3"),
  keyboard: svg("M3 6h18v12H3z", "M7 10h.01M11 10h.01M15 10h.01M7 14h10"),
  night: svg("M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z", "M18 4v2m1-1h-2"),
  city: svg("M3 21V9l6-4v16", "M9 21V11l6-3v13", "M15 21V10l6 3v8", "M2 21h20"),
  train: svg("M6 3h12v11H6z", "M6 14l-3 6m18-6l-3 6", "M9 8h6", "M8 18h8"),
  stream: svg("M4 6c3 0 3 3 6 3s3-3 6-3 3 3 4 3", "M4 13c3 0 3 3 6 3s3-3 6-3 3 3 4 3", "M8 20h8"),
  snow: svg("M12 2v20M4 6l16 12M20 6L4 18", "M12 6l-2-2m2 2l2-2m-2 14l-2 2m2-2l2 2"),
  whiteNoise: svg("M3 12h2l3-7v14l3-7h2", "M15 9a4 4 0 010 6", "M18 6a8 8 0 010 12"),
  clock: svg("M12 21a9 9 0 100-18 9 9 0 000 18z", "M12 7v5l3 2"),
  library: svg("M4 4h6a2 2 0 012 2v14a2 2 0 00-2-2H4z", "M20 4h-6a2 2 0 00-2 2v14a2 2 0 012-2h6z"),
} satisfies Record<string, Component>;

export const SOUNDS: SoundTrack[] = [
  { id: "rain", name: "Rain", icon: AMBIENT_ICONS.rain, url: "/sounds/rain.mp3" },
  { id: "fire", name: "Campfire", icon: AMBIENT_ICONS.fire, url: "/sounds/campfire.mp3" },
  { id: "birds", name: "Birds", icon: AMBIENT_ICONS.birds, url: "/sounds/birds.mp3" },
  { id: "thunder", name: "Thunder", icon: AMBIENT_ICONS.thunder, url: "/sounds/thunder.mp3" },
];

export const SOUND_IDS = SOUNDS.map((s) => s.id);

export const PRESETS: AmbientPreset[] = [
  { id: "rainy-night", name: "Rainy Night", mix: { rain: 0.6, thunder: 0.35 } },
  { id: "forest-morning", name: "Forest Morning", mix: { birds: 0.5, rain: 0.12 } },
  { id: "campfire", name: "Campfire", mix: { fire: 0.6, birds: 0.15 } },
  { id: "storm", name: "Storm", mix: { rain: 0.75, thunder: 0.6 } },
];

export const silentMix = (): VolumeMap => Object.fromEntries(SOUNDS.map((s) => [s.id, 0]));

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const presetMix = (preset: AmbientPreset): VolumeMap => {
  const mix = silentMix();
  for (const [id, level] of Object.entries(preset.mix)) {
    if (id in mix && Number.isFinite(level)) mix[id] = clamp01(level);
  }
  return mix;
};

export const isPresetActive = (preset: AmbientPreset, current: VolumeMap): boolean => {
  const target = presetMix(preset);
  return SOUND_IDS.every((id) => Math.abs((current[id] ?? 0) - target[id]) < 0.02);
};

export const isSilent = (mix: VolumeMap): boolean => SOUND_IDS.every((id) => (mix[id] ?? 0) === 0);
