import { describe, expect, it } from "vitest";
import {
  answerForDay,
  DAY_MS,
  dayNumber,
  LAUNCH_DAY,
  msUntilNextDay,
  puzzleNumber,
} from "./daily";
import { makeSkill } from "./fixtures";

const pool = Array.from({ length: 12 }, (_, i) =>
  makeSkill({ id: `skill-${i}`, name: `Skill ${i}` }),
);

describe("daily answer", () => {
  it("is the same for the same day regardless of pool order", () => {
    const reversed = [...pool].reverse();
    expect(answerForDay(LAUNCH_DAY + 5, pool).id).toBe(
      answerForDay(LAUNCH_DAY + 5, reversed).id,
    );
  });

  it("visits every skill once per cycle", () => {
    const ids = Array.from(
      { length: pool.length },
      (_, i) => answerForDay(LAUNCH_DAY + i, pool).id,
    );
    expect(new Set(ids).size).toBe(pool.length);
  });

  it("reshuffles in the next cycle", () => {
    const first = Array.from({ length: pool.length }, (_, i) =>
      answerForDay(LAUNCH_DAY + i, pool).id,
    );
    const second = Array.from({ length: pool.length }, (_, i) =>
      answerForDay(LAUNCH_DAY + pool.length + i, pool).id,
    );
    expect(second).not.toEqual(first);
    expect(new Set(second).size).toBe(pool.length);
  });

  it("rejects an empty pool", () => {
    expect(() => answerForDay(LAUNCH_DAY, [])).toThrow();
  });
});

describe("day helpers", () => {
  it("rolls over at UTC midnight", () => {
    const midnight = LAUNCH_DAY * DAY_MS;
    expect(dayNumber(midnight)).toBe(LAUNCH_DAY);
    expect(dayNumber(midnight - 1)).toBe(LAUNCH_DAY - 1);
    expect(msUntilNextDay(midnight)).toBe(DAY_MS);
    expect(msUntilNextDay(midnight + DAY_MS - 1)).toBe(1);
  });

  it("numbers puzzles from 1", () => {
    expect(puzzleNumber(LAUNCH_DAY)).toBe(1);
    expect(puzzleNumber(LAUNCH_DAY + 41)).toBe(42);
    expect(puzzleNumber(LAUNCH_DAY - 3)).toBe(1);
  });
});
