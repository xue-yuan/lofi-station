import { createSignal, onMount, For, type Component } from "solid-js";
import { readString, removeKey, writeString } from "../lib/storage";

const PAGES = [0, 1, 2];
const pageKey = (index: number) => `lofi_notes_page_${index}`;

const NoteBlock: Component = () => {
  const [activePage, setActivePage] = createSignal(0);
  const [notes, setNotes] = createSignal("");

  const loadPage = (pageIndex: number) => {
    setNotes(readString(pageKey(pageIndex)));
    setActivePage(pageIndex);
  };

  onMount(() => {
    const legacyNotes = readString("lofi_notes", "");
    if (legacyNotes) {
      if (!readString(pageKey(0))) writeString(pageKey(0), legacyNotes);
      removeKey("lofi_notes");
    }
    loadPage(0);
  });

  const handleInput = (e: InputEvent & { currentTarget: HTMLTextAreaElement }) => {
    const newValue = e.currentTarget.value;
    setNotes(newValue);
    writeString(pageKey(activePage()), newValue);
  };

  const handleClear = () => {
    setNotes("");
    writeString(pageKey(activePage()), "");
  };

  const handlePageChange = (index: number) => {
    if (index === activePage()) return;
    loadPage(index);
  };

  return (
    <div class="w-full flex flex-col">
      <div class="flex flex-col h-full">
        <div class="text-sm text-white/80 uppercase tracking-widest mb-2 flex justify-between items-center">
          <div
            class="flex items-center bg-white/5 rounded-lg p-0.5"
            role="tablist"
            aria-label="Note pages"
          >
            <For each={PAGES}>
              {(index) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activePage() === index}
                  aria-label={`Note page ${index + 1}`}
                  class={`btn btn-xs btn-circle border-none m-1 w-6 h-6 text-[10px] ${activePage() === index ? "bg-primary text-primary-content shadow-glow-sm" : "bg-transparent text-white/40 hover:text-white hover:bg-white/10"}`}
                  onClick={() => handlePageChange(index)}
                >
                  {index + 1}
                </button>
              )}
            </For>
          </div>
          <button
            type="button"
            class="btn btn-xs btn-ghost text-white/30 hover:text-white"
            onClick={handleClear}
            title="Clear Current Page"
            aria-label={`Clear note page ${activePage() + 1}`}
          >
            Clear
          </button>
        </div>
        <label class="sr-only" for="note-textarea">
          Notes for page {activePage() + 1}
        </label>
        <textarea
          id="note-textarea"
          class="textarea textarea-bordered bg-white/5 text-white placeholder-white/40 focus:outline-none focus:border-primary w-full flex-1 min-h-[250px] max-h-[340px] text-sm custom-scrollbar"
          placeholder={`Section ${activePage() + 1} - Type your thoughts here...`}
          value={notes()}
          onInput={handleInput}
        />
      </div>
    </div>
  );
};

export default NoteBlock;
