export const CATEGORY_SHORTCUT_LIMIT = 9;

export type ShortcutAction =
  | { type: "start" }
  | { type: "toggleMute" }
  | { type: "volumeUp" }
  | { type: "volumeDown" }
  | { type: "randomStation" }
  | { type: "randomChannel" }
  | { type: "toggleImmersive" }
  | { type: "toggleAmbientOnly" }
  | { type: "toggleShortcuts" }
  | { type: "closePanel" }
  | { type: "playCategory"; index: number };

export interface ShortcutContext {
  hasStarted: boolean;
}

interface KeyLike {
  key: string;
  code: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}

export const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable === true
  );
};

export const resolveShortcut = (e: KeyLike, context: ShortcutContext): ShortcutAction | null => {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;

  if (!context.hasStarted) {
    return e.code === "Space" ? { type: "start" } : null;
  }

  if (e.key === "?") return { type: "toggleShortcuts" };
  if (e.key === "Escape") return { type: "closePanel" };

  const digit = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
  if (digit) {
    return { type: "playCategory", index: Number(digit[1]) - 1 };
  }

  switch (e.code) {
    case "Space":
      return { type: "toggleMute" };
    case "ArrowUp":
      return { type: "volumeUp" };
    case "ArrowDown":
      return { type: "volumeDown" };
    case "KeyM":
      return { type: "randomStation" };
    case "KeyN":
      return { type: "randomChannel" };
    case "KeyF":
      return { type: "toggleImmersive" };
    case "KeyA":
      return { type: "toggleAmbientOnly" };
    default:
      return null;
  }
};

export const shouldPreventDefault = (action: ShortcutAction): boolean =>
  action.type === "start" ||
  action.type === "toggleMute" ||
  action.type === "volumeUp" ||
  action.type === "volumeDown";

export const VOLUME_STEP = 5;
