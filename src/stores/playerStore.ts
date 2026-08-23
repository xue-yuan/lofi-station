import { createStore } from "solid-js/store";
import { STATION_CATEGORIES, findCategory, findChannel, type Channel } from "../stations";
import { clampNumber, readJSON, readString, writeJSON, writeString } from "../lib/storage";
import { initialShareState } from "../lib/initialShareState";

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isMusicMuted: boolean;
  volume: number;
  currentCategoryId: string;
  currentChannelId: string;
  isLoading: boolean;
}

const VOLUME_KEY = "lofi_volume";
const STATION_KEY = "lofi_station";
const MUSIC_MUTED_KEY = "lofi_music_muted";

interface StoredStation {
  categoryId: string;
  channelId: string;
}

const isStoredStation = (value: unknown): value is StoredStation =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as StoredStation).categoryId === "string" &&
  typeof (value as StoredStation).channelId === "string";

const unavailableChannels = new Set<string>();

export const markChannelUnavailable = (channelId: string): void => {
  unavailableChannels.add(channelId);
};

export const isChannelAvailable = (channel: Channel): boolean =>
  !channel.broken && !unavailableChannels.has(channel.id);

const resetUnavailableChannels = () => unavailableChannels.clear();

const defaultCategory = STATION_CATEGORIES[0];
const defaultChannel = defaultCategory.channels[0];

const restoreStation = (): StoredStation => {
  const shared = initialShareState;
  if (shared.channelId) {
    const found = findChannel(shared.channelId);
    if (found) {
      return { categoryId: found.category.id, channelId: found.channel.id };
    }
  }
  if (shared.stationId) {
    const category = findCategory(shared.stationId);
    const playable = category?.channels.find((c) => !c.broken);
    if (category && playable) {
      return { categoryId: category.id, channelId: playable.id };
    }
  }

  const stored = readJSON<StoredStation | null>(STATION_KEY, null, (v): v is StoredStation =>
    isStoredStation(v),
  );
  if (!stored) {
    return { categoryId: defaultCategory.id, channelId: defaultChannel.id };
  }

  const category = STATION_CATEGORIES.find((c) => c.id === stored.categoryId);
  const channel = category?.channels.find((c) => c.id === stored.channelId);
  if (!category || !channel || channel.broken) {
    return { categoryId: defaultCategory.id, channelId: defaultChannel.id };
  }
  return stored;
};

const restoredStation = restoreStation();

export const [playerState, setPlayerState] = createStore<PlayerState>({
  isPlaying: false,
  isMuted: false,
  isMusicMuted: readString(MUSIC_MUTED_KEY) === "1",
  volume: clampNumber(readString(VOLUME_KEY, "50"), 0, 100, 50),
  currentCategoryId: restoredStation.categoryId,
  currentChannelId: restoredStation.channelId,
  isLoading: true,
});

export const setPlaying = (isPlaying: boolean) => setPlayerState("isPlaying", isPlaying);
export const setMuted = (isMuted: boolean) => setPlayerState("isMuted", isMuted);
export const setLoading = (isLoading: boolean) => setPlayerState("isLoading", isLoading);
export const toggleMute = () => setPlayerState("isMuted", (m) => !m);

export const setMusicMuted = (isMusicMuted: boolean) => {
  setPlayerState("isMusicMuted", isMusicMuted);
  writeString(MUSIC_MUTED_KEY, isMusicMuted ? "1" : "0");
};

export const toggleMusicMuted = () => setMusicMuted(!playerState.isMusicMuted);

export const isMusicSilenced = (): boolean => playerState.isMuted || playerState.isMusicMuted;

export const isAmbientOnly = (): boolean => playerState.isMusicMuted && !playerState.isMuted;

export const setVolume = (volume: number) => {
  const next = clampNumber(volume, 0, 100, playerState.volume);
  setPlayerState("volume", next);
  writeString(VOLUME_KEY, String(next));
};

export const playChannel = (categoryId: string, channelId: string) => {
  setPlayerState({
    currentCategoryId: categoryId,
    currentChannelId: channelId,
    isLoading: true,
    isPlaying: true,
  });
  writeJSON(STATION_KEY, { categoryId, channelId });
};

interface Candidate {
  categoryId: string;
  channelId: string;
}

const collectCandidates = (predicate: (categoryId: string, channel: Channel) => boolean) => {
  const candidates: Candidate[] = [];
  for (const category of STATION_CATEGORIES) {
    for (const channel of category.channels) {
      if (!isChannelAvailable(channel)) continue;
      if (!predicate(category.id, channel)) continue;
      candidates.push({ categoryId: category.id, channelId: channel.id });
    }
  }
  return candidates;
};

const pickFrom = (candidates: Candidate[]): Candidate | null =>
  candidates.length === 0 ? null : candidates[Math.floor(Math.random() * candidates.length)];

const playFirstMatch = (tiers: ((categoryId: string, channel: Channel) => boolean)[]): void => {
  for (const predicate of tiers) {
    const pick = pickFrom(collectCandidates(predicate));
    if (pick) {
      playChannel(pick.categoryId, pick.channelId);
      return;
    }
  }

  resetUnavailableChannels();
  const fallback = pickFrom(collectCandidates(() => true));
  if (fallback) playChannel(fallback.categoryId, fallback.channelId);
};

export const playRandomChannel = (categoryId: string) => {
  const current = playerState.currentChannelId;
  playFirstMatch([
    (cat, ch) => cat === categoryId && ch.id !== current,
    (_cat, ch) => ch.id !== current,
  ]);
};

export const playRandomStation = () => {
  const currentCategory = playerState.currentCategoryId;
  const current = playerState.currentChannelId;
  playFirstMatch([(cat) => cat !== currentCategory, (_cat, ch) => ch.id !== current]);
};

export const playFullyRandom = () => {
  const current = playerState.currentChannelId;
  playFirstMatch([(_cat, ch) => ch.id !== current, () => true]);
};

export const playCategory = (categoryId: string) => {
  const current = playerState.currentChannelId;
  playFirstMatch([
    (cat, ch) => cat === categoryId && ch.id !== current,
    (cat) => cat === categoryId,
  ]);
};

export const skipUnavailableChannel = (channelId: string) => {
  markChannelUnavailable(channelId);
  playRandomChannel(playerState.currentCategoryId);
};
