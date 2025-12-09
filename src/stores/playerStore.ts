import { createStore } from "solid-js/store";
import { STATION_CATEGORIES } from "../stations";

interface PlayerState {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentCategoryId: string;
    currentChannelId: string;
    isLoading: boolean;
}

const defaultCat = STATION_CATEGORIES[0];
const defaultChan = defaultCat.channels[0];

export const [playerState, setPlayerState] = createStore<PlayerState>({
    isPlaying: false,
    isMuted: false,
    volume: 50,
    currentCategoryId: defaultCat.id,
    currentChannelId: defaultChan.id,
    isLoading: true,
});

export const setPlaying = (isPlaying: boolean) => setPlayerState("isPlaying", isPlaying);
export const setMuted = (isMuted: boolean) => setPlayerState("isMuted", isMuted);
export const setVolume = (volume: number) => setPlayerState("volume", volume);
export const setLoading = (isLoading: boolean) => setPlayerState("isLoading", isLoading);
export const toggleMute = () => setPlayerState("isMuted", (m) => !m);

export const playChannel = (categoryId: string, channelId: string) => {
    setPlayerState({
        currentCategoryId: categoryId,
        currentChannelId: channelId,
        isLoading: true,
        isPlaying: true
    });
};

export const playRandomChannel = (categoryId: string) => {
    const category = STATION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const channels = category.channels;
    const candidates = channels.filter(c => c.id !== playerState.currentChannelId);
    const pool = candidates.length > 0 ? candidates : channels;
    const randomChannel = pool[Math.floor(Math.random() * pool.length)];

    playChannel(categoryId, randomChannel.id);
};
