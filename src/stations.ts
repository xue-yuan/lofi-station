import stationsData from "./stations.json";

export interface Channel {
  id: string;
  title: string;
  author: string;
  broken?: boolean;
}

export interface StationCategory {
  id: string;
  name: string;
  description: string;
  channels: Channel[];
}

export const STATION_CATEGORIES: StationCategory[] = stationsData as StationCategory[];

export const findCategory = (categoryId: string): StationCategory | undefined =>
  STATION_CATEGORIES.find((c) => c.id === categoryId);

export const findChannel = (
  channelId: string,
): { category: StationCategory; channel: Channel } | undefined => {
  for (const category of STATION_CATEGORIES) {
    const channel = category.channels.find((c) => c.id === channelId);
    if (channel) return { category, channel };
  }
  return undefined;
};
