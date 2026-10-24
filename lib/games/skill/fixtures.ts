import type { Skill } from "./types";

/** Test helper: a skill with sensible defaults. */
export function makeSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: "Metadata/Items/Gem/SkillGemTest",
    name: "Test",
    icon: "Art/Test.png",
    category: "attack",
    attributes: ["dex"],
    sources: ["Bow"],
    damage: ["cold"],
    delivery: ["projectile"],
    mechanics: ["repeatable"],
    tier: 9,
    mana: 6,
    castTime: 1,
    version: 1,
    ...overrides,
  };
}
