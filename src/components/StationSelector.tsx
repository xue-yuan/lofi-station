import { createSignal, For, Show, type Component } from "solid-js";
import { STATION_CATEGORIES, type StationCategory } from "../stations";
import { playChannel, playRandomChannel, playerState } from "../stores/playerStore";

interface StationSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

const StationSelector: Component<StationSelectorProps> = (props) => {
    const [view, setView] = createSignal<'categories' | 'channels'>('categories');
    const [selectedCategory, setSelectedCategory] = createSignal<StationCategory | null>(null);

    const handleCategoryClick = (category: StationCategory) => {
        setSelectedCategory(category);
        setView('channels');
    };

    const handleBack = () => {
        setView('categories');
        setSelectedCategory(null);
    };

    const handleShuffleCategory = (e: MouseEvent) => {
        e.stopPropagation();
        if (selectedCategory()) {
            playRandomChannel(selectedCategory()!.id);
            props.onClose();
        }
    };

    return (
        <div
            class={`fixed bottom-56 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 origin-bottom md:absolute md:bottom-full md:mb-8 ${props.isOpen ? 'opacity-100 scale-100 md:translate-y-0' : 'opacity-0 scale-95 pointer-events-none md:translate-y-4'}`}
        >
            <div class="w-[300px] h-[400px] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div class="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
                    <Show when={view() === 'channels'} fallback={
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <h3 class="font-bold text-white tracking-widest uppercase text-xs">Stations</h3>
                        </div>
                    }>
                        <div class="flex items-center gap-2">
                            <button class="btn btn-xs btn-ghost btn-circle text-white/60 hover:text-white" onClick={handleBack}>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h3 class="font-bold text-white tracking-widest uppercase text-xs truncate max-w-[150px]">{selectedCategory()?.name}</h3>
                        </div>
                    </Show>
                    <button class="btn btn-xs btn-ghost btn-circle text-white/40 hover:text-white" onClick={props.onClose}>✕</button>
                </div>
                <div class="flex-1 overflow-y-auto custom-scrollbar p-2">
                    <Show when={view() === 'categories'}>
                        <div class="grid grid-cols-1 gap-2">
                            <For each={STATION_CATEGORIES}>
                                {(category) => (
                                    <button
                                        class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors group text-left w-full border border-white/5 hover:border-white/10"
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        <div class="flex-1 min-w-0">
                                            <div class="font-bold text-sm text-white truncate text-lg tracking-wide">{category.name}</div>
                                            <div class="text-xs text-white/50 truncate">{category.description}</div>
                                        </div>
                                        <div class="text-white/20 group-hover:text-white/60">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </button>
                                )}
                            </For>
                        </div>
                    </Show>
                    <Show when={view() === 'channels'}>
                        <div class="flex flex-col gap-2">
                            <button
                                class="btn btn-sm btn-primary w-full gap-2 shadow-lg mb-2"
                                onClick={handleShuffleCategory}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Shuffle {selectedCategory()?.name}
                            </button>
                            <For each={selectedCategory()?.channels}>
                                {(channel) => (
                                    <button
                                        class={`flex items-center gap-3 p-2 rounded-lg transition-all text-left w-full border border-transparent group overflow-hidden ${playerState.currentChannelId === channel.id ? 'bg-primary/20 border-primary/50 shadow-[0_0_15px_rgba(var(--p)/0.3)]' : 'bg-black/20 hover:bg-white/10 hover:border-white/10'}`}
                                        onClick={() => { playChannel(selectedCategory()!.id, channel.id); props.onClose(); }}
                                    >
                                        <div class="relative w-16 h-10 rounded overflow-hidden shrink-0">
                                            <img
                                                src={`https://img.youtube.com/vi/${channel.id}/mqdefault.jpg`}
                                                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={channel.title}
                                            />
                                            {playerState.currentChannelId === channel.id && (
                                                <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span class="loading loading-bars loading-xs text-primary"></span>
                                                </div>
                                            )}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class={`text-xs font-bold truncate ${playerState.currentChannelId === channel.id ? 'text-primary' : 'text-white'}`}>{channel.title}</div>
                                            <div class="text-[10px] text-white/50 truncate uppercase tracking-wider">{channel.author}</div>
                                        </div>
                                    </button>
                                )}
                            </For>
                        </div>
                    </Show>
                </div>
            </div>
        </div>
    );
};

export default StationSelector;
