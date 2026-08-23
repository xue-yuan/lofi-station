import { createSignal, onCleanup, type Accessor } from "solid-js";

export const createMediaQuery = (query: string): Accessor<boolean> => {
  if (typeof window === "undefined" || !window.matchMedia) return () => false;

  const list = window.matchMedia(query);
  const [matches, setMatches] = createSignal(list.matches);

  const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
  list.addEventListener("change", onChange);
  onCleanup(() => list.removeEventListener("change", onChange));

  return matches;
};

export const createIsDesktop = () => createMediaQuery("(min-width: 768px)");
