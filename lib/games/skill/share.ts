import type { GameStatus, GuessResult, MatchStatus, NumberCell } from "./types";

const SQUARE: Record<MatchStatus, string> = {
  correct: "🟩",
  partial: "🟨",
  wrong: "🟥",
};

function numeric(cell: NumberCell): string {
  return cell.direction === "higher"
    ? "⬆️"
    : cell.direction === "lower"
      ? "⬇️"
      : SQUARE.correct;
}

function row(result: GuessResult): string {
  return [
    SQUARE[result.category.status],
    SQUARE[result.attributes.status],
    SQUARE[result.sources.status],
    SQUARE[result.damage.status],
    SQUARE[result.delivery.status],
    numeric(result.tier),
    numeric(result.mana),
    numeric(result.castTime),
    numeric(result.version),
    SQUARE[result.mechanics.status],
  ].join("");
}

/** Spoiler-free emoji summary; `results` is newest first, as the UI holds it. */
export function shareText(
  puzzle: number,
  status: GameStatus,
  results: readonly GuessResult[],
  url: string,
  hintsUsed = 0,
): string {
  const count = results.length;
  const headline =
    status === "won"
      ? `PoE2dle Skill #${puzzle} — solved in ${count} ${count === 1 ? "guess" : "guesses"}`
      : `PoE2dle Skill #${puzzle} — gave up after ${count}`;
  const hints = hintsUsed > 0 ? ` 💡${hintsUsed}` : "";
  const rows = [...results].reverse().map(row);
  return [`${headline}${hints}`, "", ...rows, "", url].join("\n");
}
