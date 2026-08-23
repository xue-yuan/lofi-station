import { clampNumber } from "./storage";

export type StageType = "focus" | "break" | "long-break";

export interface Stage {
  id: string;
  type: StageType;
  name: string;
  duration: number;
}

export const MIN_STAGE_MINUTES = 1;
export const MAX_STAGE_MINUTES = 120;

export const DEFAULT_DURATIONS: Record<StageType, number> = {
  focus: 25,
  break: 5,
  "long-break": 15,
};

export const createDefaultTimeline = (): Stage[] => [
  { id: "s1", type: "focus", name: "Focus", duration: 25 },
  { id: "s2", type: "break", name: "Short Break", duration: 5 },
  { id: "s3", type: "focus", name: "Focus", duration: 25 },
  { id: "s4", type: "break", name: "Short Break", duration: 5 },
  { id: "s5", type: "focus", name: "Focus", duration: 25 },
  { id: "s6", type: "long-break", name: "Long Break", duration: 15 },
];

const isStageType = (value: unknown): value is StageType =>
  value === "focus" || value === "break" || value === "long-break";

export const sanitiseStage = (value: unknown, index: number): Stage | null => {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Partial<Stage>;
  if (!isStageType(raw.type)) return null;

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : `s${index}-${Date.now()}`,
    type: raw.type,
    name: typeof raw.name === "string" && raw.name ? raw.name : raw.type,
    duration: clampNumber(
      raw.duration,
      MIN_STAGE_MINUTES,
      MAX_STAGE_MINUTES,
      DEFAULT_DURATIONS[raw.type],
    ),
  };
};

export const sanitiseTimeline = (value: unknown): Stage[] | null => {
  if (!Array.isArray(value)) return null;
  const stages = value
    .map((stage, i) => sanitiseStage(stage, i))
    .filter((stage): stage is Stage => stage !== null);
  return stages.length > 0 ? stages : null;
};

export const todayKey = (now: Date = new Date()): string => {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const remainingSeconds = (endsAt: number, now: number = Date.now()): number =>
  Math.max(0, Math.round((endsAt - now) / 1000));
