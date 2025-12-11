import { createSignal, onMount, onCleanup, type Component } from "solid-js";
import PomodoroTimer from "./PomodoroTimer";
import TodoList from "./TodoList";
import NoteBlock from "./NoteBlock";



type WidgetTab = 'timer' | 'todo' | 'notes';

interface WidgetPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const WidgetPanel: Component<WidgetPanelProps> = (props) => {
    const [activeTab, setActiveTab] = createSignal<WidgetTab>('timer');
    const [position, setPosition] = createSignal({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = createSignal(false);
    const [dragOffset, setDragOffset] = createSignal({ x: 0, y: 0 });

    onMount(() => {
        setPosition({ x: window.innerWidth - 420, y: 120 });
    });

    const startDrag = (e: MouseEvent) => {
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position().x, y: e.clientY - position().y });
    };

    const onDrag = (e: MouseEvent) => {
        if (isDragging()) {
            setPosition({ x: e.clientX - dragOffset().x, y: e.clientY - dragOffset().y });
        }
    };

    const stopDrag = () => {
        setIsDragging(false);
    };

    onMount(() => {
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
    });

    onCleanup(() => {
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);
    });

    return (
        <div
            class={`fixed z-50 transition-opacity duration-300 ${props.isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            style={{ left: `${position().x}px`, top: `${position().y}px` }}
        >
            <div class="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden w-[320px] shadow-2xl">
                <div
                    class="flex items-center p-2 bg-white/5 border-b border-white/5 pr-3 cursor-move select-none"
                    onMouseDown={startDrag}
                >
                    <div class="flex-1 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white/40 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                        <button
                            class={`btn btn-xs rounded-full px-3 mx-1 border-0 ${activeTab() === 'timer' ? 'bg-primary text-primary-content' : 'btn-ghost text-white/50 hover:text-white'}`}
                            onClick={(e) => { e.stopPropagation(); setActiveTab('timer'); }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <span class="text-[10px] font-bold uppercase tracking-wider">Focus</span>
                        </button>
                        <button
                            class={`btn btn-xs rounded-full px-3 mx-1 border-0 ${activeTab() === 'todo' ? 'bg-primary text-primary-content' : 'btn-ghost text-white/50 hover:text-white'}`}
                            onClick={(e) => { e.stopPropagation(); setActiveTab('todo'); }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <span class="text-[10px] font-bold uppercase tracking-wider">Tasks</span>
                        </button>
                        <button
                            class={`btn btn-xs rounded-full px-3 mx-1 border-0 ${activeTab() === 'notes' ? 'bg-primary text-primary-content' : 'btn-ghost text-white/50 hover:text-white'}`}
                            onClick={(e) => { e.stopPropagation(); setActiveTab('notes'); }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <span class="text-[10px] font-bold uppercase tracking-wider">Notes</span>
                        </button>
                    </div>
                    <div class="flex-1 flex justify-end">
                        <button
                            class="btn btn-xs btn-ghost btn-circle text-white/40 hover:text-white"
                            onClick={(e) => { e.stopPropagation(); props.onClose(); }}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <div class="relative h-[340px]">
                    <div class={`h-full transition-opacity duration-300 ${activeTab() === 'timer' ? 'block' : 'hidden'}`}>
                        <div class="p-4 h-full flex flex-col items-center justify-center">
                            <PomodoroTimer />
                        </div>
                    </div>
                    <div class={`h-full transition-opacity duration-300 ${activeTab() === 'todo' ? 'block' : 'hidden'}`}>
                        <div class="p-4 h-full w-full flex flex-col">
                            <TodoList />
                        </div>
                    </div>
                    <div class={`h-full transition-opacity duration-300 ${activeTab() === 'notes' ? 'block' : 'hidden'}`}>
                        <div class="p-4 h-full w-full flex flex-col">
                            <NoteBlock />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WidgetPanel;
