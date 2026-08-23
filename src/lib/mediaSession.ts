export interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onNextTrack: () => void;
  onPreviousTrack: () => void;
  onStop?: () => void;
}

export interface MediaMetadataInput {
  title: string;
  artist: string;
  album: string;
  videoId: string;
}

const isSupported = () => typeof navigator !== "undefined" && "mediaSession" in navigator;

type Action = Parameters<MediaSession["setActionHandler"]>[0];

const setHandler = (action: Action, handler: (() => void) | null) => {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch {}
};

export const registerMediaSessionHandlers = (handlers: MediaSessionHandlers): (() => void) => {
  if (!isSupported()) return () => {};

  setHandler("play", handlers.onPlay);
  setHandler("pause", handlers.onPause);
  setHandler("nexttrack", handlers.onNextTrack);
  setHandler("previoustrack", handlers.onPreviousTrack);
  if (handlers.onStop) setHandler("stop", handlers.onStop);

  setHandler("seekbackward", null);
  setHandler("seekforward", null);
  setHandler("seekto", null);

  return () => {
    if (!isSupported()) return;
    for (const action of ["play", "pause", "nexttrack", "previoustrack", "stop"] as Action[]) {
      setHandler(action, null);
    }
  };
};

export const updateMediaMetadata = (input: MediaMetadataInput): void => {
  if (!isSupported() || typeof MediaMetadata === "undefined") return;

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: input.title,
      artist: input.artist,
      album: input.album,
      artwork: [
        {
          src: `https://img.youtube.com/vi/${input.videoId}/mqdefault.jpg`,
          sizes: "320x180",
          type: "image/jpeg",
        },
        {
          src: `https://img.youtube.com/vi/${input.videoId}/hqdefault.jpg`,
          sizes: "480x360",
          type: "image/jpeg",
        },
        {
          src: `https://img.youtube.com/vi/${input.videoId}/maxresdefault.jpg`,
          sizes: "1280x720",
          type: "image/jpeg",
        },
      ],
    });
  } catch {}
};

export const setMediaPlaybackState = (state: "playing" | "paused" | "none"): void => {
  if (!isSupported()) return;
  try {
    navigator.mediaSession.playbackState = state;
  } catch {}
};
