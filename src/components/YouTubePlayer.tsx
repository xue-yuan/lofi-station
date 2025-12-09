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
            videoId: playerState.currentChannelId,
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

        const state = player.getPlayerState();
        console.log("Player Ready. Initial State:", state);

        if (state === 5 || state === 2 || state === -1) {
            setLoading(false);
        }

        setPlayerReady(true);
    };

    const onPlayerStateChange = (event: any) => {
        console.log("Player State Change:", event.data);
        const state = event.data;

        if (state === 1) {
            setLoading(false);
            if (!playerState.isPlaying) setPlaying(true);
        }
        else if (state === 3) {
            setLoading(true);
        }
        else if (state === 5) {
            setLoading(false);
            if (playerState.isPlaying) player.playVideo();
        }
        else if (state === 2) {
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
        const stationId = playerState.currentChannelId;
        console.log("Station Changed:", stationId);
        if (player && player.loadVideoById && stationId) {
            setLoading(true);
            playerState.isPlaying ? player.loadVideoById(stationId) : player.cueVideoById(stationId);
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
