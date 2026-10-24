"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { persistsProgress } from "@/lib/consent";
import { createPersistedStore } from "@/lib/persistedStore";
import { useToday } from "@/lib/useClock";
import { compareSkills } from "./compare";
import { decodeGame, decodeStats, encodeGame, encodeStats, skillKey } from "./codec";
import { answerForDay, puzzleNumber } from "./daily";
import { SKILLS, SKILL_BY_ID } from "./pool";
import {
  applyGiveUp,
  applyGuess,
  applyHint,
  EMPTY_STATS,
  freshGame,
  visibleStreak,
} from "./progress";
import type {
  GameStatus,
  GuessResult,
  HintId,
  SavedGame,
  Stats,
} from "./types";

const ID_BY_KEY: ReadonlyMap<string, string> = new Map(
  SKILLS.map((skill) => [skillKey(skill.id), skill.id]),
);

// Daily progress lives in first-party cookies. The lifetime depends on the
// player's cookie choice (see lib/consent.ts).
const gameStore = createPersistedStore<SavedGame | null>({
  name: "poe2dle_skill_game",
  fallback: null,
  parse: (raw) => decodeGame(raw, ID_BY_KEY),
  serialize: (game) => (game ? encodeGame(game) : ""),
  persist: persistsProgress,
});

const statsStore = createPersistedStore<Stats>({
  name: "poe2dle_skill_stats",
  fallback: EMPTY_STATS,
  parse: decodeStats,
  serialize: encodeStats,
  persist: persistsProgress,
});

const helpStore = createPersistedStore<boolean>({
  name: "poe2dle_help_seen",
  fallback: false,
  parse: (raw) => (raw === "1" ? true : null),
  serialize: (seen) => (seen ? "1" : "0"),
  persist: persistsProgress,
});

/** Whether the player has already seen the how-to-play dialog. */
export function useHelpSeen(): [seen: boolean, markSeen: () => void] {
  const seen = useSyncExternalStore(
    helpStore.subscribe,
    helpStore.getSnapshot,
    helpStore.getServerSnapshot,
  );
  return [seen, useCallback(() => helpStore.set(true), [])];
}

export type SkillGame = {
  puzzle: number;
  status: GameStatus;
  /** Newest guess first. */
  results: GuessResult[];
  guessedIds: ReadonlySet<string>;
  /** Only available once the game is over, so the answer is not rendered while playing. */
  answer: GuessResult["skill"] | null;
  /** Hints the player has revealed, with just the part of the answer each one shows. */
  hints: {
    revealed: readonly HintId[];
    letter: string | null;
    icon: string | null;
  };
  stats: Stats;
  streak: number;
  submit: (skillId: string) => void;
  revealHint: (hint: HintId) => void;
  giveUp: () => void;
};

/** Today's skill game, or null until the client knows the date. */
export function useSkillGame(): SkillGame | null {
  const today = useToday();
  const saved = useSyncExternalStore(
    gameStore.subscribe,
    gameStore.getSnapshot,
    gameStore.getServerSnapshot,
  );
  const stats = useSyncExternalStore(
    statsStore.subscribe,
    statsStore.getSnapshot,
    statsStore.getServerSnapshot,
  );

  const answer = useMemo(
    () => (today === null ? null : answerForDay(today, SKILLS)),
    [today],
  );

  const game = useMemo(
    () =>
      today === null
        ? null
        : saved && saved.day === today
          ? saved
          : freshGame(today),
    [saved, today],
  );

  const results = useMemo(() => {
    if (!game || !answer) return [];
    return game.guesses
      .flatMap((id) => SKILL_BY_ID.get(id) ?? [])
      .map((skill) => compareSkills(skill, answer))
      .reverse();
  }, [game, answer]);

  const guessedIds = useMemo(
    () => new Set(game?.guesses ?? []),
    [game],
  );

  const commit = useCallback(
    (update: (progress: { game: SavedGame; stats: Stats }) => {
      game: SavedGame;
      stats: Stats;
    }) => {
      if (!game) return;
      const next = update({ game, stats });
      if (next.game !== game) gameStore.set(next.game);
      if (next.stats !== stats) statsStore.set(next.stats);
    },
    [game, stats],
  );

  const submit = useCallback(
    (skillId: string) => {
      if (!answer || !SKILL_BY_ID.has(skillId)) return;
      commit((progress) => applyGuess(progress, skillId, answer.id));
    },
    [answer, commit],
  );

  const revealHint = useCallback(
    (hint: HintId) => commit((progress) => applyHint(progress, hint)),
    [commit],
  );

  const giveUp = useCallback(() => commit(applyGiveUp), [commit]);

  if (today === null || !game || !answer) return null;

  return {
    puzzle: puzzleNumber(today),
    status: game.status,
    results,
    guessedIds,
    answer: game.status === "playing" ? null : answer,
    hints: {
      revealed: game.hints,
      letter: game.hints.includes("letter")
        ? answer.name.charAt(0).toUpperCase()
        : null,
      icon: game.hints.includes("icon") ? answer.icon : null,
    },
    stats,
    streak: visibleStreak(stats, today),
    submit,
    revealHint,
    giveUp,
  };
}
