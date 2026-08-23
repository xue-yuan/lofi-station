import { createStore } from "solid-js/store";
import {
  PRESETS,
  SOUNDS,
  isPresetActive,
  presetMix,
  silentMix,
  type AmbientPreset,
  type VolumeMap,
} from "../ambient";
import { clampNumber, readJSON, writeJSON } from "../lib/storage";
import { initialShareState } from "../lib/initialShareState";

const VOLUMES_KEY = "lofi_ambient_volumes";

const sanitiseMix = (raw: unknown): VolumeMap => {
  const mix = silentMix();
  if (typeof raw !== "object" || raw === null) return mix;
  const source = raw as Record<string, unknown>;
  for (const sound of SOUNDS) {
    mix[sound.id] = clampNumber(source[sound.id], 0, 1, 0);
  }
  return mix;
};

const initialMix = initialShareState.ambient
  ? sanitiseMix(initialShareState.ambient)
  : sanitiseMix(readJSON<Record<string, unknown>>(VOLUMES_KEY, {}));

export const [ambientMix, setAmbientMix] = createStore<VolumeMap>(initialMix);

const persist = () => writeJSON(VOLUMES_KEY, { ...ambientMix });

export const setSoundLevel = (id: string, level: number) => {
  if (!(id in ambientMix)) return;
  setAmbientMix(id, clampNumber(level, 0, 1, 0));
  persist();
};

export const toggleSound = (id: string) => {
  setSoundLevel(id, (ambientMix[id] ?? 0) > 0 ? 0 : 0.5);
};

export const applyPreset = (preset: AmbientPreset) => {
  setAmbientMix(presetMix(preset));
  persist();
};

export const clearMix = () => {
  setAmbientMix(silentMix());
  persist();
};

export const activePresetId = (): string | null =>
  PRESETS.find((preset) => isPresetActive(preset, { ...ambientMix }))?.id ?? null;

export const ambientSnapshot = (): VolumeMap => ({ ...ambientMix });
