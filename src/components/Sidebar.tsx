import { createSignal, For, type Component } from "solid-js";
import changelogData from "../changelog.json";

interface ChangeLogEntry {
    version: string;
    date: string;
    changes: string[];
}

const Sidebar: Component = () => {
    const [isOpen, setIsOpen] = createSignal(false);
    const logs = changelogData as ChangeLogEntry[];

    return (
        <>
            <button
                class={`fixed left-0 top-1/2 -translate-y-1/2 z-[60] btn btn-sm btn-ghost bg-black/40 backdrop-blur-md border-r border-y border-white/10 rounded-r-lg rounded-l-none text-white/50 hover:text-white hover:pl-4 transition-all duration-300 ${isOpen() ? 'translate-x-[320px]' : 'translate-x-0'}`}
                onClick={() => setIsOpen(!isOpen())}
                title="View Changelog"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class={`h-4 w-4 transition-transform duration-300 ${isOpen() ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
            <div
                class={`fixed left-0 top-0 bottom-0 w-[320px] bg-black/80 backdrop-blur-xl border-r border-white/10 z-[60] transition-transform duration-300 transform ${isOpen() ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div class="flex flex-col h-full overflow-hidden">
                    <div class="p-6 border-b border-white/10 shrink-0">
                        <h2 class="text-xl font-bold text-white tracking-widest uppercase">Updates</h2>
                        <p class="text-xs text-white/40 mt-1">Version History & Changelog</p>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div class="flex flex-col gap-8 relative">
                            <div class="absolute left-[7px] top-2 bottom-0 w-[1px] bg-white/10"></div>
                            <For each={logs}>
                                {(log, index) => (
                                    <div class="relative pl-6">
                                        <div class={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${index() === 0 ? 'bg-primary border-primary shadow-[0_0_10px_rgba(var(--p)/0.5)]' : 'bg-black border-white/20'}`}></div>
                                        <div class="flex flex-col gap-2">
                                            <div class="flex items-baseline justify-between">
                                                <span class={`text-sm font-bold ${index() === 0 ? 'text-primary' : 'text-white'}`}>v{log.version}</span>
                                                <span class="text-xs text-white/40 font-mono">{log.date}</span>
                                            </div>
                                            <ul class="flex flex-col gap-2 mt-1">
                                                <For each={log.changes}>
                                                    {(change) => (
                                                        <li class="text-xs text-white/70 leading-relaxed pl-2 border-l border-white/10 hover:border-white/30 transition-colors">
                                                            {change}
                                                        </li>
                                                    )}
                                                </For>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </For>
                        </div>
                    </div>
                    <div class="p-4 border-t border-white/10 shrink-0 bg-white/5">
                        <p class="text-[10px] text-center text-white/30">
                            Lofi Station © 2025
                        </p>
                    </div>
                </div>
            </div>
            <div
                class={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 ${isOpen() ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>
        </>
    );
};

export default Sidebar;
