import type { Component } from 'solid-js';

const LoadingOverlay: Component = () => {
    return (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
            <div class="flex flex-col items-center gap-4">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="text-white text-lg font-light tracking-widest animate-pulse">TUNING IN...</p>
            </div>
        </div>
    );
};

export default LoadingOverlay;
