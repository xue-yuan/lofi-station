import { createSignal, type Component } from "solid-js";
import FloatingPanel, { type PanelTab } from "./FloatingPanel";
import PomodoroTimer from "./PomodoroTimer";
import TodoList from "./TodoList";
import NoteBlock from "./NoteBlock";

type WidgetTab = "timer" | "todo" | "notes";

const TABS: PanelTab[] = [
  { id: "timer", label: "Focus" },
  { id: "todo", label: "Tasks" },
  { id: "notes", label: "Notes" },
];

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WidgetPanel: Component<WidgetPanelProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal<WidgetTab>("timer");

  return (
    <FloatingPanel
      isOpen={props.isOpen}
      onClose={props.onClose}
      label="Widgets"
      activeTab={activeTab()}
      onSelectTab={(id) => setActiveTab(id as WidgetTab)}
      tabs={TABS}
      spawnOffset={{ x: -180, y: 0 }}
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8h16M4 16h16"
          />
        </svg>
      }
    >
      <div class={`h-full ${activeTab() === "timer" ? "block" : "hidden"}`}>
        <div class="p-4 h-full flex flex-col items-center justify-center">
          <PomodoroTimer />
        </div>
      </div>
      <div class={`h-full ${activeTab() === "todo" ? "block" : "hidden"}`}>
        <div class="p-4 h-full w-full flex flex-col">
          <TodoList />
        </div>
      </div>
      <div class={`h-full ${activeTab() === "notes" ? "block" : "hidden"}`}>
        <div class="p-4 h-full w-full flex flex-col">
          <NoteBlock />
        </div>
      </div>
    </FloatingPanel>
  );
};

export default WidgetPanel;
