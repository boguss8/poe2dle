"use client";

import { useEffect, useState } from "react";
import SkillTooltipCard from "@/components/tooltip/SkillTooltipCard";
import { msUntilNextDay } from "@/lib/games/skill/daily";
import { ensureDetailsLoaded, useSkillDetails } from "@/lib/games/skill/details";
import { shareText } from "@/lib/games/skill/share";
import type { GameStatus, GuessResult, Skill } from "@/lib/games/skill/types";
import { useSeconds } from "@/lib/useClock";
import SkillIcon from "./SkillIcon";

function Countdown() {
  const seconds = useSeconds();
  if (seconds === null) return null;
  const left = Math.floor(msUntilNextDay(seconds * 1000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="font-bold tabular-nums text-foreground">
      {pad(Math.floor(left / 3600))}:{pad(Math.floor((left % 3600) / 60))}:
      {pad(left % 60)}
    </span>
  );
}

type EndPanelProps = {
  puzzle: number;
  status: Exclude<GameStatus, "playing">;
  answer: Skill;
  results: GuessResult[];
  hintsUsed: number;
  onShowStats: () => void;
  /** Delay before the panel fades in, so the last row can finish flipping. */
  revealDelayMs: number;
};

/** The answer, laid out like the in-game item tooltip. */
export default function EndPanel({
  puzzle,
  status,
  answer,
  results,
  hintsUsed,
  onShowStats,
  revealDelayMs,
}: EndPanelProps) {
  const [copied, setCopied] = useState(false);
  const details = useSkillDetails(answer.id);
  const count = results.length;
  const guesses = `${count} ${count === 1 ? "guess" : "guesses"}`;

  useEffect(() => {
    ensureDetailsLoaded();
  }, []);

  const share = async () => {
    const text = shareText(puzzle, status, results, window.location.origin, hintsUsed);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy your result:", text);
    }
  };

  return (
    <section
      aria-live="polite"
      className="card animate-fade-up px-4 py-5 text-center"
      style={{ animationDelay: `${revealDelayMs}ms` }}
    >
      <h2 className="text-2xl font-bold text-heading">
        {status === "won" ? "You found it!" : "Better luck tomorrow"}
      </h2>
      <p className="mt-1 text-muted">
        {status === "won" ? `Solved in ${guesses}.` : `Given up after ${guesses}.`}{" "}
        The skill was:
      </p>

      <div className="mt-5 flex justify-center">
        <div className="rounded-2xl bg-black/40 p-3 shadow-[0_0_48px_rgb(200_164_92/0.28)]">
          <SkillIcon icon={answer.icon} name={answer.name} size={128} />
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <SkillTooltipCard skill={answer} details={details} showMetadata={false} />
      </div>

      <div className="mx-auto mt-5 flex max-w-md flex-col gap-2">
        <button type="button" onClick={share} className="btn w-full">
          {copied ? "Copied!" : "Share result"}
        </button>
        <button type="button" onClick={onShowStats} className="btn btn-ghost w-full">
          Statistics
        </button>
      </div>
      <p className="mt-4 text-sm text-muted">
        Next skill in <Countdown />
      </p>
    </section>
  );
}
