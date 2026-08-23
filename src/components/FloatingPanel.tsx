import { createEffect, For, Show, onCleanup, type Component, type JSX } from "solid-js";
import { createDraggable } from "../lib/draggable";
import { createIsDesktop } from "../lib/mediaQuery";
import { createFocusTrapHandler } from "../lib/focusTrap";

export interface PanelTab {
  id: string;
  label: string;
}

interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  icon: JSX.Element;
  tabs: PanelTab[];
  activeTab: string;
  onSelectTab: (id: string) => void;
  spawnOffset?: { x: number; y: number };
  children: JSX.Element;
}

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 400;

const FloatingPanel: Component<FloatingPanelProps> = (props) => {
  const isDesktop = createIsDesktop();
  const drag = createDraggable({
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    isActive: () => props.isOpen && isDesktop(),
    get offset() {
      return props.spawnOffset;
    },
  });

  let containerRef: HTMLDivElement | undefined;
  let previouslyFocused: HTMLElement | null = null;

  const onKeyDown = createFocusTrapHandler(
    () => containerRef,
    () => props.onClose(),
  );

  createEffect(() => {
    if (!props.isOpen) return;

    previouslyFocused = document.activeElement as HTMLElement | null;
    queueMicrotask(() => containerRef?.focus());

    document.addEventListener("keydown", onKeyDown, true);
    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
      previouslyFocused = null;
    });
  });

  const positionStyle = (): JSX.CSSProperties =>
    isDesktop() ? { left: `${drag.position().x}px`, top: `${drag.position().y}px` } : {};

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="false"
      aria-label={props.label}
      aria-hidden={!props.isOpen}
      bool:inert={!props.isOpen}
      tabindex={-1}
      class={`fixed z-50 transition-opacity duration-300 outline-none ${
        props.isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      } inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto`}
      style={positionStyle()}
    >
      <div
        class={`bg-black/70 md:bg-black/50 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden w-full rounded-t-2xl md:w-[320px] md:rounded-2xl transition-transform duration-300 ${
          props.isOpen ? "translate-y-0" : "translate-y-full md:translate-y-0"
        }`}
      >
        <div
          class="flex items-center p-2 bg-white/5 border-b border-white/5 pr-3 select-none md:cursor-move"
          onMouseDown={drag.handleProps.onMouseDown}
          onTouchStart={drag.handleProps.onTouchStart}
        >
          <div class="flex-1 flex items-center pointer-events-none text-white/40">
            <Show
              when={isDesktop()}
              fallback={<div class="h-1 w-10 rounded-full bg-white/20 ml-1" />}
            >
              {props.icon}
            </Show>
          </div>
          <div
            class="flex-1 flex items-center justify-center"
            role="tablist"
            aria-label={props.label}
          >
            <For each={props.tabs}>
              {(tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={props.activeTab === tab.id}
                  class={`btn btn-xs rounded-full px-3 mx-1 border-0 ${
                    props.activeTab === tab.id
                      ? "bg-primary text-primary-content"
                      : "btn-ghost text-white/50 hover:text-white"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    props.onSelectTab(tab.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <span class="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                </button>
              )}
            </For>
          </div>
          <div class="flex-1 flex justify-end">
            <button
              type="button"
              class="btn btn-xs btn-ghost btn-circle text-white/40 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                props.onClose();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label={`Close ${props.label}`}
            >
              ✕
            </button>
          </div>
        </div>
        <div class="relative h-[60vh] max-h-[340px] md:h-[340px] md:max-h-none overflow-hidden">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default FloatingPanel;
