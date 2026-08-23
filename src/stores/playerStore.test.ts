import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { STATION_CATEGORIES } from "../stations";

const freshStore = async () => {
  vi.resetModules();
  return import("./playerStore");
};

beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

describe("restoring the last station", () => {
  it("starts on the stored station when it still exists", async () => {
    const category = STATION_CATEGORIES[1];
    const channel = category.channels[0];
    localStorage.setItem(
      "lofi_station",
      JSON.stringify({ categoryId: category.id, channelId: channel.id }),
    );

    const { playerState } = await freshStore();
    expect(playerState.currentCategoryId).toBe(category.id);
    expect(playerState.currentChannelId).toBe(channel.id);
  });

  it("ignores a stored station that has been pruned from the catalog", async () => {
    localStorage.setItem(
      "lofi_station",
      JSON.stringify({ categoryId: "does-not-exist", channelId: "gone" }),
    );

    const { playerState } = await freshStore();
    expect(playerState.currentCategoryId).toBe(STATION_CATEGORIES[0].id);
    expect(playerState.currentChannelId).toBe(STATION_CATEGORIES[0].channels[0].id);
  });

  it("ignores malformed stored data", async () => {
    localStorage.setItem("lofi_station", "{{{");
    const { playerState } = await freshStore();
    expect(playerState.currentCategoryId).toBe(STATION_CATEGORIES[0].id);
  });
});

describe("volume persistence", () => {
  it("restores a stored volume", async () => {
    localStorage.setItem("lofi_volume", "77");
    const { playerState } = await freshStore();
    expect(playerState.volume).toBe(77);
  });

  it("clamps a stored volume that is out of range or junk", async () => {
    localStorage.setItem("lofi_volume", "9000");
    expect((await freshStore()).playerState.volume).toBe(100);

    vi.resetModules();
    localStorage.setItem("lofi_volume", "garbage");
    expect((await freshStore()).playerState.volume).toBe(50);
  });

  it("writes through on change", async () => {
    const { setVolume, playerState } = await freshStore();
    setVolume(33);
    expect(playerState.volume).toBe(33);
    expect(localStorage.getItem("lofi_volume")).toBe("33");
  });
});

describe("channel selection", () => {
  it("never returns the channel already playing", async () => {
    const { playerState, playRandomChannel } = await freshStore();
    const categoryWithSeveral = STATION_CATEGORIES.find((c) => c.channels.length > 2)!;

    for (let i = 0; i < 40; i++) {
      const before = playerState.currentChannelId;
      playRandomChannel(categoryWithSeveral.id);
      expect(playerState.currentChannelId).not.toBe(before);
    }
  });

  it("leaves a single-channel category rather than recursing forever", async () => {
    const { playerState, playChannel, playRandomChannel } = await freshStore();
    const solo = STATION_CATEGORIES.find((c) => c.channels.length === 1);
    if (!solo) return;

    playChannel(solo.id, solo.channels[0].id);
    playRandomChannel(solo.id);
    expect(playerState.currentChannelId).not.toBe(solo.channels[0].id);
  });

  it("skips channels blacklisted this session", async () => {
    const { playerState, playChannel, markChannelUnavailable, playRandomChannel } =
      await freshStore();
    const category = STATION_CATEGORIES.find((c) => c.channels.length >= 3)!;
    const [first, second, third] = category.channels;

    markChannelUnavailable(second.id);
    markChannelUnavailable(third.id);
    playChannel(category.id, first.id);
    playRandomChannel(category.id);

    expect(playerState.currentChannelId).not.toBe(second.id);
    expect(playerState.currentChannelId).not.toBe(third.id);
  });

  it("recovers by clearing the blacklist once everything is exhausted", async () => {
    const { playerState, markChannelUnavailable, playFullyRandom } = await freshStore();
    for (const category of STATION_CATEGORIES) {
      for (const channel of category.channels) markChannelUnavailable(channel.id);
    }

    playFullyRandom();
    expect(playerState.currentChannelId).toBeTruthy();
  });

  it("stays inside the requested category when one is available", async () => {
    const { playerState, playCategory } = await freshStore();
    const target = STATION_CATEGORIES.find((c) => c.channels.length > 1)!;
    playCategory(target.id);
    expect(playerState.currentCategoryId).toBe(target.id);
  });

  it("moves to a different category on shuffle-station", async () => {
    const { playerState, playRandomStation } = await freshStore();
    const before = playerState.currentCategoryId;
    playRandomStation();
    expect(playerState.currentCategoryId).not.toBe(before);
  });
});

describe("share links", () => {
  const withSearch = (search: string) => {
    vi.stubGlobal("location", {
      search,
      pathname: "/",
      origin: "http://localhost",
    });
  };

  afterEach(() => vi.unstubAllGlobals());

  it("opens on the shared channel, outranking stored history", async () => {
    const category = STATION_CATEGORIES[2];
    const channel = category.channels[0];
    const other = STATION_CATEGORIES[0];
    localStorage.setItem(
      "lofi_station",
      JSON.stringify({ categoryId: other.id, channelId: other.channels[0].id }),
    );
    withSearch(`?channel=${channel.id}`);

    const { playerState } = await freshStore();
    expect(playerState.currentChannelId).toBe(channel.id);
    expect(playerState.currentCategoryId).toBe(category.id);
  });

  it("falls back to the shared station when the channel is gone", async () => {
    const category = STATION_CATEGORIES[1];
    withSearch(`?station=${category.id}&channel=deletedVideo`);

    const { playerState } = await freshStore();
    expect(playerState.currentCategoryId).toBe(category.id);
  });

  it("ignores a link naming things that no longer exist", async () => {
    withSearch("?station=nope&channel=nope");
    const { playerState } = await freshStore();
    expect(playerState.currentCategoryId).toBe(STATION_CATEGORIES[0].id);
  });
});

describe("ambient-only mute", () => {
  it("starts off by default", async () => {
    const { playerState } = await freshStore();
    expect(playerState.isMusicMuted).toBe(false);
  });

  it("silences the music without touching the master mute", async () => {
    const { playerState, setMusicMuted, isMusicSilenced, isAmbientOnly } = await freshStore();

    setMusicMuted(true);
    expect(isMusicSilenced()).toBe(true);
    expect(playerState.isMuted).toBe(false);
    expect(isAmbientOnly()).toBe(true);
  });

  it("lets master mute silence everything on its own", async () => {
    const { setMuted, isMusicSilenced, isAmbientOnly } = await freshStore();

    setMuted(true);
    expect(isMusicSilenced()).toBe(true);
    expect(isAmbientOnly()).toBe(false);
  });

  it("composes: master mute wins while ambient-only is on", async () => {
    const { setMuted, setMusicMuted, isMusicSilenced, isAmbientOnly } = await freshStore();

    setMusicMuted(true);
    setMuted(true);
    expect(isAmbientOnly()).toBe(false);

    setMuted(false);
    expect(isMusicSilenced()).toBe(true);
    expect(isAmbientOnly()).toBe(true);
  });

  it("unmuting the music restores full playback", async () => {
    const { setMusicMuted, isMusicSilenced } = await freshStore();
    setMusicMuted(true);
    setMusicMuted(false);
    expect(isMusicSilenced()).toBe(false);
  });

  it("persists across a reload", async () => {
    const first = await freshStore();
    first.setMusicMuted(true);
    expect(localStorage.getItem("lofi_music_muted")).toBe("1");

    const { playerState } = await freshStore();
    expect(playerState.isMusicMuted).toBe(true);
  });

  it("toggles", async () => {
    const { playerState, toggleMusicMuted } = await freshStore();
    toggleMusicMuted();
    expect(playerState.isMusicMuted).toBe(true);
    toggleMusicMuted();
    expect(playerState.isMusicMuted).toBe(false);
  });
});
