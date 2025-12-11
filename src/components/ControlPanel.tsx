import { createMemo, Show, type Component } from "solid-js";
import { playerState, setVolume, toggleMute, playRandomChannel } from "../stores/playerStore";
import { STATION_CATEGORIES } from "../stations";

const VolumeUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
);
const MutedLargeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
);
const VolumeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
);
const MutedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
);
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
);

const ShuffleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l-5 5M4 4l5 5" /></svg>
);

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
);

const WidgetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
);
const ColorPaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
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

    onToggleTheme?: () => void;
    isThemeOpen?: boolean;
    onCloseTheme?: () => void;
    activeTheme?: string;
    onSelectTheme?: (theme: string) => void;
}

const ControlPanel: Component<ControlPanelProps> = (props) => {
    const currentCategory = createMemo(() =>
        STATION_CATEGORIES.find(c => c.id === playerState.currentCategoryId)
    );

    const currentChannel = createMemo(() => {
        const cat = currentCategory();
        return cat?.channels.find(c => c.id === playerState.currentChannelId);
    });

    const handleRandom = () => {
        if (playerState.currentCategoryId) {
            playRandomChannel(playerState.currentCategoryId);
        }
    };

    return (
        <div class="fixed bottom-8 left-8 right-8 z-50 origin-bottom flex justify-center pointer-events-none">
            <div class="pointer-events-auto flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center gap-6 p-4 px-8 bg-black/60 backdrop-blur-md rounded-box border border-white/10 shadow-lg relative w-full max-w-5xl">
                <div class="flex items-center gap-4 md:justify-self-start overflow-hidden max-w-[300px]">
                    <div class="avatar flex-shrink-0">
                        <div class="w-12 rounded-xl ring ring-white/10 ring-offset-base-100 ring-offset-2">
                            <Show when={playerState.currentChannelId} fallback={<div class="w-full h-full bg-white/10"></div>}>
                                <img src={`https://img.youtube.com/vi/${playerState.currentChannelId}/mqdefault.jpg`} alt="Channel" />
                            </Show>
                        </div>
                    </div>
                    <div class="min-w-0 flex-1 overflow-hidden relative group">
                        <div class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-base-100/10 to-transparent z-10 pointer-events-none"></div>
                        <div class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-base-100/10 to-transparent z-10 pointer-events-none"></div>
                        <div class="w-full overflow-hidden mask-linear-fade">
                            <div class="flex w-max animate-marquee hover:pause gap-8">
                                <h3 class="font-bold text-sm md:text-md px-2 text-white whitespace-nowrap">
                                    {currentChannel()?.title || "Loading..."}
                                </h3>
                                <h3 class="font-bold text-sm md:text-md px-2 text-white whitespace-nowrap" aria-hidden="true">
                                    {currentChannel()?.title || "Loading..."}
                                </h3>
                            </div>
                        </div>
                        <p class="text-xs text-white/70 px-2 mt-1 truncate font-medium uppercase tracking-wider">
                            {currentCategory()?.name} <span class="opacity-50 mx-1">•</span> {currentChannel()?.author}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-4 md:justify-self-center">
                    <div class="relative">
                        <StationSelector
                            isOpen={props.isStationSelectorOpen || false}
                            onClose={props.onCloseStationSelector || (() => { })}
                        />
                        <button
                            class={`btn btn-circle btn-ghost btn-sm ${props.isStationSelectorOpen ? 'text-primary bg-primary/20' : 'text-white'}`}
                            onClick={() => props.onToggleStationSelector?.()}
                            title="Stations Menu"
                        >
                            <MenuIcon />
                        </button>
                    </div>
                    <button
                        class="btn btn-circle btn-primary btn-lg shadow-glow text-primary-content"
                        onClick={toggleMute}
                        disabled={playerState.isLoading}
                    >
                        <Show when={!playerState.isLoading} fallback={<span class="loading loading-spinner text-white"></span>}>
                            {playerState.isMuted ? <MutedLargeIcon /> : <VolumeUpIcon />}
                        </Show>
                    </button>
                    <button class="btn btn-circle btn-ghost btn-sm text-white" onClick={handleRandom} title="Shuffle Current Station">
                        <ShuffleIcon />
                    </button>
                </div>

                <div class="flex items-center gap-4 min-w-[150px] md:justify-self-end">
                    <div class="flex items-center gap-1">
                        <button
                            class={`btn btn-circle btn-ghost btn-sm ${props.isImmersive ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                            onClick={() => props.onToggleImmersive?.()}
                            title={props.isImmersive ? "Disable Immersive Mode" : "Enable Immersive Mode"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        </button>

                        <div class="relative">
                            <ThemeSelector
                                isOpen={props.isThemeOpen || false}
                                onClose={props.onCloseTheme || (() => { })}
                                activeTheme={props.activeTheme || 'luxury'}
                                onSelectTheme={props.onSelectTheme || (() => { })}
                            />
                            <button
                                class={`btn btn-circle btn-ghost btn-sm ${props.isThemeOpen ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                                onClick={() => props.onToggleTheme?.()}
                                title="Change Theme"
                            >
                                <ColorPaletteIcon />
                            </button>
                        </div>
                        <div class="relative">
                            <AmbientMixer
                                isOpen={props.isAmbientOpen || false}
                                onClose={props.onCloseAmbient || (() => { })}
                            />
                            <button
                                class={`btn btn-circle btn-ghost btn-sm ${props.isAmbientOpen ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                                onClick={() => props.onToggleAmbient?.()}
                                title="Ambient Mixer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            </button>
                        </div>
                        <div class="relative">
                            <button
                                class={`btn btn-circle btn-ghost btn-sm ${props.isWidgetsOpen ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                                onClick={() => props.onToggleWidgets?.()}
                                title="Widgets Panel"
                            >
                                <WidgetIcon />
                            </button>
                        </div>
                    </div>
                    <div class="h-4 w-[1px] bg-white/10"></div>

                    <a
                        href="https://github.com/xue-yuan/lofi-station"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="btn btn-circle btn-ghost btn-sm text-white/40 hover:text-white"
                        title="View on GitHub"
                    >
                        <GithubIcon />
                    </a>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-circle btn-ghost btn-xs text-white" onClick={toggleMute}>
                            {playerState.isMuted || playerState.volume === 0 ? <MutedIcon /> : <VolumeIcon />}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={playerState.volume}
                            class="range range-xs range-primary w-20"
                            onInput={(e) => setVolume(Number(e.currentTarget.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;
