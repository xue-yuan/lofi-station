import { type Component, For } from "solid-js";

interface ThemeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    activeTheme: string;
    onSelectTheme: (theme: string) => void;
}

const THEMES = [
    { id: 'black', name: 'Original', color: '#000000' },
    { id: 'luxury', name: 'Classic', color: '#FFFFFF' },
    { id: 'business', name: 'Blue', color: '#1C4E80' },
    { id: 'coffee', name: 'Coffee', color: '#DB924B' },
    { id: 'forest', name: 'Forest', color: '#1EB854' },
    { id: 'night', name: 'Night', color: '#3ABFF8' },
    { id: 'sunset', name: 'Sunset', color: '#FF865B' },
    { id: 'retro', name: 'Retro', color: '#EF9995' },
    { id: 'synthwave', name: 'Synth', color: '#E779C1' },
    { id: 'dark', name: 'Daisy', color: '#7480ff' },
];

const ThemeSelector: Component<ThemeSelectorProps> = (props) => {
    return (
        <div
            class={`absolute bottom-full mb-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 origin-bottom ${props.isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
        >
            <div class="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden w-[300px] shadow-2xl transition-all duration-300">
                <div class="flex items-center p-3 bg-white/5 border-b border-white/5 pr-3 justify-between">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span class="text-xs font-bold text-white tracking-widest uppercase">Themes</span>
                    </div>
                    <button
                        onClick={props.onClose}
                        class="btn btn-circle btn-ghost btn-xs text-white/40 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="p-4 grid grid-cols-3 gap-3">
                    <For each={THEMES}>
                        {(theme) => (
                            <button
                                class={`flex flex-col items-center gap-2 group transition-all duration-200 ${props.activeTheme === theme.id ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                onClick={() => props.onSelectTheme(theme.id)}
                            >
                                <div
                                    class={`w-10 h-10 rounded-full shadow-lg transition-transform duration-200 border-2 ${props.activeTheme === theme.id ? 'scale-110 border-white ring-2 ring-primary ring-offset-2 ring-offset-black' : 'border-white/10 group-hover:scale-105'}`}
                                    style={{ "background-color": theme.color }}
                                ></div>
                                <span class={`text-[10px] font-medium tracking-wide ${props.activeTheme === theme.id ? 'text-white' : 'text-white/60'}`}>
                                    {theme.name}
                                </span>
                            </button>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;
