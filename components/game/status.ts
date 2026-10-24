import type { MatchStatus } from "@/lib/games/skill/types";

/** How each match status looks (tile colour class, corner glyph) and reads to screen readers. */
export const STATUS: Record<MatchStatus, { tile: string; glyph: string; label: string }> = {
  correct: { tile: "tile-correct", glyph: "✓", label: "Correct" },
  partial: { tile: "tile-partial", glyph: "◐", label: "Partially correct" },
  wrong: { tile: "tile-wrong", glyph: "✕", label: "Incorrect" },
};
