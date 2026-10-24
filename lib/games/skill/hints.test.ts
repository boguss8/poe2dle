import { describe, expect, it } from "vitest";
import { guessesUntilHint, hintUnlocked, HINTS } from "./hints";

describe("hint ladder", () => {
  it("unlocks the first letter after 3 guesses and the icon after 6", () => {
    expect(hintUnlocked("letter", 2)).toBe(false);
    expect(hintUnlocked("letter", 3)).toBe(true);
    expect(hintUnlocked("icon", 5)).toBe(false);
    expect(hintUnlocked("icon", 6)).toBe(true);
  });

  it("counts the guesses still needed", () => {
    expect(guessesUntilHint("letter", 0)).toBe(3);
    expect(guessesUntilHint("letter", 2)).toBe(1);
    expect(guessesUntilHint("icon", 4)).toBe(2);
    expect(guessesUntilHint("icon", 40)).toBe(0);
  });

  it("orders the ladder from the cheapest hint to the strongest", () => {
    const thresholds = HINTS.map((hint) => hint.unlocksAfter);
    expect(thresholds).toEqual([...thresholds].sort((a, b) => a - b));
  });
});
