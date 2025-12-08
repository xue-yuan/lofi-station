import type { Component } from 'solid-js';

interface WelcomeScreenProps {
    onStart: () => void;
}

const WelcomeScreen: Component<WelcomeScreenProps> = (props) => {
    return (
        <div
            class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-opacity duration-700"
            onClick={props.onStart}
        >
            <div class="text-center space-y-8 animate-fade-in-up">
                {/* Logo / Branding */}
                <div class="space-y-2">
                    <h1 class="text-6xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        LOFI
                    </h1>
                    <h1 class="text-6xl md:text-8xl font-black tracking-widest text-primary drop-shadow-[0_0_25px_rgba(var(--p),0.5)]">
                        RADIO
                    </h1>
                </div>

                <div class="pt-8">
                    <button
                        class="group relative px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                        <span class="text-xl font-light tracking-[0.2em] text-white/90 group-hover:text-white uppercase">
                            Click to Tune In
                        </span>

                        {/* Pulse Ring */}
                        <div class="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20"></div>
                    </button>
                </div>

                <p class="text-white/30 text-sm font-mono mt-8">
                    Focus • Relax • Code
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;
