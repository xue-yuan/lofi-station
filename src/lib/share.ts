import { buildShareUrl, type ShareState } from "./shareState";

export const syncAddressBar = (state: ShareState): void => {
  if (typeof window === "undefined" || !window.history?.replaceState) return;
  const url = buildShareUrl("", window.location.pathname, state);
  try {
    window.history.replaceState(window.history.state, "", url || window.location.pathname);
  } catch {}
};

export const currentShareUrl = (state: ShareState): string =>
  buildShareUrl(window.location.origin, window.location.pathname, state);

export type CopyResult = "copied" | "failed";

export const copyToClipboard = async (text: string): Promise<CopyResult> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {}

  try {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok ? "copied" : "failed";
  } catch {
    return "failed";
  }
};
