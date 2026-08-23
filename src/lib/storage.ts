export const readString = (key: string, fallback = ""): string => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

export const writeString = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

export const removeKey = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {}
};

export const readJSON = <T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T => {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  if (raw === null) return fallback;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallback;
  }

  if (validate) return validate(parsed) ? parsed : fallback;
  return parsed as T;
};

export const writeJSON = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  if (value === "" || value === null || value === undefined) return fallback;

  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};
