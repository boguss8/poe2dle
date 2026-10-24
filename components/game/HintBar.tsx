import { guessesUntilHint, HINTS } from "@/lib/games/skill/hints";
import type { HintId } from "@/lib/games/skill/types";
import SkillIcon from "./SkillIcon";

type HintBarProps = {
  guessCount: number;
  revealed: readonly HintId[];
  letter: string | null;
  icon: string | null;
  onReveal: (hint: HintId) => void;
};

/**
 * Help that unlocks as the player misses: the skill's first letter after 3
 * guesses and its icon after 6. Nothing is shown until the player asks for it.
 */
export default function HintBar({
  guessCount,
  revealed,
  letter,
  icon,
  onReveal,
}: HintBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Hints" role="group">
      <span className="text-sm font-bold text-muted">Hints</span>
      {HINTS.map((hint) => {
        const isRevealed = revealed.includes(hint.id);
        const remaining = guessesUntilHint(hint.id, guessCount);

        if (isRevealed && hint.id === "letter" && letter) {
          return (
            <span key={hint.id} className="card-deep flex items-center gap-2 px-3 py-1">
              <span className="text-sm text-muted">Starts with</span>
              <span className="poe-caps text-2xl leading-none text-gem">{letter}</span>
            </span>
          );
        }
        if (isRevealed && hint.id === "icon" && icon) {
          return (
            <span key={hint.id} className="card-deep flex items-center gap-2 px-3 py-1">
              <span className="text-sm text-muted">Icon</span>
              <SkillIcon icon={icon} name="Hint: the skill's icon" size={44} />
            </span>
          );
        }

        const locked = remaining > 0;
        return (
          <button
            key={hint.id}
            type="button"
            disabled={locked}
            onClick={() => onReveal(hint.id)}
            className="btn btn-ghost !px-3 !py-1.5 !text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locked
              ? `${hint.label} · in ${remaining} ${remaining === 1 ? "guess" : "guesses"}`
              : `Reveal ${hint.label.toLowerCase()}`}
          </button>
        );
      })}
    </div>
  );
}
