import { describe, expect, it } from "vitest";
import { makeSkill } from "./fixtures";
import { normalizeQuery, searchSkills, SKILLS } from "./pool";

const skills = [
  makeSkill({ id: "1", name: "Ruzhan's Fury" }),
  makeSkill({ id: "2", name: "Fury of the Wild" }),
  makeSkill({ id: "3", name: "Ice Shot" }),
  makeSkill({ id: "4", name: "Ice Strike" }),
  makeSkill({ id: "5", name: "Flame Wall" }),
];

describe("normalizeQuery", () => {
  it("ignores case, punctuation and extra spaces", () => {
    expect(normalizeQuery("  Ruzhan's   FURY ")).toBe("ruzhans fury");
  });
});

describe("searchSkills", () => {
  it("returns nothing for an empty query", () => {
    expect(searchSkills("  ", skills)).toEqual([]);
  });

  it("ranks name prefixes before word prefixes before substrings", () => {
    const names = searchSkills("fur", skills).map((s) => s.name);
    expect(names).toEqual(["Fury of the Wild", "Ruzhan's Fury"]);
  });

  it("matches through apostrophes", () => {
    expect(searchSkills("ruzhans", skills).map((s) => s.name)).toEqual([
      "Ruzhan's Fury",
    ]);
  });

  it("hides excluded skills and honours the limit", () => {
    expect(
      searchSkills("ice", skills, new Set(["3"])).map((s) => s.name),
    ).toEqual(["Ice Strike"]);
    expect(searchSkills("i", skills, new Set(), 1)).toHaveLength(1);
  });
});

describe("generated skill pool", () => {
  it("has unique ids and names", () => {
    expect(new Set(SKILLS.map((s) => s.id)).size).toBe(SKILLS.length);
    expect(new Set(SKILLS.map((s) => s.name)).size).toBe(SKILLS.length);
  });

  it("contains only usable entries", () => {
    for (const skill of SKILLS) {
      expect(skill.icon).toMatch(/\.png$/);
      expect(skill.name).not.toMatch(/^\[DNT|^Playtest |\{\d*\}/);
    }
  });

  it("has a useful spread of categories", () => {
    const counts = new Map<string, number>();
    for (const skill of SKILLS) {
      counts.set(skill.category, (counts.get(skill.category) ?? 0) + 1);
    }
    // No single category should dominate, or its clue tells the player little.
    expect(Math.max(...counts.values()) / SKILLS.length).toBeLessThan(0.45);
    expect(counts.size).toBeGreaterThanOrEqual(6);
  });

  it("matches the 53 Spirit Gems poe2db lists", () => {
    expect(SKILLS.filter((skill) => skill.category === "spirit")).toHaveLength(53);
  });

  it("has a known version for every skill", () => {
    for (const skill of SKILLS) {
      expect(skill.version).toBeGreaterThanOrEqual(1);
      expect(skill.version).toBeLessThanOrEqual(9);
    }
  });
});
