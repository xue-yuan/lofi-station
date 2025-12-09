import { createSignal, type Component } from "solid-js";
import PomodoroTimer from "./PomodoroTimer";
import TodoList from "./TodoList";
import NoteBlock from "./NoteBlock";

const TimerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
);

const NoteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

type WidgetTab = 'timer' | 'todo' | 'notes';

interface WidgetPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const WidgetPanel: Component<WidgetPanelProps> = (props) => {
    const [activeTab, setActiveTab] = createSignal<WidgetTab>('timer');

    return (
        <div
            class={`fixed bottom-36 left-8 z-40 transition-all duration-300 origin-bottom-left ${props.isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
        >
            <div class="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden w-[380px] shadow-2xl transition-all duration-300">
                <div class="flex items-center p-2 bg-white/5 border-b border-white/5 pr-3">
                    <div class="flex-1 flex items-center">
                        <button
                            class={`flex-1 btn btn-sm border-0 ${activeTab() === 'timer' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'btn-ghost text-white/50 hover:text-white'}`}
                            onClick={() => setActiveTab('timer')}
                        >
                            <TimerIcon />
                            <span class="text-xs">Focus</span>
                        </button>
                        <div class="w-[1px] h-4 bg-white/10 mx-1"></div>
                        <button
                            class={`flex-1 btn btn-sm border-0 ${activeTab() === 'todo' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'btn-ghost text-white/50 hover:text-white'}`}
                            onClick={() => setActiveTab('todo')}
                        >
                            <ListIcon />
                            <span class="text-xs">Tasks</span>
                        </button>
                        <div class="w-[1px] h-4 bg-white/10 mx-1"></div>
                        <button
                            class={`flex-1 btn btn-sm border-0 ${activeTab() === 'notes' ? 'bg-primary/20 text-primary shadow-glow-sm' : 'btn-ghost text-white/50 hover:text-white'}`}
                            onClick={() => setActiveTab('notes')}
                        >
                            <NoteIcon />
                            <span class="text-xs">Notes</span>
                        </button>
                    </div>
                    <div class="w-[1px] h-4 bg-white/10 mx-2"></div>
                    <button class="btn btn-xs btn-ghost btn-circle text-white/40 hover:text-white" onClick={props.onClose}>✕</button>
                </div>

                <div class="relative min-h-[300px]">
                    <div class={`transition-opacity duration-300 ${activeTab() === 'timer' ? 'block' : 'hidden'}`}>
                        <div class="p-6 flex flex-col items-center justify-center min-h-[300px]">
                            <PomodoroTimer />
                        </div>
                    </div>
                    <div class={`transition-opacity duration-300 ${activeTab() === 'todo' ? 'block' : 'hidden'}`}>
                        <div class="p-6 w-full flex flex-col items-center">
                            <TodoList />
                        </div>
                    </div>
                    <div class={`transition-opacity duration-300 ${activeTab() === 'notes' ? 'block' : 'hidden'}`}>
                        <div class="p-6 w-full flex flex-col items-center">
                            <NoteBlock />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WidgetPanel;
