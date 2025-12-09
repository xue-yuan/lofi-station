import { createSignal, createEffect, Show, onMount, onCleanup, type Component } from 'solid-js';
import { playerState, toggleMute, setVolume, setPlayerState } from './stores/playerStore';
import YouTubePlayer from './components/YouTubePlayer';
import ControlPanel from './components/ControlPanel';
import WidgetPanel from './components/WidgetPanel';
import AmbientMixer from './components/AmbientMixer';
import DigitalClock from './components/DigitalClock';
import WelcomeScreen from './components/WelcomeScreen';
import StationSelector from './components/StationSelector';

const App: Component = () => {
  const [activePanel, setActivePanel] = createSignal<'station' | 'ambient' | 'widgets' | null>(null);
  const [isIdle, setIsIdle] = createSignal(false);
  const [isImmersiveEnabled, setIsImmersiveEnabled] = createSignal(false);

  const [hasStarted, setHasStarted] = createSignal(false);

  const handleStart = () => {
    setHasStarted(true);
    setPlayerState('isMuted', false);
    setPlayerState('isPlaying', true);
  };

  const togglePanel = (panel: 'station' | 'ambient' | 'widgets') => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

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
      <Show when={!hasStarted()}>
        <WelcomeScreen onStart={handleStart} />
      </Show>

      <YouTubePlayer />

      <div class={`absolute top-10 left-10 z-10 flex flex-col gap-6 transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <h1 class="text-4xl font-bold tracking-widest text-shadow opacity-90 bg-black/30 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          LOFI <span class="text-primary">RADIO</span>
        </h1>
        <div class="hidden md:block"></div>
      </div>

      <div class={`absolute top-10 right-10 z-10 transition-opacity duration-1000 ${isIdle() ? 'opacity-0' : 'opacity-80'}`}>
        <DigitalClock />
      </div>

      <div class={`transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <StationSelector
          isOpen={activePanel() === 'station'}
          onClose={() => setActivePanel(null)}
        />
        <AmbientMixer
          isOpen={activePanel() === 'ambient'}
          onClose={() => setActivePanel(null)}
        />
        <WidgetPanel
          isOpen={activePanel() === 'widgets'}
          onClose={() => setActivePanel(null)}
        />

        <ControlPanel
          onToggleAmbient={() => togglePanel('ambient')}
          isAmbientOpen={activePanel() === 'ambient'}
          isImmersive={isImmersiveEnabled()}
          onToggleImmersive={() => setIsImmersiveEnabled(!isImmersiveEnabled())}
          onToggleStationSelector={() => togglePanel('station')}
          isStationSelectorOpen={activePanel() === 'station'}
          onToggleWidgets={() => togglePanel('widgets')}
          isWidgetsOpen={activePanel() === 'widgets'}
        />
      </div>
    </div>
  );
};

export default App;
