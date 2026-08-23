import type { Component } from "solid-js";

interface LoadingOverlayProps {
  visible: boolean;
}

const LoadingOverlay: Component<LoadingOverlayProps> = (props) => {
  return (
    <div
      class={`fixed inset-0 z-[90] flex items-center justify-center bg-black transition-opacity duration-700 ${
        props.visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div class="flex flex-col items-center gap-5">
        <span class="loading loading-spinner w-10 h-10 text-primary" />
        <p class="text-white/80 text-sm font-light tracking-[0.3em] uppercase animate-pulse">
          Tuning in
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
