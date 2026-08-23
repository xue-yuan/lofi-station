export const SHARE_PARAMS = {
  station: "station",
  channel: "channel",
  theme: "theme",
  ambient: "ambient",
} as const;

export interface ShareState {
  stationId?: string;
  channelId?: string;
  theme?: string;
  ambient?: Record<string, number>;
}

export interface ParseOptions {
  isValidStation: (id: string) => boolean;
  isValidChannel: (id: string) => boolean;
  isValidTheme: (id: string) => boolean;
  isValidSound: (id: string) => boolean;
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

const parseAmbient = (
  raw: string,
  isValidSound: (id: string) => boolean,
): Record<string, number> | undefined => {
  const mix: Record<string, number> = {};

  for (const pair of raw.split(",")) {
    const [id, rawLevel] = pair.split(":");
    if (!id || rawLevel === undefined) continue;
    if (!ID_PATTERN.test(id) || !isValidSound(id)) continue;

    const percent = Number(rawLevel);
    if (!Number.isFinite(percent)) continue;

    mix[id] = Math.min(1, Math.max(0, percent / 100));
  }

  return Object.keys(mix).length > 0 ? mix : undefined;
};

export const parseShareState = (search: string, options: ParseOptions): ShareState => {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return {};
  }

  const state: ShareState = {};

  const station = params.get(SHARE_PARAMS.station);
  if (station && ID_PATTERN.test(station) && options.isValidStation(station)) {
    state.stationId = station;
  }

  const channel = params.get(SHARE_PARAMS.channel);
  if (channel && ID_PATTERN.test(channel) && options.isValidChannel(channel)) {
    state.channelId = channel;
  }

  const theme = params.get(SHARE_PARAMS.theme);
  if (theme && ID_PATTERN.test(theme) && options.isValidTheme(theme)) {
    state.theme = theme;
  }

  const ambient = params.get(SHARE_PARAMS.ambient);
  if (ambient) {
    const mix = parseAmbient(ambient, options.isValidSound);
    if (mix) state.ambient = mix;
  }

  return state;
};

const serialiseAmbient = (mix: Record<string, number>): string =>
  Object.entries(mix)
    .filter(([, level]) => level > 0)
    .map(([id, level]) => `${id}:${Math.round(level * 100)}`)
    .join(",");

export const buildShareQuery = (state: ShareState): string => {
  const params = new URLSearchParams();

  if (state.stationId) params.set(SHARE_PARAMS.station, state.stationId);
  if (state.channelId) params.set(SHARE_PARAMS.channel, state.channelId);
  if (state.theme) params.set(SHARE_PARAMS.theme, state.theme);

  if (state.ambient) {
    const ambient = serialiseAmbient(state.ambient);
    if (ambient) params.set(SHARE_PARAMS.ambient, ambient);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const buildShareUrl = (origin: string, pathname: string, state: ShareState): string =>
  `${origin}${pathname}${buildShareQuery(state)}`;
