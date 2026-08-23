import { onMount, onCleanup, createEffect, createSignal, Show, type Component } from "solid-js";
import {
  playerState,
  setPlaying,
  setLoading,
  isMusicSilenced,
  playRandomChannel,
  playRandomStation,
  skipUnavailableChannel,
} from "../stores/playerStore";
import { findChannel } from "../stations";
import {
  registerMediaSessionHandlers,
  setMediaPlaybackState,
  updateMediaMetadata,
} from "../lib/mediaSession";
import LoadingOverlay from "./LoadingOverlay";

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

const FATAL_ERRORS: YT.PlayerError[] = [2, 5, 100, 101, 150];

const YouTubePlayer: Component = () => {
  let player: YT.Player | undefined;
  let lastLoadedVideoId = "";
  let skipTimer: ReturnType<typeof setTimeout> | undefined;
  const [isPlayerReady, setPlayerReady] = createSignal(false);

  const createPlayer = () => {
    if (player || !window.YT) return;

    player = new window.YT.Player("player", {
      height: "100%",
      width: "100%",
      videoId: playerState.currentChannelId,
      playerVars: {
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });
    lastLoadedVideoId = playerState.currentChannelId;
  };

  onMount(() => {
    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    if (!document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) {
      const tag = document.createElement("script");
      tag.src = IFRAME_API_SRC;
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => createPlayer();
  });

  onCleanup(() => {
    clearTimeout(skipTimer);
    if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady = undefined;
    player?.destroy?.();
    player = undefined;
  });

  const onPlayerReady = () => {
    if (!player) return;
    player.setVolume(playerState.volume);
    if (isMusicSilenced()) player.mute();

    const state = player.getPlayerState();
    if (
      state === YT.PlayerState.CUED ||
      state === YT.PlayerState.PAUSED ||
      state === YT.PlayerState.UNSTARTED
    ) {
      setLoading(false);
    }

    setPlayerReady(true);
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    switch (event.data) {
      case YT.PlayerState.PLAYING:
        setLoading(false);
        if (!playerState.isPlaying) setPlaying(true);
        break;
      case YT.PlayerState.BUFFERING:
        setLoading(true);
        break;
      case YT.PlayerState.CUED:
      case YT.PlayerState.PAUSED:
        setLoading(false);
        if (playerState.isPlaying) player?.playVideo();
        break;
    }
  };

  const onPlayerError = (event: YT.OnErrorEvent) => {
    const errorCode = event.data;
    const failedChannelId = playerState.currentChannelId;
    console.error("YouTube Player Error:", errorCode, failedChannelId);

    if (!FATAL_ERRORS.includes(errorCode)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    clearTimeout(skipTimer);
    skipTimer = setTimeout(() => skipUnavailableChannel(failedChannelId), 1000);
  };

  createEffect(() => {
    if (!isPlayerReady() || !player) return;
    player.setVolume(playerState.volume);
  });

  createEffect(() => {
    if (!isPlayerReady() || !player) return;
    if (isMusicSilenced()) player.mute();
    else player.unMute();
  });

  createEffect(() => {
    if (!isPlayerReady() || !player || playerState.isLoading) return;
    if (playerState.isPlaying) player.playVideo();
    else player.pauseVideo();
  });

  createEffect(() => {
    const stationId = playerState.currentChannelId;
    if (!isPlayerReady() || !player || !stationId) return;
    if (stationId === lastLoadedVideoId) return;

    setLoading(true);
    if (playerState.isPlaying) player.loadVideoById(stationId);
    else player.cueVideoById(stationId);
    lastLoadedVideoId = stationId;
  });

  onMount(() => {
    const dispose = registerMediaSessionHandlers({
      onPlay: () => setPlaying(true),
      onPause: () => setPlaying(false),
      onNextTrack: () => playRandomChannel(playerState.currentCategoryId),
      onPreviousTrack: () => playRandomStation(),
      onStop: () => setPlaying(false),
    });
    onCleanup(dispose);
  });

  createEffect(() => {
    const found = findChannel(playerState.currentChannelId);
    if (!found) return;
    updateMediaMetadata({
      title: found.channel.title,
      artist: found.channel.author,
      album: `Lofi Radio - ${found.category.name}`,
      videoId: found.channel.id,
    });
  });

  createEffect(() => {
    setMediaPlaybackState(playerState.isPlaying ? "playing" : "paused");
  });

  return (
    <div class="fixed inset-0 overflow-hidden">
      <Show when={playerState.isLoading}>
        <LoadingOverlay />
      </Show>
      <div class="w-full h-full pointer-events-none scale-[3] md:scale-[3] lg:scale-[2] xl:scale-[1.35] flex items-center justify-center">
        <div id="player" />
      </div>
      <div class="absolute top-0 left-0 w-full h-full bg-black/10 z-0 pointer-events-auto cursor-default" />
    </div>
  );
};

export default YouTubePlayer;
