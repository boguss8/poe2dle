import { describe, expect, it } from "vitest";
import {
  decodeGame,
  decodeStats,
  encodeGame,
  encodeStats,
  skillKey,
} from "./codec";
import { SKILLS } from "./pool";
import type { SavedGame, Stats } from "./types";

const COOKIE_SAFE = /^[A-Za-z0-9._:\-]*$/;

const idByKey = new Map(SKILLS.map((skill) => [skillKey(skill.id), skill.id]));

describe("skillKey", () => {
  it("is unique across the whole pool", () => {
    expect(idByKey.size).toBe(SKILLS.length);
  });

  it("is short and cookie-safe", () => {
    for (const skill of SKILLS) {
      expect(skillKey(skill.id).length).toBeLessThanOrEqual(7);
      expect(skillKey(skill.id)).toMatch(COOKIE_SAFE);
    }
  });
});

describe("game codec", () => {
  it("round-trips a game", () => {
    const game: SavedGame = {
      day: 20750,
      status: "won",
      guesses: [SKILLS[0].id, SKILLS[10].id, SKILLS[200].id],
      hints: ["letter", "icon"],
    };
    const raw = encodeGame(game);
    expect(raw).toMatch(COOKIE_SAFE);
    expect(decodeGame(raw, idByKey)).toEqual(game);
  });

  it("round-trips an empty game", () => {
    const game: SavedGame = { day: 20750, status: "playing", guesses: [], hints: [] };
    expect(decodeGame(encodeGame(game), idByKey)).toEqual(game);
  });

  it("still reads cookies written before hints existed", () => {
    const old = `20750.p.${skillKey(SKILLS[3].id)}`;
    expect(decodeGame(old, idByKey)).toEqual({
      day: 20750,
      status: "playing",
      guesses: [SKILLS[3].id],
      hints: [],
    });
  });

  it("ignores unknown hint letters and duplicates", () => {
    expect(decodeGame("20750.p..lxl", idByKey)?.hints).toEqual(["letter"]);
  });

  it("drops unknown keys and rejects malformed values", () => {
    expect(decodeGame("20750.p.zzzzzzz", idByKey)?.guesses).toEqual([]);
    expect(decodeGame("nonsense", idByKey)).toBeNull();
    expect(decodeGame("20750.x.", idByKey)).toBeNull();
    expect(decodeGame("abc.p.", idByKey)).toBeNull();
  });

  it("stays small for a long game", () => {
    const game: SavedGame = {
      day: 20750,
      status: "playing",
      guesses: SKILLS.slice(0, 60).map((skill) => skill.id),
      hints: ["letter", "icon"],
    };
    expect(encodeGame(game).length).toBeLessThan(600);
  });
});

describe("stats codec", () => {
  it("round-trips stats", () => {
    const stats: Stats = {
      played: 12,
      won: 9,
      currentStreak: 4,
      maxStreak: 6,
      lastWonDay: 20750,
      distribution: { "2": 1, "5": 4, "12": 4 },
    };
    const raw = encodeStats(stats);
    expect(raw).toMatch(COOKIE_SAFE);
    expect(decodeStats(raw)).toEqual(stats);
  });

  it("round-trips empty stats", () => {
    const stats: Stats = {
      played: 0,
      won: 0,
      currentStreak: 0,
      maxStreak: 0,
      lastWonDay: null,
      distribution: {},
    };
    expect(decodeStats(encodeStats(stats))).toEqual(stats);
  });

  it("rejects malformed values", () => {
    expect(decodeStats("1.2.3")).toBeNull();
    expect(decodeStats("a.b.c.d..")).toBeNull();
    expect(decodeStats("1.1.1.1..2:x")).toBeNull();
  });
});
