import { For, type Component } from "solid-js";
import FloatingPanel, { type PanelTab } from "./FloatingPanel";
import { STATION_CATEGORIES } from "../stations";
import { CATEGORY_SHORTCUT_LIMIT } from "../lib/shortcuts";

export type InfoTab = "community" | "shortcuts";

const TABS: PanelTab[] = [
  { id: "community", label: "Notice" },
  { id: "shortcuts", label: "Keys" },
];

export const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["Space"], label: "Mute / Unmute" },
  { keys: ["↑"], label: "Volume Up" },
  { keys: ["↓"], label: "Volume Down" },
  { keys: ["N"], label: "Random Channel" },
  { keys: ["M"], label: "Random Station" },
  { keys: ["F"], label: "Immersive Mode" },
  { keys: ["A"], label: "Ambient Only" },
  { keys: ["?"], label: "This Shortcut List" },
  { keys: ["Esc"], label: "Close Panel" },
];

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: InfoTab;
  onSelectTab: (tab: InfoTab) => void;
}

const InfoPanel: Component<InfoPanelProps> = (props) => {
  const shortcutCategories = () => STATION_CATEGORIES.slice(0, CATEGORY_SHORTCUT_LIMIT);

  return (
    <FloatingPanel
      isOpen={props.isOpen}
      onClose={props.onClose}
      label="Info and shortcuts"
      activeTab={props.activeTab}
      onSelectTab={(id) => props.onSelectTab(id as InfoTab)}
      tabs={TABS}
      spawnOffset={{ x: 180, y: 0 }}
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
    >
      <div class={`h-full ${props.activeTab === "community" ? "block" : "hidden"}`}>
        <div class="p-6 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar">
          <div class="space-y-4">
            <h3 class="text-xl font-bold text-white tracking-wide text-center">Community Notice</h3>
            <div class="text-white/70 text-sm leading-relaxed space-y-4">
              <p>
                Welcome to <strong>Lofi Radio</strong>! This project is open for community
                contributions.
              </p>
              <ul class="list-disc pl-5 space-y-2">
                <li>
                  Feel free to <strong>submit PRs</strong> to add your favorite channels or new
                  features.
                </li>
                <li>
                  Let me know if you spot any <strong>broken channels</strong> or bugs.
                </li>
              </ul>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/10 text-center">
            <p class="text-white/50 text-xs">Let's build the best chill space together.</p>
          </div>
        </div>
      </div>

      <div class={`h-full ${props.activeTab === "shortcuts" ? "block" : "hidden"}`}>
        <div class="p-6 h-full overflow-y-auto custom-scrollbar">
          <h3 class="text-xl font-bold text-white tracking-wide text-center mb-6">
            Keyboard Shortcuts
          </h3>
          <div class="space-y-3">
            <For each={SHORTCUTS}>
              {(shortcut) => (
                <div class="flex items-center justify-between gap-3">
                  <span class="text-white/70 text-sm">{shortcut.label}</span>
                  <span class="flex gap-1 shrink-0">
                    <For each={shortcut.keys}>
                      {(key) => <kbd class="kbd kbd-sm text-xs">{key}</kbd>}
                    </For>
                  </span>
                </div>
              )}
            </For>
          </div>

          <h4 class="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-6 mb-3">
            Jump to Station
          </h4>
          <div class="space-y-2">
            <For each={shortcutCategories()}>
              {(category, i) => (
                <div class="flex items-center justify-between gap-3">
                  <span class="text-white/70 text-sm truncate">{category.name}</span>
                  <kbd class="kbd kbd-sm text-xs shrink-0">{i() + 1}</kbd>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
};

export default InfoPanel;
