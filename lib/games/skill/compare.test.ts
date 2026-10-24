import { describe, expect, it } from "vitest";
import { compareSkills } from "./compare";
import { makeSkill } from "./fixtures";

describe("compareSkills", () => {
  const answer = makeSkill({
    id: "answer",
    attributes: ["dex", "int"],
    sources: ["Bow", "Spear"],
    damage: ["cold", "physical"],
    delivery: ["projectile", "area"],
    mechanics: ["duration", "repeatable", "trigger"],
  });

  it("marks the same skill as fully correct", () => {
    const result = compareSkills(answer, answer);
    expect(result.isCorrect).toBe(true);
    expect(result.category.status).toBe("correct");
    for (const cell of [
      result.attributes,
      result.sources,
      result.damage,
      result.delivery,
      result.mechanics,
    ]) {
      expect(cell.status).toBe("correct");
    }
    for (const cell of [result.tier, result.mana, result.castTime, result.version]) {
      expect(cell).toEqual({ status: "correct", direction: null });
    }
  });

  it("is partial when sets overlap but differ, and lists the shared values", () => {
    const result = compareSkills(
      makeSkill({
        id: "g",
        attributes: ["dex"],
        sources: ["Bow"],
        damage: ["cold"],
        mechanics: ["repeatable", "channelling"],
      }),
      answer,
    );
    expect(result.attributes).toEqual({ status: "partial", matched: ["dex"] });
    expect(result.sources).toEqual({ status: "partial", matched: ["Bow"] });
    expect(result.damage).toEqual({ status: "partial", matched: ["cold"] });
    expect(result.mechanics).toEqual({
      status: "partial",
      matched: ["repeatable"],
    });
  });

  it("is wrong when sets share nothing", () => {
    const result = compareSkills(
      makeSkill({ id: "g", damage: ["fire"], delivery: ["melee"] }),
      answer,
    );
    expect(result.damage).toEqual({ status: "wrong", matched: [] });
    expect(result.delivery.status).toBe("wrong");
  });

  it("treats a superset guess as partial, not correct", () => {
    const result = compareSkills(
      makeSkill({ id: "g", delivery: ["projectile", "area", "melee"] }),
      answer,
    );
    expect(result.delivery.status).toBe("partial");
  });

  it("treats two empty sets as correct and empty vs non-empty as wrong", () => {
    const none = makeSkill({ id: "n", sources: [] });
    expect(
      compareSkills(none, makeSkill({ id: "m", sources: [] })).sources.status,
    ).toBe("correct");
    expect(compareSkills(none, answer).sources.status).toBe("wrong");
  });

  it("points every numeric clue towards the answer", () => {
    const high = answer;
    const low = makeSkill({ id: "low", tier: 3, mana: 2, castTime: 0.5, version: 1 });
    const answerHigh = makeSkill({ id: "high", tier: 9, mana: 20, castTime: 1.2, version: 4 });
    const result = compareSkills(low, answerHigh);
    expect(result.tier).toEqual({ status: "wrong", direction: "higher" });
    expect(result.mana).toEqual({ status: "wrong", direction: "higher" });
    expect(result.castTime).toEqual({ status: "wrong", direction: "higher" });
    expect(result.version).toEqual({ status: "wrong", direction: "higher" });
    expect(compareSkills(high, low).tier.direction).toBe("lower");
  });

  it("compares category exactly", () => {
    expect(
      compareSkills(makeSkill({ id: "g", category: "spirit" }), answer).category
        .status,
    ).toBe("wrong");
  });
});
