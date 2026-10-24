import { persistsProgress } from "@/lib/consent";
import { COOKIES } from "@/lib/cookieCatalog";
import { createPersistedStore } from "@/lib/persistedStore";
import { decodeGame, decodeStats, encodeGame, encodeStats, skillKey } from "./codec";
import { EMPTY_STATS } from "./progress";
import { SKILLS } from "./pool";
import type { SavedGame } from "./types";

const ID_BY_KEY: ReadonlyMap<string, string> = new Map(
  SKILLS.map((skill) => [skillKey(skill.id), skill.id]),
);

// Daily progress lives in first-party cookies. The lifetime depends on the
// player's cookie choice (see lib/consent.ts).

export const gameStore = createPersistedStore<SavedGame | null>({
  name: COOKIES.game.name,
  fallback: null,
  parse: (raw) => decodeGame(raw, ID_BY_KEY),
  serialize: (game) => (game ? encodeGame(game) : ""),
  persist: persistsProgress,
});

export const statsStore = createPersistedStore({
  name: COOKIES.stats.name,
  fallback: EMPTY_STATS,
  parse: decodeStats,
  serialize: encodeStats,
  persist: persistsProgress,
});

export const helpStore = createPersistedStore<boolean>({
  name: COOKIES.help.name,
  fallback: false,
  parse: (raw) => (raw === "1" ? true : null),
  serialize: (seen) => (seen ? "1" : "0"),
  persist: persistsProgress,
});
