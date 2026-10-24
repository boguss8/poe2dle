import { describe, expect, it } from "vitest";
import {
  applyGiveUp,
  applyGuess,
  applyHint,
  EMPTY_STATS,
  freshGame,
  visibleStreak,
} from "./progress";

const start = (day: number, stats = EMPTY_STATS) => ({
  game: freshGame(day),
  stats,
});

describe("applyGuess", () => {
  it("records wrong guesses without finishing", () => {
    const next = applyGuess(start(10), "a", "answer");
    expect(next.game).toEqual({
      day: 10,
      guesses: ["a"],
      status: "playing",
      hints: [],
    });
    expect(next.stats).toBe(EMPTY_STATS);
  });

  it("ignores repeated guesses", () => {
    const once = applyGuess(start(10), "a", "answer");
    expect(applyGuess(once, "a", "answer")).toBe(once);
  });

  it("wins on the right guess and updates stats", () => {
    const next = applyGuess(applyGuess(start(10), "a", "answer"), "answer", "answer");
    expect(next.game.status).toBe("won");
    expect(next.stats).toMatchObject({
      played: 1,
      won: 1,
      currentStreak: 1,
      maxStreak: 1,
      lastWonDay: 10,
      distribution: { "2": 1 },
    });
  });

  it("ignores guesses after the game ended", () => {
    const won = applyGuess(start(10), "answer", "answer");
    expect(applyGuess(won, "b", "answer")).toBe(won);
  });

  it("extends a streak on consecutive days and restarts it after a gap", () => {
    const day1 = applyGuess(start(10), "answer", "answer");
    const day2 = applyGuess(start(11, day1.stats), "answer", "answer");
    expect(day2.stats.currentStreak).toBe(2);
    expect(day2.stats.maxStreak).toBe(2);

    const day4 = applyGuess(start(14, day2.stats), "answer", "answer");
    expect(day4.stats.currentStreak).toBe(1);
    expect(day4.stats.maxStreak).toBe(2);
    expect(day4.stats.distribution).toEqual({ "1": 3 });
  });
});

describe("applyHint", () => {
  const afterGuesses = (count: number) => {
    let progress = start(10);
    for (let i = 0; i < count; i++) progress = applyGuess(progress, `g${i}`, "answer");
    return progress;
  };

  it("keeps hints locked until enough guesses were made", () => {
    const two = afterGuesses(2);
    expect(applyHint(two, "letter")).toBe(two);
    const three = afterGuesses(3);
    expect(applyHint(three, "letter").game.hints).toEqual(["letter"]);
    expect(applyHint(three, "icon")).toBe(three);
    expect(applyHint(afterGuesses(6), "icon").game.hints).toEqual(["icon"]);
  });

  it("reveals each hint once and keeps earlier ones", () => {
    const six = afterGuesses(6);
    const both = applyHint(applyHint(six, "letter"), "icon");
    expect(both.game.hints).toEqual(["letter", "icon"]);
    expect(applyHint(both, "letter")).toBe(both);
  });

  it("does not touch the guesses or the stats, and survives later guesses", () => {
    const revealed = applyHint(afterGuesses(3), "letter");
    expect(revealed.stats).toBe(EMPTY_STATS);
    expect(revealed.game.guesses).toHaveLength(3);
    expect(applyGuess(revealed, "g9", "answer").game.hints).toEqual(["letter"]);
  });

  it("is ignored once the game is over", () => {
    const over = applyGiveUp(afterGuesses(3));
    expect(applyHint(over, "letter")).toBe(over);
  });
});

describe("applyGiveUp", () => {
  it("counts as played, breaks the streak and keeps wins untouched", () => {
    const won = applyGuess(start(10), "answer", "answer");
    const gaveUp = applyGiveUp(start(11, won.stats));
    expect(gaveUp.game.status).toBe("gave_up");
    expect(gaveUp.stats).toMatchObject({
      played: 2,
      won: 1,
      currentStreak: 0,
      maxStreak: 1,
    });
  });

  it("does nothing once the game is over", () => {
    const won = applyGuess(start(10), "answer", "answer");
    expect(applyGiveUp(won)).toBe(won);
  });
});

describe("visibleStreak", () => {
  const stats = { ...EMPTY_STATS, currentStreak: 4, lastWonDay: 10 };
  it("shows the streak today and tomorrow, then lapses", () => {
    expect(visibleStreak(stats, 10)).toBe(4);
    expect(visibleStreak(stats, 11)).toBe(4);
    expect(visibleStreak(stats, 12)).toBe(0);
  });
});
