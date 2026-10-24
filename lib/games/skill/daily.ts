import type { Skill } from "./types";

export const DAY_MS = 86_400_000;

/** First puzzle day (2026-10-24 UTC); puzzle #1. */
export const LAUNCH_DAY = Math.floor(Date.UTC(2026, 9, 24) / DAY_MS);

const SHUFFLE_SALT = 0x9e3779b9;

/** Whole days since the Unix epoch, in UTC. */
export function dayNumber(nowMs: number): number {
  return Math.floor(nowMs / DAY_MS);
}

export function puzzleNumber(day: number): number {
  return Math.max(1, day - LAUNCH_DAY + 1);
}

export function msUntilNextDay(nowMs: number): number {
  return (dayNumber(nowMs) + 1) * DAY_MS - nowMs;
}

/** Small deterministic PRNG so every client derives the same order. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const random = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * The skill for a given day. Each cycle visits every skill exactly once in a
 * seeded order, so nothing repeats until the whole pool has been used.
 */
export function answerForDay(day: number, skills: readonly Skill[]): Skill {
  if (skills.length === 0) throw new Error("Cannot pick an answer: empty pool");
  const sorted = [...skills].sort((a, b) => a.id.localeCompare(b.id));
  const offset = Math.max(0, day - LAUNCH_DAY);
  const cycle = Math.floor(offset / sorted.length);
  return shuffled(sorted, SHUFFLE_SALT + cycle)[offset % sorted.length];
}
