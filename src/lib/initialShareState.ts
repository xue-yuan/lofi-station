import { findCategory, findChannel } from "../stations";
import { SOUND_IDS } from "../ambient";
import { isValidTheme } from "../themes";
import { parseShareState, type ShareState } from "./shareState";

export const initialShareState: ShareState =
  typeof window === "undefined"
    ? {}
    : parseShareState(window.location.search, {
        isValidStation: (id) => findCategory(id) !== undefined,
        isValidChannel: (id) => findChannel(id) !== undefined,
        isValidTheme,
        isValidSound: (id) => SOUND_IDS.includes(id),
      });
