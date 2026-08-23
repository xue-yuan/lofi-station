import {
  createMemo,
  Show,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  type Component,
} from "solid-js";
import {
  playerState,
  setVolume,
  toggleMute,
  isAmbientOnly,
  playRandomChannel,
} from "../stores/playerStore";
import { STATION_CATEGORIES } from "../stations";

const VolumeUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
  </svg>
);

const MutedLargeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-8 w-8"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
    />
  </svg>
);

const VolumeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
  </svg>
);

const MutedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const ShuffleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l-5 5M4 4l5 5"
    />
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8.684 13.342a3 3 0 100-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316M18 8a3 3 0 100-6 3 3 0 000 6zm0 14a3 3 0 100-6 3 3 0 000 6z"
    />
  </svg>
);

const AmbientIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ImmersiveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
  </svg>
);

const WidgetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

const ColorPaletteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
    />
  </svg>
);

import StationSelector from "./StationSelector";
import AmbientMixer from "./AmbientMixer";
import ThemeSelector from "./ThemeSelector";

interface ControlPanelProps {
  onToggleAmbient?: () => void;
  isAmbientOpen?: boolean;
  onCloseAmbient?: () => void;

  isImmersive?: boolean;
  onToggleImmersive?: () => void;

  onToggleStationSelector?: () => void;
  isStationSelectorOpen?: boolean;
  onCloseStationSelector?: () => void;

  onToggleWidgets?: () => void;
  isWidgetsOpen?: boolean;
  onCloseWidgets?: () => void;

  onToggleInfo?: () => void;
  isInfoOpen?: boolean;
  onCloseInfo?: () => void;

  onToggleTheme?: () => void;
  isThemeOpen?: boolean;
  onCloseTheme?: () => void;
  activeTheme?: string;
  onSelectTheme?: (theme: string) => void;

  onShare?: () => void;
}

const ControlPanel: Component<ControlPanelProps> = (props) => {
  const currentCategory = createMemo(() =>
    STATION_CATEGORIES.find((c) => c.id === playerState.currentCategoryId),
  );

  const currentChannel = createMemo(() => {
    const cat = currentCategory();
    return cat?.channels.find((c) => c.id === playerState.currentChannelId);
  });

  const handleRandom = () => {
    if (playerState.currentCategoryId) {
      playRandomChannel(playerState.currentCategoryId);
    }
  };

  let containerRef: HTMLDivElement | undefined;
  let textRef: HTMLHeadingElement | undefined;
  const [shouldScroll, setShouldScroll] = createSignal(false);

  const measureMarquee = () => {
    if (containerRef && textRef) {
      const containerWidth = containerRef.clientWidth;
      const textWidth = textRef.scrollWidth;
      setShouldScroll(textWidth > containerWidth);
    }
  };

  createEffect(() => {
    const title = currentChannel()?.title;
    if (title) {
      setShouldScroll(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(measureMarquee);
      });
    }
  });

  onMount(() => {
    window.addEventListener("resize", measureMarquee);
    setTimeout(measureMarquee, 100);
  });

  onCleanup(() => {
    window.removeEventListener("resize", measureMarquee);
  });

  const volumeLabel = () =>
    playerState.isMuted || playerState.volume === 0 ? <MutedIcon /> : <VolumeIcon />;

  const panelButton = (active: boolean) =>
    `btn btn-circle btn-ghost btn-sm ${
      active ? "text-primary bg-primary/15" : "text-white/50 hover:text-white hover:bg-white/10"
    }`;

  return (
    <div class="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 z-50 origin-bottom flex justify-center pointer-events-none">
      <div class="pointer-events-auto flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(max-content,1fr)] items-center gap-5 lg:gap-4 xl:gap-8 px-5 py-4 lg:px-6 bg-black/60 backdrop-blur-md rounded-box border border-white/10 shadow-lg relative w-full max-w-5xl">
        <div
          class={`flex items-center gap-3.5 min-w-0 w-full lg:justify-self-start transition-opacity duration-300 ${isAmbientOnly() ? "opacity-40" : "opacity-100"}`}
        >
          <div class="avatar shrink-0">
            <div class="w-11 rounded-lg ring-1 ring-white/15">
              <Show
                when={playerState.currentChannelId}
                fallback={<div class="w-full h-full bg-white/10" />}
              >
                <img
                  src={`https://img.youtube.com/vi/${playerState.currentChannelId}/mqdefault.jpg`}
                  alt=""
                />
              </Show>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div
              ref={containerRef}
              class={`w-full overflow-hidden ${shouldScroll() ? "marquee-mask" : ""}`}
            >
              <div class={`flex gap-12 ${shouldScroll() ? "w-max animate-marquee" : "w-full"}`}>
                <a
                  href={`https://www.youtube.com/watch?v=${playerState.currentChannelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-block"
                >
                  <h3
                    ref={textRef}
                    class="font-semibold text-sm text-white hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {currentChannel()?.title || "Loading..."}
                  </h3>
                </a>
                <Show when={shouldScroll()}>
                  <a
                    href={`https://www.youtube.com/watch?v=${playerState.currentChannelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-block"
                    tabindex={-1}
                  >
                    <h3
                      class="font-semibold text-sm text-white hover:text-primary transition-colors whitespace-nowrap"
                      aria-hidden="true"
                    >
                      {currentChannel()?.title || "Loading..."}
                    </h3>
                  </a>
                </Show>
              </div>
            </div>
            <p class="text-[11px] text-white/50 mt-0.5 truncate font-medium uppercase tracking-wider">
              <Show
                when={!isAmbientOnly()}
                fallback={<span class="text-primary">Ambient only — music muted</span>}
              >
                {currentCategory()?.name} <span class="opacity-40 mx-1">•</span>{" "}
                {currentChannel()?.author}
              </Show>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 lg:justify-self-center shrink-0">
          <div class="relative">
            <StationSelector
              isOpen={props.isStationSelectorOpen || false}
              onClose={props.onCloseStationSelector || (() => {})}
            />
            <button
              class={panelButton(props.isStationSelectorOpen === true)}
              onClick={() => props.onToggleStationSelector?.()}
              title="Stations Menu"
              aria-label="Open stations menu"
            >
              <MenuIcon />
            </button>
          </div>
          <button
            class="btn btn-circle btn-primary btn-lg shadow-glow text-primary-content"
            onClick={toggleMute}
            disabled={playerState.isLoading}
            aria-label={playerState.isMuted ? "Unmute" : "Mute"}
            aria-pressed={playerState.isMuted}
          >
            <Show
              when={!playerState.isLoading}
              fallback={<span class="loading loading-spinner text-white" />}
            >
              {playerState.isMuted ? <MutedLargeIcon /> : <VolumeUpIcon />}
            </Show>
          </button>
          <button
            class="btn btn-circle btn-ghost btn-sm text-white/50 hover:text-white hover:bg-white/10"
            onClick={handleRandom}
            title="Shuffle Current Station"
            aria-label="Shuffle to another channel"
          >
            <ShuffleIcon />
          </button>
        </div>

        <div class="flex items-center gap-1.5 xl:gap-3 lg:justify-self-end shrink-0">
          <div class="flex items-center gap-0.5 rounded-full bg-white/5 p-1">
            <div class="relative">
              <ThemeSelector
                isOpen={props.isThemeOpen || false}
                onClose={props.onCloseTheme || (() => {})}
                activeTheme={props.activeTheme || "luxury"}
                onSelectTheme={props.onSelectTheme || (() => {})}
              />
              <button
                class={panelButton(props.isThemeOpen === true)}
                onClick={() => props.onToggleTheme?.()}
                title="Change Theme"
                aria-label="Change theme"
              >
                <ColorPaletteIcon />
              </button>
            </div>
            <div class="relative">
              <AmbientMixer
                isOpen={props.isAmbientOpen || false}
                onClose={props.onCloseAmbient || (() => {})}
              />
              <button
                class={panelButton(props.isAmbientOpen === true)}
                onClick={() => props.onToggleAmbient?.()}
                title="Ambient Mixer"
                aria-label="Open ambient mixer"
              >
                <AmbientIcon />
              </button>
            </div>
            <button
              class={panelButton(props.isWidgetsOpen === true)}
              onClick={() => props.onToggleWidgets?.()}
              title="Widgets Panel"
              aria-label="Open widgets panel"
            >
              <WidgetIcon />
            </button>
            <button
              class={panelButton(props.isInfoOpen === true)}
              onClick={() => props.onToggleInfo?.()}
              title="Info & Shortcuts"
              aria-label="Open info and shortcuts"
            >
              <InfoIcon />
            </button>
          </div>

          <div class="h-5 w-px bg-white/10" />

          <div class="flex items-center gap-0.5">
            <button
              class={`btn btn-circle btn-ghost btn-sm ${
                props.isImmersive
                  ? "text-primary bg-primary/15"
                  : "text-white/40 hover:text-white hover:bg-white/10"
              }`}
              onClick={() => props.onToggleImmersive?.()}
              title={props.isImmersive ? "Disable Immersive Mode" : "Enable Immersive Mode"}
              aria-label={props.isImmersive ? "Disable immersive mode" : "Enable immersive mode"}
              aria-pressed={props.isImmersive}
            >
              <ImmersiveIcon />
            </button>
            <button
              class="btn btn-circle btn-ghost btn-sm text-white/40 hover:text-white hover:bg-white/10"
              onClick={() => props.onShare?.()}
              title="Copy Share Link"
              aria-label="Copy a link to this station, theme and ambient mix"
            >
              <ShareIcon />
            </button>
            <a
              href="https://github.com/xue-yuan/lofi-radio"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-circle btn-ghost btn-sm text-white/40 hover:text-white hover:bg-white/10"
              title="View on GitHub"
              aria-label="View source on GitHub"
            >
              <GithubIcon />
            </a>
          </div>

          <div class="h-5 w-px bg-white/10" />

          <div class="flex items-center gap-2 pr-1">
            <span class="text-white/40 shrink-0" aria-hidden="true">
              {volumeLabel()}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={playerState.volume}
              class="range range-xs range-primary w-16 xl:w-24"
              aria-label="Volume"
              onInput={(e) => setVolume(Number(e.currentTarget.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
