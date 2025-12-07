import { createSignal, createEffect, type Component } from "solid-js";

const NoteBlock: Component = () => {
    const savedNotes = localStorage.getItem("lofi_notes") || "";
    const [notes, setNotes] = createSignal(savedNotes);

    createEffect(() => {
        localStorage.setItem("lofi_notes", notes());
    });

    return (
        <div class="card glass w-64 shadow-xl border border-white/10 flex flex-col">
            <div class="card-body p-4 flex flex-col h-full">
                <h2 class="card-title text-sm text-white/80 uppercase tracking-widest mb-2 flex justify-between items-center">
                    <span>Notes</span>
                    <button
                        class="btn btn-xs btn-ghost text-white/30 hover:text-white"
                        onClick={() => setNotes("")}
                        title="Clear Notes"
                    >
                        Clear
                    </button>
                </h2>
                <textarea
                    class="textarea textarea-bordered bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-primary w-full min-h-[150px] max-h-[250px] resize-y text-sm custom-scrollbar"
                    placeholder="Type your thoughts here..."
                    value={notes()}
                    onInput={(e) => setNotes(e.currentTarget.value)}
                ></textarea>
            </div>
        </div>
    );
};

export default NoteBlock;
