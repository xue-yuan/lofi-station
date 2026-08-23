import { describe, expect, it } from "vite-plus/test";
import {
  PRESETS,
  SOUNDS,
  SOUND_IDS,
  isPresetActive,
  isSilent,
  presetMix,
  silentMix,
} from "./ambient";

describe("presets", () => {
  it("only reference sounds that are installed", () => {
    for (const preset of PRESETS) {
      for (const id of Object.keys(preset.mix)) {
        expect(SOUND_IDS, `preset "${preset.id}" references "${id}"`).toContain(id);
      }
    }
  });

  it("have unique ids", () => {
    expect(new Set(PRESETS.map((p) => p.id)).size).toBe(PRESETS.length);
  });

  it("expand into a level for every installed sound", () => {
    for (const preset of PRESETS) {
      expect(Object.keys(presetMix(preset)).sort()).toEqual([...SOUND_IDS].sort());
    }
  });

  it("silence tracks the preset does not mention", () => {
    const mix = presetMix({ id: "t", name: "T", mix: { rain: 0.5 } });
    expect(mix.rain).toBe(0.5);
    expect(mix.fire).toBe(0);
    expect(mix.birds).toBe(0);
  });

  it("ignore levels for sounds that do not exist yet", () => {
    const mix = presetMix({ id: "t", name: "T", mix: { rain: 0.4, notInstalled: 0.9 } });
    expect(mix).not.toHaveProperty("notInstalled");
    expect(mix.rain).toBe(0.4);
  });

  it("clamp out-of-range levels", () => {
    const mix = presetMix({ id: "t", name: "T", mix: { rain: 5, fire: -2 } });
    expect(mix.rain).toBe(1);
    expect(mix.fire).toBe(0);
  });
});

describe("isPresetActive", () => {
  it("matches the mix a preset produces", () => {
    const preset = PRESETS[0];
    expect(isPresetActive(preset, presetMix(preset))).toBe(true);
  });

  it("stops matching once a slider is moved", () => {
    const preset = PRESETS[0];
    const moved = { ...presetMix(preset), [SOUND_IDS[0]]: 0.99 };
    expect(isPresetActive(preset, moved)).toBe(false);
  });

  it("tolerates the rounding a share link introduces", () => {
    const preset = PRESETS[0];
    const rounded = Object.fromEntries(
      Object.entries(presetMix(preset)).map(([id, v]) => [id, Math.round(v * 100) / 100]),
    );
    expect(isPresetActive(preset, rounded)).toBe(true);
  });
});

describe("catalog integrity", () => {
  it("has unique sound ids", () => {
    expect(new Set(SOUND_IDS).size).toBe(SOUNDS.length);
  });

  it("points every sound at a /sounds/ file", () => {
    for (const sound of SOUNDS) {
      expect(sound.url).toMatch(/^\/sounds\/.+\.(mp3|ogg|m4a|webm)$/);
    }
  });

  it("starts silent", () => {
    expect(isSilent(silentMix())).toBe(true);
  });
});
