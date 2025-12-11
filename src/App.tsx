import { createSignal, createEffect, Show, onMount, onCleanup, type Component } from 'solid-js';
import { playerState, toggleMute, setVolume, setPlayerState } from './stores/playerStore';
import YouTubePlayer from './components/YouTubePlayer';
import ControlPanel from './components/ControlPanel';
import WidgetPanel from './components/WidgetPanel';
import DigitalClock from './components/DigitalClock';
import WelcomeScreen from './components/WelcomeScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const App: Component = () => {
  const [activePanel, setActivePanel] = createSignal<'station' | 'ambient' | 'theme' | null>(null);
  const [isWidgetsOpen, setIsWidgetsOpen] = createSignal(false);
  const [isIdle, setIsIdle] = createSignal(false);
  const [isImmersiveEnabled, setIsImmersiveEnabled] = createSignal(false);

  const savedTheme = localStorage.getItem('lofi_theme') || 'luxury';
  const [activeTheme, setActiveTheme] = createSignal(savedTheme);
  const [hasStarted, setHasStarted] = createSignal(false);

  const handleStart = () => {
    setHasStarted(true);
    setPlayerState('isMuted', false);
    setPlayerState('isPlaying', true);
  };

  const togglePanel = (panel: 'station' | 'ambient' | 'theme') => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const toggleWidgets = () => setIsWidgetsOpen(prev => !prev);

  const handleThemeChange = (theme: string) => {
    setActiveTheme(theme);
    localStorage.setItem('lofi_theme', theme);
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
    <div class="w-full h-full relative" data-theme={activeTheme()}>
      <Show when={!hasStarted()}>
        <WelcomeScreen onStart={handleStart} />
      </Show>
      <div class={`transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <WidgetPanel
          isOpen={isWidgetsOpen()}
          onClose={() => setIsWidgetsOpen(false)}
        />
      </div>
      <div class={`transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100 z-[60] relative'}`}>
        <Sidebar />
      </div>
      <YouTubePlayer />
      <div class="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.8)_100%)]"></div>
      <div class={`absolute top-6 left-6 md:top-10 md:left-10 z-10 transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Header />
      </div>
      <div class={`absolute bottom-64 left-6 md:bottom-64 md:left-10 lg:bottom-32 z-10 transition-opacity duration-1000 ${isIdle() ? 'opacity-0' : 'opacity-80'}`}>
        <DigitalClock />
      </div>
      <div class={`transition-opacity duration-1000 ${isIdle() ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ControlPanel
          onToggleAmbient={() => togglePanel('ambient')}
          isAmbientOpen={activePanel() === 'ambient'}
          onCloseAmbient={() => setActivePanel(null)}

          isImmersive={isImmersiveEnabled()}
          onToggleImmersive={() => setIsImmersiveEnabled(!isImmersiveEnabled())}

          onToggleStationSelector={() => togglePanel('station')}
          isStationSelectorOpen={activePanel() === 'station'}
          onCloseStationSelector={() => setActivePanel(null)}

          onToggleWidgets={toggleWidgets}
          isWidgetsOpen={isWidgetsOpen()}
          onCloseWidgets={() => setIsWidgetsOpen(false)}

          onToggleTheme={() => togglePanel('theme')}
          isThemeOpen={activePanel() === 'theme'}
          onCloseTheme={() => setActivePanel(null)}
          activeTheme={activeTheme()}
          onSelectTheme={handleThemeChange}
        />
      </div>
    </div>
  );
};

export default App;
