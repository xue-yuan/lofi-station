import { createSignal, createEffect, Show, onMount, onCleanup, type Component } from 'solid-js';
import { playerState, toggleMute, nextStation, prevStation, setVolume } from './stores/playerStore';
import YouTubePlayer from './components/YouTubePlayer';
import ControlPanel from './components/ControlPanel';
import PomodoroTimer from './components/PomodoroTimer';
import TodoList from './components/TodoList';
import AmbientMixer from './components/AmbientMixer';
import DigitalClock from './components/DigitalClock';
import NoteBlock from './components/NoteBlock';

const App: Component = () => {
  const [showTools, setShowTools] = createSignal(true);

  const [showPomodoro, setShowPomodoro] = createSignal(true);
  const [showTodo, setShowTodo] = createSignal(true);
  const [showNotes, setShowNotes] = createSignal(true);
  const [showAmbient, setShowAmbient] = createSignal(false);
  const [isIdle, setIsIdle] = createSignal(false);
  const [isImmersiveEnabled, setIsImmersiveEnabled] = createSignal(false);

  onMount(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);

      if (isImmersiveEnabled()) {
        idleTimer = setTimeout(() => {
          setIsIdle(true);
        }, 3000);
      }
    };

    createEffect(() => {
      if (isImmersiveEnabled()) {
        resetIdleTimer();
      } else {
        setIsIdle(false);
        clearTimeout(idleTimer);
      }
    });

    resetIdleTimer();

    const handleInput = () => {
      resetIdleTimer();
    };

    window.addEventListener('mousemove', handleInput);
    window.addEventListener('click', handleInput);
    const handleKeyDownWithShortcuts = (e: KeyboardEvent) => {
      handleInput();

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowRight':
          nextStation();
          break;
        case 'ArrowLeft':
          prevStation();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(100, playerState.volume + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, playerState.volume - 5));
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDownWithShortcuts);

    onCleanup(() => {
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('click', handleInput);
      window.removeEventListener('keydown', handleKeyDownWithShortcuts);
      clearTimeout(idleTimer);
    });
  });

  return (
    <div class="w-full h-full relative" data-theme="luxury">
      <YouTubePlayer />
      <div class={`absolute top-10 left-10 z-10 flex flex-col gap-6 transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <h1 class="text-4xl font-bold tracking-widest text-shadow opacity-90 bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          LOFI <span class="text-primary">STATION</span>
        </h1>
        <div class="hidden md:block"></div>
      </div>
      <div class={`fixed top-4 right-10 z-50 flex items-center gap-2 p-2 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-black/40 duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Show when={showTools()}>
          <div class={`flex items-center gap-1 border-r border-white/10 pr-2 mr-1`}>
            <a
              href="https://github.com/xue-yuan/lofi-station"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-circle btn-xs border-none mx-1 btn-ghost text-white/40 hover:text-white"
              title="View on GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
            <button
              class={`btn btn-circle btn-xs border-none mx-1 ${showPomodoro() ? 'btn-primary text-primary-content' : 'btn-ghost text-white/40'}`}
              onClick={() => setShowPomodoro(!showPomodoro())}
              title="Toggle Timer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button
              class={`btn btn-circle btn-xs border-none mx-1  ${showTodo() ? 'btn-secondary text-secondary-content' : 'btn-ghost text-white/40'}`}
              onClick={() => setShowTodo(!showTodo())}
              title="Toggle Tasks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </button>
            <button
              class={`btn btn-circle btn-xs border-none mx-1  ${showNotes() ? 'btn-accent text-accent-content' : 'btn-ghost text-white/40'}`}
              onClick={() => setShowNotes(!showNotes())}
              title="Toggle Notes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          </div>
        </Show>
        <button
          class="btn btn-circle btn-ghost btn-sm text-white"
          onClick={() => setShowTools(!showTools())}
          title={showTools() ? "Collapse Widgets" : "Expand Widgets"}
        >
          <Show when={showTools()} fallback={
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          }>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </Show>
        </button>
      </div>
      <div class={`absolute top-20 right-10 z-10 hidden md:flex flex-col gap-4 transition-all duration-300 ${showTools() ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
        <div class={`transition-all duration-300 ${showPomodoro() ? 'max-h-[500px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 overflow-hidden'}`}>
          <PomodoroTimer />
        </div>
        <div class={`transition-all duration-300 ${showTodo() ? 'max-h-[500px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 overflow-hidden'}`}>
          <TodoList />
        </div>
        <div class={`transition-all duration-300 ${showNotes() ? 'max-h-[500px] opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95 overflow-hidden'}`}>
          <NoteBlock />
        </div>
      </div>
      <div class={`fixed bottom-36 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 origin-bottom ${showAmbient() ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <AmbientMixer />
      </div>
      <div class={`absolute bottom-32 left-10 z-0 hidden lg:block hover:opacity-100 transition-opacity duration-1000 ${isIdle() ? 'opacity-0' : 'opacity-80'}`}>
        <DigitalClock />
      </div>
      <div class={`transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ControlPanel
          onToggleAmbient={() => setShowAmbient(!showAmbient())}
          isAmbientOpen={showAmbient()}
          isImmersive={isImmersiveEnabled()}
          onToggleImmersive={() => setIsImmersiveEnabled(!isImmersiveEnabled())}
        />
      </div>
    </div>
  );
};

export default App;
