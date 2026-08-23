import { createSignal, createEffect, Show, onMount, onCleanup, type Component } from "solid-js";
import {
  playerState,
  toggleMute,
  setVolume,
  setMuted,
  playRandomChannel,
  playRandomStation,
  playFullyRandom,
  playCategory,
  setPlaying,
  toggleMusicMuted,
} from "./stores/playerStore";
import { STATION_CATEGORIES, findChannel } from "./stations";
import {
  isTypingTarget,
  resolveShortcut,
  shouldPreventDefault,
  VOLUME_STEP,
  type ShortcutAction,
} from "./lib/shortcuts";
import { readString, writeString } from "./lib/storage";
import { ambientMix } from "./stores/ambientStore";
import { DEFAULT_THEME, isValidTheme } from "./themes";
import { initialShareState } from "./lib/initialShareState";
import { copyToClipboard, currentShareUrl, syncAddressBar } from "./lib/share";
import YouTubePlayer from "./components/YouTubePlayer";
import ControlPanel from "./components/ControlPanel";
import WidgetPanel from "./components/WidgetPanel";
import DigitalClock from "./components/DigitalClock";
import WelcomeScreen from "./components/WelcomeScreen";
import Sidebar from "./components/Sidebar";
import InfoPanel, { type InfoTab } from "./components/InfoPanel";
import Header from "./components/Header";

const THEME_KEY = "lofi_theme";
const IDLE_DELAY_MS = 3000;
const HUD_DURATION_MS = 1200;

type ActivePanel = "station" | "ambient" | "theme" | "info" | null;

interface HUDState {
  visible: boolean;
  icon: string;
  text: string;
  progress?: number;
}

const App: Component = () => {
  const [activePanel, setActivePanel] = createSignal<ActivePanel>(null);
  const [isWidgetsOpen, setIsWidgetsOpen] = createSignal(false);
  const [isIdle, setIsIdle] = createSignal(false);
  const [isImmersiveEnabled, setIsImmersiveEnabled] = createSignal(false);
  const [infoTab, setInfoTab] = createSignal<InfoTab>("community");
  const storedTheme = readString(THEME_KEY, DEFAULT_THEME);
  const [activeTheme, setActiveTheme] = createSignal(
    initialShareState.theme ?? (isValidTheme(storedTheme) ? storedTheme : DEFAULT_THEME),
  );
  const [hasStarted, setHasStarted] = createSignal(false);
  const [hud, setHud] = createSignal<HUDState>({ visible: false, icon: "", text: "" });

  let hudTimer: ReturnType<typeof setTimeout> | undefined;

  const showHUD = (icon: string, text: string, progress?: number) => {
    clearTimeout(hudTimer);
    setHud({ visible: true, icon, text, progress });
    hudTimer = setTimeout(() => setHud((prev) => ({ ...prev, visible: false })), HUD_DURATION_MS);
  };

  onCleanup(() => clearTimeout(hudTimer));

  const arrivedWithStation = () =>
    initialShareState.channelId !== undefined || initialShareState.stationId !== undefined;

  const handleStart = () => {
    setHasStarted(true);
    setMuted(false);
    if (arrivedWithStation()) setPlaying(true);
    else playFullyRandom();
    setInfoTab("community");
    setActivePanel("info");
  };

  const togglePanel = (panel: Exclude<ActivePanel, null>) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const toggleWidgets = () => setIsWidgetsOpen((prev) => !prev);

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    writeString(THEME_KEY, theme);
  };

  const toggleImmersive = () => {
    const next = !isImmersiveEnabled();
    setIsImmersiveEnabled(next);
    showHUD(next ? "🌙" : "👁️", next ? "Immersive On" : "Immersive Off");
  };

  const toggleShortcutsPanel = () => {
    if (activePanel() === "info" && infoTab() === "shortcuts") {
      setActivePanel(null);
      return;
    }
    setInfoTab("shortcuts");
    setActivePanel("info");
  };

  const adjustVolume = (delta: number) => {
    const next = Math.min(100, Math.max(0, playerState.volume + delta));
    setVolume(next);
    showHUD("🔊", `Volume: ${next}%`, next);
  };

  const runShortcut = (action: ShortcutAction) => {
    switch (action.type) {
      case "start":
        handleStart();
        break;
      case "toggleMute":
        toggleMute();
        if (playerState.isMuted) showHUD("🔇", "Muted");
        else showHUD("🔊", `Volume: ${playerState.volume}%`, playerState.volume);
        break;
      case "volumeUp":
        adjustVolume(VOLUME_STEP);
        break;
      case "volumeDown":
        adjustVolume(-VOLUME_STEP);
        break;
      case "randomStation":
        playRandomStation();
        showHUD("📻", "Shuffling Station...");
        break;
      case "randomChannel":
        playRandomChannel(playerState.currentCategoryId);
        showHUD("🎵", "Next Channel...");
        break;
      case "toggleImmersive":
        toggleImmersive();
        break;
      case "toggleAmbientOnly":
        toggleMusicMuted();
        if (playerState.isMusicMuted) showHUD("🌧️", "Ambient Only");
        else showHUD("🎵", "Music On");
        break;
      case "toggleShortcuts":
        toggleShortcutsPanel();
        break;
      case "closePanel":
        setActivePanel(null);
        setIsWidgetsOpen(false);
        break;
      case "playCategory": {
        const category = STATION_CATEGORIES[action.index];
        if (!category) return;
        playCategory(category.id);
        showHUD("📻", category.name);
        break;
      }
    }
  };

  onMount(() => {
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      if (isImmersiveEnabled()) {
        idleTimer = setTimeout(() => setIsIdle(true), IDLE_DELAY_MS);
      }
    };

    createEffect(() => {
      if (isImmersiveEnabled()) {
        resetIdleTimer();
      } else {
        setIsIdle(false);
        clearTimeout(idleTimer);
      }
    });

    const handleInput = () => resetIdleTimer();

    const handleKeyDown = (e: KeyboardEvent) => {
      handleInput();
      if (isTypingTarget(e.target)) return;

      const action = resolveShortcut(e, { hasStarted: hasStarted() });
      if (!action) return;
      if (shouldPreventDefault(action)) e.preventDefault();
      runShortcut(action);
    };

    window.addEventListener("mousemove", handleInput);
    window.addEventListener("click", handleInput);
    window.addEventListener("touchstart", handleInput, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      window.removeEventListener("mousemove", handleInput);
      window.removeEventListener("click", handleInput);
      window.removeEventListener("touchstart", handleInput);
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(idleTimer);
    });
  });

  const shareState = () => ({
    stationId: playerState.currentCategoryId,
    channelId: playerState.currentChannelId,
    theme: activeTheme(),
    ambient: { ...ambientMix },
  });

  createEffect(() => {
    if (!hasStarted()) return;
    syncAddressBar(shareState());
  });

  const handleShare = async () => {
    const result = await copyToClipboard(currentShareUrl(shareState()));
    if (result === "copied") showHUD("🔗", "Link Copied");
    else showHUD("⚠️", "Copy Failed");
  };

  createEffect(() => {
    const found = findChannel(playerState.currentChannelId);
    document.title = found
      ? `${found.channel.title} - Lofi Radio`
      : "Lofi Radio - Your Personal Space for Focus, Relaxation, and Chill Beats";
  });

  const idleClass = (extra = "") =>
    `transition-opacity duration-1000 ${isIdle() ? "opacity-0 pointer-events-none" : `opacity-100 ${extra}`}`;

  return (
    <div class="w-full h-full relative" data-theme={activeTheme()}>
      <Show when={!hasStarted()}>
        <WelcomeScreen onStart={handleStart} />
      </Show>
      <div class={idleClass()}>
        <WidgetPanel isOpen={isWidgetsOpen()} onClose={() => setIsWidgetsOpen(false)} />
        <InfoPanel
          isOpen={activePanel() === "info"}
          onClose={() => setActivePanel(null)}
          activeTab={infoTab()}
          onSelectTab={setInfoTab}
        />
      </div>
      <div class={idleClass("z-[60] relative")}>
        <Sidebar />
      </div>
      <YouTubePlayer />
      <div class="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.8)_100%)]" />
      <div class={`absolute top-6 left-6 md:top-10 md:left-10 z-10 ${idleClass()}`}>
        <Header />
      </div>
      <div
        class={`absolute bottom-64 left-6 md:bottom-64 md:left-10 lg:bottom-32 z-10 transition-opacity duration-1000 ${isIdle() ? "opacity-0" : "opacity-80"}`}
      >
        <DigitalClock />
      </div>
      <div class={idleClass()}>
        <ControlPanel
          onToggleAmbient={() => togglePanel("ambient")}
          isAmbientOpen={activePanel() === "ambient"}
          onCloseAmbient={() => setActivePanel(null)}
          isImmersive={isImmersiveEnabled()}
          onToggleImmersive={toggleImmersive}
          onToggleStationSelector={() => togglePanel("station")}
          isStationSelectorOpen={activePanel() === "station"}
          onCloseStationSelector={() => setActivePanel(null)}
          onToggleWidgets={toggleWidgets}
          isWidgetsOpen={isWidgetsOpen()}
          onCloseWidgets={() => setIsWidgetsOpen(false)}
          onToggleInfo={() => {
            setInfoTab("community");
            togglePanel("info");
          }}
          isInfoOpen={activePanel() === "info"}
          onCloseInfo={() => setActivePanel(null)}
          onToggleTheme={() => togglePanel("theme")}
          isThemeOpen={activePanel() === "theme"}
          onCloseTheme={() => setActivePanel(null)}
          activeTheme={activeTheme()}
          onSelectTheme={handleThemeChange}
          onShare={handleShare}
        />
      </div>

      <div
        class={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none transition-all duration-300 transform ${hud().visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95"}`}
        role="status"
        aria-live="polite"
      >
        <div class="bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl">
          <span class="text-lg" aria-hidden="true">
            {hud().icon}
          </span>
          <div class="flex flex-col">
            <span class="text-xs font-bold tracking-wider uppercase text-white font-mono">
              {hud().text}
            </span>
            <Show when={hud().progress !== undefined}>
              <div class="w-24 h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                <div
                  class="h-full bg-primary transition-all duration-100"
                  style={{ width: `${hud().progress}%` }}
                />
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
