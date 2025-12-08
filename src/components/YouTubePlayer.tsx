import { onMount, onCleanup, createEffect, createSignal, Show, type Component } from "solid-js";
import { playerState, setPlaying, setLoading } from "../stores/playerStore";
import LoadingOverlay from "./LoadingOverlay";

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

const YouTubePlayer: Component = () => {
    let player: any;
    const [isPlayerReady, setPlayerReady] = createSignal(false);

    onMount(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                createPlayer();
            };
        } else {
            createPlayer();
        }
    });

    onCleanup(() => {
        if (player && player.destroy) {
            player.destroy();
        }
    });

    const createPlayer = () => {
        if (player) return;

        player = new window.YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: playerState.currentStationId,
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'rel': 0,
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError,
            }
        });
    };

    const onPlayerReady = (_event: any) => {
        player.setVolume(playerState.volume);
        if (playerState.isMuted) player.mute();

        // Initial State Check:
        // If the player is already CUED or PAUSED, we are "loaded".
        // onPlayerStateChange might not fire if we start in this state.
        const state = player.getPlayerState();
        console.log("Player Ready. Initial State:", state);

        if (state === 5 || state === 2 || state === -1) {
            // 5=CUED, 2=PAUSED, -1=UNSTARTED (Usually means loaded but not played)
            setLoading(false);
        }

        setPlayerReady(true);
    };

    const onPlayerStateChange = (event: any) => {
        console.log("Player State Change:", event.data);
        // 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING, 5 = CUED
        const state = event.data;

        if (state === 1) { // PLAYING
            setLoading(false);
            if (!playerState.isPlaying) setPlaying(true);
        }
        else if (state === 3) {
            setLoading(true);
        }
        else if (state === 5) { // CUED (Video loaded and ready)
            setLoading(false);
            if (playerState.isPlaying) player.playVideo();
        }
        else if (state === 2) { // PAUSED
            // If we are paused, we are definitely 'loaded' enough to not show a spinner
            setLoading(false);
            if (playerState.isPlaying) {
                console.log("Auto-resuming playback...");
                player.playVideo();
            }
        }
    };

    const onPlayerError = (event: any) => {
        console.error("YouTube Player Error:", event.data);
        setLoading(false);
    };

    createEffect(() => {
        if (!isPlayerReady() || !player || !player.setVolume) return;
        player.setVolume(playerState.volume);
    });

    createEffect(() => {
        if (!isPlayerReady() || !player || !player.mute) return;

        if (playerState.isMuted) {
            player.mute();
        } else {
            player.unMute();
        }
    });

    createEffect(() => {
        if (!isPlayerReady() || !player || !player.playVideo || playerState.isLoading) return;

        if (playerState.isPlaying) {
            player.playVideo();
        } else {
            player.pauseVideo();
        }
    });

    createEffect(() => {
        const stationId = playerState.currentStationId;
        if (player && player.loadVideoById && stationId) {
            const currentData = player.getVideoData();
            if (currentData && currentData.video_id === stationId) return;

            player.loadVideoById(stationId);
            setLoading(true);
        }
    });

    return (
        <div class="fixed inset-0 overflow-hidden">
            <Show when={playerState.isLoading}>
                <LoadingOverlay />
            </Show>
            <div class="w-full h-full pointer-events-none scale-[3] md:scale-[3] lg:scale-[2] xl:scale-[1.35] flex items-center justify-center">
                <div id="player"></div>
            </div>
            <div class="absolute top-0 left-0 w-full h-full bg-black/10 z-0 pointer-events-auto cursor-default"></div>
        </div>
    );
};

export default YouTubePlayer;
