import { describe, expect, it } from "vite-plus/test";
import { STATION_CATEGORIES, findCategory, findChannel } from "../stations";
import { SOUND_IDS } from "../ambient";
import { THEMES, isValidTheme } from "../themes";
import { buildShareQuery, parseShareState, type ParseOptions } from "./shareState";

const options: ParseOptions = {
  isValidStation: (id) => findCategory(id) !== undefined,
  isValidChannel: (id) => findChannel(id) !== undefined,
  isValidTheme,
  isValidSound: (id) => SOUND_IDS.includes(id),
};

describe("share links against the real catalog", () => {
  it("accepts every category id", () => {
    for (const category of STATION_CATEGORIES) {
      const parsed = parseShareState(`?station=${category.id}`, options);
      expect(parsed.stationId, category.id).toBe(category.id);
    }
  });

  it("accepts every channel id", () => {
    for (const category of STATION_CATEGORIES) {
      for (const channel of category.channels) {
        const parsed = parseShareState(`?channel=${channel.id}`, options);
        expect(parsed.channelId, channel.id).toBe(channel.id);
      }
    }
  });

  it("accepts every theme id", () => {
    for (const theme of THEMES) {
      expect(parseShareState(`?theme=${theme.id}`, options).theme).toBe(theme.id);
    }
  });

  it("accepts every sound id", () => {
    for (const id of SOUND_IDS) {
      expect(parseShareState(`?ambient=${id}:50`, options).ambient).toEqual({ [id]: 0.5 });
    }
  });

  it("round-trips a realistic link", () => {
    const category = STATION_CATEGORIES[0];
    const state = {
      stationId: category.id,
      channelId: category.channels[0].id,
      theme: THEMES[3].id,
      ambient: { [SOUND_IDS[0]]: 0.6 },
    };
    expect(parseShareState(buildShareQuery(state), options)).toEqual(state);
  });

  it("every theme offered in the picker is emitted by daisyUI", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const css = await fs.readFile(path.resolve(process.cwd(), "src/index.css"), "utf-8");
    const declared = css.match(/themes:\s*([^;]+);/)?.[1] ?? "";
    const names = declared.split(",").map((t) => t.trim());

    for (const theme of THEMES) {
      expect(names, `theme "${theme.id}" is missing from index.css`).toContain(theme.id);
    }
  });
});
