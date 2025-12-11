import { createSignal, onMount, For, type Component } from "solid-js";

const NoteBlock: Component = () => {
    const [activePage, setActivePage] = createSignal(0);
    const [notes, setNotes] = createSignal("");

    onMount(() => {
        const legacyNotes = localStorage.getItem("lofi_notes");
        if (legacyNotes !== null) {
            if (!localStorage.getItem("lofi_notes_page_0")) {
                localStorage.setItem("lofi_notes_page_0", legacyNotes);
            }
            localStorage.removeItem("lofi_notes");
        }

        loadPage(0);
    });

    const loadPage = (pageIndex: number) => {
        const saved = localStorage.getItem(`lofi_notes_page_${pageIndex}`) || "";
        setNotes(saved);
        setActivePage(pageIndex);
    };

    const handleInput = (e: InputEvent & { currentTarget: HTMLTextAreaElement }) => {
        const newValue = e.currentTarget.value;
        setNotes(newValue);
        localStorage.setItem(`lofi_notes_page_${activePage()}`, newValue);
    };

    const handleClear = () => {
        setNotes("");
        localStorage.setItem(`lofi_notes_page_${activePage()}`, "");
    };

    const handlePageChange = (index: number) => {
        if (index === activePage()) return;
        loadPage(index);
    };

    return (
        <div class="w-full flex flex-col">
            <div class="flex flex-col h-full">
                <h2 class="card-title text-sm text-white/80 uppercase tracking-widest mb-2 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <div class="flex items-center bg-white/5 rounded-lg p-0.5">
                            <For each={[0, 1, 2]}>
                                {(index) => (
                                    <button
                                        class={`btn btn-xs btn-circle border-none m-1 w-6 h-6 text-[10px] ${activePage() === index ? 'bg-primary text-primary-content shadow-glow-sm' : 'bg-transparent text-white/40 hover:text-white hover:bg-white/10'}`}
                                        onClick={() => handlePageChange(index)}
                                    >
                                        {index + 1}
                                    </button>
                                )}
                            </For>
                        </div>
                    </div>
                    <button
                        class="btn btn-xs btn-ghost text-white/30 hover:text-white"
                        onClick={handleClear}
                        title="Clear Current Page"
                    >
                        Clear
                    </button>
                </h2>
                <textarea
                    class="textarea textarea-bordered bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-primary w-full flex-1 min-h-[250px] max-h-[340px] resize-y  text-sm custom-scrollbar"
                    placeholder={`Section ${activePage() + 1} - Type your thoughts here...`}
                    value={notes()}
                    onInput={handleInput}
                ></textarea>
            </div>
        </div>
    );
};

export default NoteBlock;
