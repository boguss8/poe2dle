import type { HintId } from "./types";

/** Hint ladder: each hint unlocks after this many guesses and is revealed on request. */
export const HINTS: readonly { id: HintId; label: string; unlocksAfter: number }[] = [
  { id: "letter", label: "First letter", unlocksAfter: 3 },
  { id: "icon", label: "Icon", unlocksAfter: 6 },
];

export function hintUnlocked(id: HintId, guessCount: number): boolean {
  const hint = HINTS.find((entry) => entry.id === id);
  return hint !== undefined && guessCount >= hint.unlocksAfter;
}

/** Guesses still needed before the hint can be revealed (0 when unlocked). */
export function guessesUntilHint(id: HintId, guessCount: number): number {
  const hint = HINTS.find((entry) => entry.id === id);
  return hint ? Math.max(0, hint.unlocksAfter - guessCount) : 0;
}
