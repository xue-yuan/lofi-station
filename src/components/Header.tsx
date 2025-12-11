import { createSignal, onMount, type Component } from "solid-js";
import { DAILY_QUOTES, type Quote } from "../quotes";

const Header: Component = () => {
    const [quote, setQuote] = createSignal<Quote | null>(null);

    onMount(() => {
        const randomQuote = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
        setQuote(randomQuote);
    });

    return (
        <div class="flex flex-col gap-2 p-4">
            <h1 class="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/80 to-white/20 drop-shadow-sm select-none">
                LOFI<span class="text-primary ml-2">RADIO</span>
            </h1>

            {quote() && (
                <div class="flex flex-col gap-1 max-w-md animate-fade-in-up">
                    <p class="text-sm font-light text-white/70 italic tracking-wide leading-relaxed">
                        "{quote()?.text}"
                    </p>
                    <span class="text-[10px] font-bold text-primary/60 uppercase tracking-widest self-start">
                        — {quote()?.author}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Header;
