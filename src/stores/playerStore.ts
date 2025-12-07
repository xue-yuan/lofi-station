import { createStore } from "solid-js/store";
import { STATIONS } from "../stations";

interface PlayerState {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentStationId: string;
    isLoading: boolean;
}

export const [playerState, setPlayerState] = createStore<PlayerState>({
    isPlaying: false,
    isMuted: false,
    volume: 50,
    currentStationId: STATIONS[0].id,
    isLoading: true,
});

export const setPlaying = (isPlaying: boolean) => setPlayerState("isPlaying", isPlaying);
export const setMuted = (isMuted: boolean) => setPlayerState("isMuted", isMuted);
export const setVolume = (volume: number) => setPlayerState("volume", volume);
export const setStation = (id: string) => setPlayerState("currentStationId", id);
export const setLoading = (isLoading: boolean) => setPlayerState("isLoading", isLoading);

export const toggleMute = () => setPlayerState("isMuted", (m) => !m);

export const nextStation = () => {
    const currentIndex = STATIONS.findIndex(s => s.id === playerState.currentStationId);
    const nextIndex = (currentIndex + 1) % STATIONS.length;
    setStation(STATIONS[nextIndex].id);
};

export const prevStation = () => {
    const currentIndex = STATIONS.findIndex(s => s.id === playerState.currentStationId);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = STATIONS.length - 1;
    setStation(STATIONS[prevIndex].id);
};
