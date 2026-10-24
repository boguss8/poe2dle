import { describe, expect, it } from "vitest";
import {
  buildSkillDetails,
  buildSkillPool,
  categoryOf,
  cleanMarkup,
  displayTags,
  qualityLine,
  rangeText,
} from "./build-skill-pool.mjs";

const gem = (id, name, overrides = {}) => [
  id,
  {
    base_item: { display_name: name },
    color: "g",
    gem_type: "active",
    icon_dds_file: "Art/2DArt/SkillIcons/4k/X.dds",
    crafting_level: 5,
    crafting_types: ["Bow"],
    grants_skills: ["SkillX"],
    requirement_weights: { dexterity: 100, intelligence: 0, strength: 0 },
    tags: [
      "dexterity",
      "grants_active_skill",
      "attack",
      "projectile",
      "cold",
      "repeatable",
    ],
    ...overrides,
  },
];

const skills = {
  SkillX: {
    cast_time: 700,
    active_skill: { types: ["Attack"] },
    per_level: { 1: { costs: { Mana: 6 } }, 20: { costs: { Mana: 40 } } },
  },
};

describe("buildSkillPool", () => {
  it("maps a gem to the compact skill shape", () => {
    const [skill] = buildSkillPool(
      Object.fromEntries([gem("a", "Ice Shot")]),
      skills,
      { a: "0.3" },
    );
    expect(skill).toEqual({
      id: "a",
      name: "Ice Shot",
      icon: "Art/2DArt/SkillIcons/4k/X.png",
      category: "attack",
      attributes: ["dex"],
      sources: ["Bow"],
      damage: ["cold"],
      delivery: ["projectile"],
      mechanics: ["repeatable"],
      tier: 5,
      mana: 6,
      castTime: 0.7,
      version: 3,
    });
  });

  it("defaults to no cost, no cast time and the launch version", () => {
    const [skill] = buildSkillPool(Object.fromEntries([gem("a", "X")]));
    expect(skill.mana).toBe(0);
    expect(skill.castTime).toBe(0);
    expect(skill.version).toBe(1);
  });

  it("drops supports, dev gems, default attacks, templates and gems without icons", () => {
    const pool = buildSkillPool(
      Object.fromEntries([
        gem("keep", "Keep"),
        gem("s", "Support", { gem_type: "support" }),
        gem("d", "[DNT] Dev"),
        gem("Metadata/Items/Gem/SkillGemPlayerDefaultClaw", "Claw Stab"),
        gem("t", "Companion: {0}"),
        gem("n", "No icon", { icon_dds_file: null }),
      ]),
    );
    expect(pool.map((s) => s.name)).toEqual(["Keep"]);
  });

  it("orders attributes by weight", () => {
    const [skill] = buildSkillPool(
      Object.fromEntries([
        gem("m", "Hybrid", {
          requirement_weights: { dexterity: 25, intelligence: 75, strength: 0 },
        }),
      ]),
    );
    expect(skill.attributes).toEqual(["int", "dex"]);
  });

  it("keeps tags that no other column shows as mechanics", () => {
    const [skill] = buildSkillPool(
      Object.fromEntries([
        gem("x", "X", {
          tags: ["spell", "fire", "area", "duration", "trigger", "meta"],
        }),
      ]),
    );
    expect(skill.mechanics).toEqual(["duration", "trigger"]);
    expect(skill.damage).toEqual(["fire"]);
    expect(skill.delivery).toEqual(["area"]);
  });

  it("falls back to Other without base items", () => {
    const [skill] = buildSkillPool(
      Object.fromEntries([gem("a", "X", { crafting_types: null })]),
    );
    expect(skill.sources).toEqual(["Other"]);
  });

  it("keeps the craftable variant when names collide", () => {
    const pool = buildSkillPool(
      Object.fromEntries([
        gem("a", "Blink", { crafting_level: 0, crafting_types: null }),
        gem("b", "Blink", { crafting_level: 8, crafting_types: ["Elemental"] }),
      ]),
    );
    expect(pool.map((s) => s.id)).toEqual(["b"]);
  });
});

describe("skill sources", () => {
  const sourcesFor = (id, overrides, baseItems = {}) =>
    buildSkillPool(Object.fromEntries([gem(id, "X", overrides)]), skills, {}, baseItems)[0]
      .sources;

  it("uses the group a gem is cut for when it is craftable", () => {
    expect(sourcesFor("a", { crafting_types: ["Spear", "Bow"] })).toEqual(["Bow", "Spear"]);
  });

  it("recognises Ascendancy skills by id, ahead of everything else", () => {
    expect(
      sourcesFor("Metadata/Items/Gems/SkillGemAscendancySupportingFire", {
        crafting_types: null,
        crafting_level: 0,
      }),
    ).toEqual(["Ascendancy"]);
  });

  it("recognises Runeforged gems from the base item tag", () => {
    expect(
      sourcesFor(
        "rune",
        { crafting_types: null, crafting_level: 0 },
        { rune: { tags: ["runeforged", "gem"] } },
      ),
    ).toEqual(["Runeforged"]);
  });

  it("names the item class that grants an otherwise uncut skill", () => {
    const baseItems = {
      bone: { item_class: "Wand", skills_granted: ["wandskill"] },
      staff: { item_class: "Staff", skills_granted: ["wandskill"] },
    };
    expect(
      sourcesFor("wandskill", { crafting_types: null, crafting_level: 0 }, baseItems),
    ).toEqual(["Staff", "Wand"]);
  });

  it("says Other when the data has no origin for the skill", () => {
    expect(sourcesFor("x", { crafting_types: null, crafting_level: 0 })).toEqual(["Other"]);
  });
});

describe("categoryOf", () => {
  const category = (raw, tags, types = []) =>
    categoryOf({ gem_type: "active", crafting_level: 0, ...raw }, new Set(tags), new Set(types));

  it("picks one category per skill, most specific first", () => {
    expect(category({ gem_type: "spirit" }, ["attack"])).toBe("meta");
    expect(category({}, ["minion", "spell"])).toBe("minion");
    expect(category({}, ["companion", "minion"])).toBe("companion");
    expect(category({}, ["curse", "spell"])).toBe("curse");
    expect(category({}, ["warcry", "attack"])).toBe("buff");
    expect(category({}, ["attack", "spell"])).toBe("attack");
    expect(category({}, ["spell"])).toBe("spell");
    expect(category({}, ["persistent"])).toBe("buff");
    expect(category({}, ["travel"])).toBe("utility");
  });

  it("calls craftable persistent skills that reserve Spirit 'spirit'", () => {
    expect(category({ crafting_level: 4 }, ["buff"], ["HasReservation"])).toBe("spirit");
    expect(category({ gem_type: "spirit", crafting_level: 8 }, [], ["HasReservation"])).toBe("spirit");
  });

  it("does not make uncraftable reservers or skeleton minions spirit gems", () => {
    expect(category({ crafting_level: 0 }, ["buff"], ["HasReservation"])).toBe("buff");
    expect(
      category({ crafting_level: 1 }, ["minion"], ["HasReservation", "CreatesSkeletonMinion"]),
    ).toBe("minion");
  });
});

describe("tooltip text helpers", () => {
  it("turns keyword markup into underline markers", () => {
    expect(cleanMarkup("[Hit|Hits] are [Pinned|Pinning] and [Cold]")).toBe(
      "⟦Hits⟧ are ⟦Pinning⟧ and ⟦Cold⟧",
    );
  });

  it("merges level 1 and level 20 numbers into ranges", () => {
    expect(rangeText("Deals 10 to 15 Damage", "Deals 347 to 521 Damage")).toBe(
      "Deals (10-347) to (15-521) Damage",
    );
    expect(rangeText("Radius is 1.8 metres", "Radius is 1.8 metres")).toBe(
      "Radius is 1.8 metres",
    );
  });

  it("falls back to the first text when the line shapes differ", () => {
    expect(rangeText("Fires 2 projectiles", "Fires a projectile")).toBe(
      "Fires 2 projectiles",
    );
  });

  it("scales quality per percent up to 20%", () => {
    expect(
      qualityLine({
        stat: "[Pinned|Pins] Enemies as though dealing {a}% more Damage",
        stats: { a: 2500 },
      }),
    ).toBe("⟦Pins⟧ Enemies as though dealing (2.5-50)% more Damage");
  });

  it("skips quality templates that need value handlers", () => {
    expect(
      qualityLine({ stat: "Radius {a/divide_by_ten_1dp_if_required} metres", stats: { a: 200 } }),
    ).toBeNull();
  });

  it("prints gem tags the way the game does", () => {
    expect(displayTags(["dexterity", "grants_active_skill", "area", "cold"])).toEqual([
      "AoE",
      "Cold",
    ]);
  });
});

describe("buildSkillDetails", () => {
  const skill = {
    active_skill: { description: "Fire an [Arrow]." },
    static: { reservations: { spirit: 30 } },
    per_level: { 1: { costs: { Mana: 7 } }, 20: { costs: { Mana: 80 } } },
    stat_sets: [
      {
        label: ["Cast", "Cast"],
        static: {
          crit_chance: 1500,
          tooltip_order: ["radius", "dmg"],
          stat_text: { radius: "Radius is 1.8 metres" },
        },
        per_level: {
          1: { stat_text: { dmg: "Deals 10 Damage" } },
          20: { stat_text: { dmg: "Deals 347 Damage" } },
        },
      },
    ],
  };
  const pool = { tags: ["Spell"], tier: 3, castTime: 1, category: "spirit" };

  it("collects cost range, reservation, crit and ordered stat lines", () => {
    const details = buildSkillDetails({}, skill, pool);
    expect(details.description).toBe("Fire an ⟦Arrow⟧.");
    expect(details.cost).toEqual([{ label: "Mana", min: "7", max: "80" }]);
    expect(details.reservation).toBe(30);
    expect(details.critChance).toBe(15);
    expect(details.sets).toEqual([
      { label: null, lines: ["Radius is 1.8 metres", "Deals (10-347) Damage"] },
    ]);
    expect(details.itemClass).toBe("Spirit Gem");
    expect(details.craftable).toBe(true);
  });
});
