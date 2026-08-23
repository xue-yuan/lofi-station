export interface ThemeOption {
  id: string;
  name: string;
  color: string;
}

export const THEMES: ThemeOption[] = [
  { id: "black", name: "Original", color: "#000000" },
  { id: "luxury", name: "Classic", color: "#FFFFFF" },
  { id: "business", name: "Blue", color: "#1C4E80" },
  { id: "coffee", name: "Coffee", color: "#DB924B" },
  { id: "forest", name: "Forest", color: "#1EB854" },
  { id: "night", name: "Night", color: "#3ABFF8" },
  { id: "sunset", name: "Sunset", color: "#FF865B" },
  { id: "retro", name: "Retro", color: "#EF9995" },
  { id: "synthwave", name: "Synth", color: "#E779C1" },
  { id: "dark", name: "Daisy", color: "#7480ff" },
  { id: "dracula", name: "Dracula", color: "#FF79C6" },
  { id: "aqua", name: "Aqua", color: "#09ECF3" },
];

export const DEFAULT_THEME = "sunset";

export const isValidTheme = (id: string): boolean => THEMES.some((t) => t.id === id);
