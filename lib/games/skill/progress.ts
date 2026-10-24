import { hintUnlocked } from "./hints";
import type { GameStatus, HintId, SavedGame, Stats } from "./types";

export const EMPTY_STATS: Stats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastWonDay: null,
  distribution: {},
};

export function freshGame(day: number): SavedGame {
  return { day, guesses: [], status: "playing", hints: [] };
}

/** Streak as shown to the player: it lapses if yesterday was not won. */
export function visibleStreak(stats: Stats, today: number): number {
  return stats.lastWonDay !== null && stats.lastWonDay >= today - 1
    ? stats.currentStreak
    : 0;
}

function finish(game: SavedGame, stats: Stats, status: GameStatus): Stats {
  if (status === "gave_up") {
    return { ...stats, played: stats.played + 1, currentStreak: 0 };
  }

  const continues = stats.lastWonDay === game.day - 1;
  const currentStreak = continues ? stats.currentStreak + 1 : 1;
  const tries = String(game.guesses.length);
  return {
    played: stats.played + 1,
    won: stats.won + 1,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastWonDay: game.day,
    distribution: {
      ...stats.distribution,
      [tries]: (stats.distribution[tries] ?? 0) + 1,
    },
  };
}

type Progress = { game: SavedGame; stats: Stats };

/** Record a guess. Ignored once the game is over or for repeated guesses. */
export function applyGuess(
  progress: Progress,
  skillId: string,
  answerId: string,
): Progress {
  const { game, stats } = progress;
  if (game.status !== "playing" || game.guesses.includes(skillId)) {
    return progress;
  }
  const guessed: SavedGame = {
    ...game,
    guesses: [...game.guesses, skillId],
  };
  if (skillId !== answerId) return { game: guessed, stats };

  const next: SavedGame = { ...guessed, status: "won" };
  return { game: next, stats: finish(next, stats, "won") };
}

/** Reveal a hint. Ignored while it is still locked, already revealed, or the game is over. */
export function applyHint(progress: Progress, hint: HintId): Progress {
  const { game, stats } = progress;
  if (
    game.status !== "playing" ||
    game.hints.includes(hint) ||
    !hintUnlocked(hint, game.guesses.length)
  ) {
    return progress;
  }
  return { game: { ...game, hints: [...game.hints, hint] }, stats };
}

export function applyGiveUp(progress: Progress): Progress {
  const { game, stats } = progress;
  if (game.status !== "playing") return progress;
  const next: SavedGame = { ...game, status: "gave_up" };
  return { game: next, stats: finish(next, stats, "gave_up") };
}
