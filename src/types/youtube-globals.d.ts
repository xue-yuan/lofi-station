/// <reference types="youtube" />

/**
 * `@types/youtube` declares the `YT` namespace but not how the IFrame API
 * bootstraps itself: it attaches `YT` to `window` and calls a global ready
 * callback once the remote script has parsed.
 */
declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
    /** Safari's prefixed constructor, still needed for the timer chime. */
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
