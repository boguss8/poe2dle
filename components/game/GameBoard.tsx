"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HowToPlayModal from "@/components/modals/HowToPlayModal";
import StatsModal from "@/components/modals/StatsModal";
import InputField from "@/components/search/InputField";
import { useHelpSeen, useSkillGame } from "@/lib/games/skill/useSkillGame";
import Confetti from "./Confetti";
import EndPanel from "./EndPanel";
import HintBar from "./HintBar";
import ResultsTable, { ROW_REVEAL_MS } from "./ResultsTable";

/** The whole skill game page: header, board, dialogs and footer. */
export default function GameBoard() {
  const game = useSkillGame();
  const [helpSeen, markHelpSeen] = useHelpSeen();
  const [helpRequested, setHelpRequested] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [confirmingGiveUp, setConfirmingGiveUp] = useState(false);

  const header = (
    <Header
      activeGameId="skill"
      onHelp={() => setHelpRequested(true)}
      onStats={() => setStatsOpen(true)}
    />
  );

  if (!game) {
    return (
      <>
        {header}
        <main
          aria-label="Loading today's puzzle"
          className="mx-auto w-full max-w-6xl flex-1 animate-pulse space-y-4 px-3 py-5"
        >
          <div className="card h-32" />
          <div className="card-deep h-40" />
        </main>
        <Footer />
      </>
    );
  }

  const { status, results, answer, stats } = game;
  const justWon = status === "won" && results[0]?.skill.id === freshId;
  const helpOpen = helpRequested || !helpSeen;

  return (
    <>
      {header}
      {/* Only for a win made in this visit, not when an old win is restored from the cookie. */}
      {justWon ? <Confetti delayMs={ROW_REVEAL_MS} /> : null}
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-3 py-5">
        {status === "playing" ? (
          <section aria-label="Guess today's skill" className="card space-y-3 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="text-lg font-bold text-heading">Guess today&apos;s skill gem</h2>
              <p className="text-sm text-muted">
                Puzzle #{game.puzzle} · {results.length}{" "}
                {results.length === 1 ? "guess" : "guesses"}
                {game.streak > 0 ? ` · ${game.streak} day streak` : ""}
              </p>
            </div>
            <InputField
              guessedIds={game.guessedIds}
              onGuess={(skill) => {
                setFreshId(skill.id);
                game.submit(skill.id);
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
              <HintBar
                guessCount={results.length}
                revealed={game.hints.revealed}
                letter={game.hints.letter}
                icon={game.hints.icon}
                onReveal={game.revealHint}
              />
              {confirmingGiveUp ? (
                <span className="flex flex-wrap items-center justify-end gap-x-3 text-muted">
                  Reveal the answer and end today&apos;s game?
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingGiveUp(false);
                      game.giveUp();
                    }}
                    className="link font-bold !text-attr-str"
                  >
                    Yes, give up
                  </button>
                  <button type="button" onClick={() => setConfirmingGiveUp(false)} className="link">
                    Keep playing
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setConfirmingGiveUp(true)} className="link text-muted">
                  Stuck? Give up
                </button>
              )}
            </div>
          </section>
        ) : answer ? (
          <EndPanel
            puzzle={game.puzzle}
            status={status}
            answer={answer}
            results={results}
            hintsUsed={game.hints.revealed.length}
            onShowStats={() => setStatsOpen(true)}
            revealDelayMs={justWon ? ROW_REVEAL_MS : 0}
          />
        ) : null}

        <ResultsTable results={results} freshId={freshId} />
      </main>
      <Footer />

      <HowToPlayModal
        open={helpOpen}
        onClose={() => {
          setHelpRequested(false);
          markHelpSeen();
        }}
      />
      <StatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        stats={stats}
        streak={game.streak}
      />
    </>
  );
}
