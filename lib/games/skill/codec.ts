import type { GameStatus, HintId, SavedGame, Stats } from "./types";

/*
 * Compact, cookie-safe encodings. Cookie values must avoid spaces, commas,
 * semicolons and quotes, and every byte is sent with each request, so ids are
 * stored as short hashes instead of full "Metadata/Items/Gem/..." paths.
 */

/** Short stable key for a skill id (32-bit FNV-1a in base 36). */
export function skillKey(id: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

const STATUS_CODE: Record<GameStatus, string> = {
  playing: "p",
  won: "w",
  gave_up: "g",
};
const CODE_STATUS = new Map(
  Object.entries(STATUS_CODE).map(([status, code]) => [code, status as GameStatus]),
);

const isCount = (text: string) => /^\d{1,9}$/.test(text);

const HINT_CODE: Record<HintId, string> = { letter: "l", icon: "i" };
const CODE_HINT = new Map(
  Object.entries(HINT_CODE).map(([hint, code]) => [code, hint as HintId]),
);

/** `day.status.key-key-key.hints` (hints: one letter per revealed hint, may be empty) */
export function encodeGame(game: SavedGame): string {
  return [
    game.day,
    STATUS_CODE[game.status],
    game.guesses.map(skillKey).join("-"),
    game.hints.map((hint) => HINT_CODE[hint]).join(""),
  ].join(".");
}

/** Inverse of `encodeGame`; keys that no longer match a known skill are dropped. */
export function decodeGame(
  raw: string,
  idByKey: ReadonlyMap<string, string>,
): SavedGame | null {
  const parts = raw.split(".");
  // Cookies written before hints existed have three parts.
  if ((parts.length !== 3 && parts.length !== 4) || !isCount(parts[0])) {
    return null;
  }
  const status = CODE_STATUS.get(parts[1]);
  if (!status) return null;
  const guesses: string[] = [];
  for (const key of parts[2].split("-")) {
    const id = idByKey.get(key);
    if (id && !guesses.includes(id)) guesses.push(id);
  }
  const hints: HintId[] = [];
  for (const code of parts[3] ?? "") {
    const hint = CODE_HINT.get(code);
    if (hint && !hints.includes(hint)) hints.push(hint);
  }
  return { day: Number(parts[0]), guesses, status, hints };
}

/** `played.won.streak.best.lastWonDay.guesses:wins_guesses:wins` */
export function encodeStats(stats: Stats): string {
  const distribution = Object.entries(stats.distribution)
    .map(([guesses, wins]) => `${guesses}:${wins}`)
    .join("_");
  return [
    stats.played,
    stats.won,
    stats.currentStreak,
    stats.maxStreak,
    stats.lastWonDay ?? "",
    distribution,
  ].join(".");
}

export function decodeStats(raw: string): Stats | null {
  const parts = raw.split(".");
  if (parts.length !== 6) return null;
  const [played, won, currentStreak, maxStreak, lastWonDay, distribution] = parts;
  if (![played, won, currentStreak, maxStreak].every(isCount)) return null;
  if (lastWonDay !== "" && !isCount(lastWonDay)) return null;

  const wins: Record<string, number> = {};
  if (distribution !== "") {
    for (const entry of distribution.split("_")) {
      const [guesses, count, ...rest] = entry.split(":");
      if (rest.length > 0 || !isCount(guesses) || !isCount(count ?? "")) {
        return null;
      }
      wins[guesses] = Number(count);
    }
  }
  return {
    played: Number(played),
    won: Number(won),
    currentStreak: Number(currentStreak),
    maxStreak: Number(maxStreak),
    lastWonDay: lastWonDay === "" ? null : Number(lastWonDay),
    distribution: wins,
  };
}
