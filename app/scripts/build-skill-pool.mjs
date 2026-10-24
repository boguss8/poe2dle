import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isHiddenGem } from "./fetch-icons.mjs";

/*
 * Clue design (checked against the data):
 *  - category   : what kind of skill it is (one value); Spirit = the gems cut
 *                 from Uncut Spirit Gems, i.e. persistent skills that reserve Spirit
 *  - attribute  : the gem colour every player knows
 *  - sources    : where it comes from / what it needs: the weapon or spell group
 *                 it is cut for, the item that grants it, Ascendancy, Runeforged
 *  - damage     : which damage types it deals (set)
 *  - delivery   : projectile / area / melee (set)
 *  - tier       : the gem's tier (RePoE `crafting_level`, shown in-game as "Tier")
 *  - mana       : mana cost at gem level 1
 *  - castTime   : cast time in seconds
 *  - version    : PoE2 minor version the gem was first released in
 *  - mechanics  : everything else the game tags it with (set)
 * Dropped earlier: "type" (91% active) and a merged tag column.
 */
const ATTRIBUTES = [
  ["strength", "str"],
  ["dexterity", "dex"],
  ["intelligence", "int"],
];

const DAMAGE_TAGS = ["physical", "fire", "cold", "lightning", "chaos"];
const DELIVERY_TAGS = ["projectile", "area", "melee"];

/** Tags that are already shown in another column or are true for nearly every skill. */
const COVERED_TAGS = new Set([
  ...DAMAGE_TAGS,
  ...DELIVERY_TAGS,
  "strength",
  "dexterity",
  "intelligence",
  "grants_active_skill",
  "support",
  "lineage",
  "meta",
  "attack",
  "spell",
  "minion",
  "companion",
  "command",
  "curse",
  "mark",
  "aura",
  "herald",
  "warcry",
]);

const KIND_BY_GEM_TYPE = { active: "active", spirit: "meta" };

/** Basic weapon attacks (Sword Slash, Bow Shot, ...) are not gems players pick. */
const isDefaultAttack = (id) => /PlayerDefault/i.test(id);

/** Unrendered template names such as "Companion: {0}". */
const isTemplateName = (name) => /\{\d*\}/.test(name);

/** Primary attribute first; empty when the gem has no attribute requirement. */
function attributesOf(weights) {
  return ATTRIBUTES.map(([key, short]) => [short, weights?.[key] ?? 0])
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([short]) => short);
}

/** Cut from an Uncut Spirit Gem: persistent, reserves Spirit, craftable (skeleton minions excepted). */
function isSpiritGem(raw, types) {
  return (
    (raw.crafting_level ?? 0) > 0 &&
    types.has("HasReservation") &&
    !types.has("CreatesSkeletonMinion")
  );
}

/** One category per skill, most specific first. */
export function categoryOf(raw, tags, types = new Set()) {
  if (isSpiritGem(raw, types)) return "spirit";
  if (KIND_BY_GEM_TYPE[raw.gem_type] === "meta") return "meta";
  if (tags.has("companion")) return "companion";
  if (tags.has("minion") || tags.has("command")) return "minion";
  if (tags.has("curse") || tags.has("mark")) return "curse";
  if (tags.has("aura") || tags.has("herald") || tags.has("warcry")) return "buff";
  if (tags.has("attack")) return "attack";
  if (tags.has("spell")) return "spell";
  if (tags.has("buff") || tags.has("persistent")) return "buff";
  return "utility";
}

const typesOf = (skill) => new Set(skill?.active_skill?.types ?? []);

/** "0.3" -> 3 */
export const minorOf = (version) => Number(String(version).split(".")[1]);

/** gem id -> sorted item classes whose base items grant that gem (Wand, Staff, ...). */
export function grantedByItems(baseItems) {
  const granted = new Map();
  for (const item of Object.values(baseItems)) {
    for (const gemId of item?.skills_granted ?? []) {
      if (!granted.has(gemId)) granted.set(gemId, new Set());
      granted.get(gemId).add(item.item_class);
    }
  }
  return new Map([...granted].map(([id, classes]) => [id, [...classes].sort()]));
}

/**
 * Where the skill comes from / what it needs, most specific first:
 * Ascendancy, Runeforged, the weapon or spell group a gem is cut for, the
 * item class that grants it, else "Other" (the data does not say).
 */
export function sourcesOf(id, raw, baseItem, grantedBy) {
  if (/Ascendancy/i.test(id)) return ["Ascendancy"];
  if ((baseItem?.tags ?? []).includes("runeforged")) return ["Runeforged"];
  if ((raw.crafting_types ?? []).length > 0) return [...raw.crafting_types].sort();
  return grantedBy.get(id) ?? ["Other"];
}

function toSkill(id, raw, skill, version, sources) {
  const tags = new Set(raw.tags ?? []);
  const castTimeMs = skill?.cast_time ?? 0;
  return {
    id,
    name: raw.base_item.display_name,
    icon: raw.icon_dds_file.replace(/\.dds$/i, ".png"),
    category: categoryOf(raw, tags, typesOf(skill)),
    attributes: attributesOf(raw.requirement_weights),
    sources,
    damage: DAMAGE_TAGS.filter((tag) => tags.has(tag)),
    delivery: DELIVERY_TAGS.filter((tag) => tags.has(tag)),
    mechanics: [...tags].filter((tag) => !COVERED_TAGS.has(tag)).sort(),
    tier: raw.crafting_level ?? 0,
    mana: skill?.per_level?.["1"]?.costs?.Mana ?? 0,
    castTime: Math.round(castTimeMs) / 1000,
    version: minorOf(version ?? "0.1"),
  };
}

/** When two gems share a name, keep the one that is actually craftable and richest. */
function richness(skill, raw) {
  return (
    (skill.tier > 0 ? 1000 : 0) +
    (raw.crafting_types?.length ?? 0) * 10 +
    skill.mechanics.length
  );
}

/**
 * Build the compact guess pool.
 * @param gemsJson   RePoE skill_gems.json
 * @param skillsJson RePoE skills.json (costs, cast time, skill types)
 * @param versions   gem id -> "0.x" (data/skill_versions.json)
 * @param baseItems  RePoE base_items.json (Runeforged tag, item-granted skills)
 */
export function buildSkillPool(
  gemsJson,
  skillsJson = {},
  versions = {},
  baseItems = {},
) {
  const grantedBy = grantedByItems(baseItems);
  const byName = new Map();
  for (const [id, raw] of Object.entries(gemsJson)) {
    const name = raw?.base_item?.display_name;
    if (!name || !raw.color || !(raw.gem_type in KIND_BY_GEM_TYPE)) continue;
    if (!raw.icon_dds_file || !/\.dds$/i.test(raw.icon_dds_file)) continue;
    if (isHiddenGem(id, name) || isDefaultAttack(id) || isTemplateName(name)) {
      continue;
    }

    const skill = toSkill(
      id,
      raw,
      skillsJson[raw.grants_skills?.[0]],
      versions[id],
      sourcesOf(id, raw, baseItems[id], grantedBy),
    );
    const existing = byName.get(name);
    if (!existing || richness(skill, raw) > existing.score) {
      byName.set(name, { skill, score: richness(skill, raw) });
    }
  }
  return [...byName.values()]
    .map((entry) => entry.skill)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ---------------------------------------------------------------- details */

const KEYWORD = /\[([^\]|]+)\|([^\]]+)\]|\[([^\]|]+)\]/g;

/** RePoE keyword markup "[Pinned|Pins]" -> "⟦Pins⟧" (rendered underlined in the tooltip). */
export function cleanMarkup(text) {
  return String(text).replace(KEYWORD, (_, _key, shown, bare) => `⟦${shown ?? bare}⟧`);
}

const NUMBER = /-?\d+(?:\.\d+)?/g;

/** Merge the level-1 and level-20 versions of a stat line into "(1-20)" ranges. */
export function rangeText(first, last) {
  const a = String(first);
  const b = String(last);
  const shape = (text) => text.replace(NUMBER, "#");
  if (shape(a) !== shape(b)) return a;
  const numbersB = b.match(NUMBER) ?? [];
  let index = 0;
  return a.replace(NUMBER, (value) => {
    const other = numbersB[index++];
    return other === value ? value : `(${value}-${other})`;
  });
}

const trimNumber = (value) => String(Number(value.toFixed(2)));

/** Quality line with a per-level range, or null when the template needs value handlers we don't model. */
export function qualityLine(entry) {
  if (/\{[^}]*\/[^}]*\}/.test(entry.stat)) return null;
  let ok = true;
  const text = entry.stat.replace(/\{([^}]+)\}/g, (_, id) => {
    const raw = entry.stats?.[id];
    if (typeof raw !== "number") {
      ok = false;
      return "";
    }
    const perPercent = raw / 1000;
    return `(${trimNumber(perPercent)}-${trimNumber(perPercent * 20)})`;
  });
  return ok ? cleanMarkup(text) : null;
}

function costOf(skill) {
  const levels = Object.entries(skill?.per_level ?? {})
    .map(([level, entry]) => [Number(level), entry?.costs ?? {}])
    .filter(([level]) => level >= 1 && level <= 20);
  const types = new Set(levels.flatMap(([, costs]) => Object.keys(costs)));
  return [...types].map((type) => {
    const values = levels.map(([, costs]) => costs[type]).filter((v) => v !== undefined);
    const perMinute = type.endsWith("PerMinute");
    const scale = perMinute ? 60 : 1;
    const label = perMinute ? `${type.replace("PerMinute", "")} per second` : type;
    return {
      label,
      min: trimNumber(Math.min(...values) / scale),
      max: trimNumber(Math.max(...values) / scale),
    };
  });
}

function statSetLines(set) {
  const order = set.static?.tooltip_order ?? [];
  const first = set.per_level?.["1"]?.stat_text ?? {};
  const last = set.per_level?.["20"]?.stat_text ?? first;
  const fixed = set.static?.stat_text ?? {};
  const lines = [];
  for (const key of order) {
    const text =
      key in first ? rangeText(first[key], last[key] ?? first[key]) : fixed[key];
    if (text) lines.push(cleanMarkup(text));
  }
  return lines;
}

/** Everything the hover tooltip shows for one gem. */
export function buildSkillDetails(raw, skill, pool) {
  const sets = (skill?.stat_sets ?? [])
    .map((set) => ({
      label: set.label?.[0] ?? null,
      lines: statSetLines(set),
    }))
    .filter((set) => set.lines.length > 0);
  const quality = (skill?.stat_sets?.[0]?.static?.quality_stats ?? [])
    .map(qualityLine)
    .filter(Boolean);
  const critChance = skill?.stat_sets?.[0]?.static?.crit_chance;
  const reservation = skill?.static?.reservations?.spirit;
  return {
    description: cleanMarkup(skill?.active_skill?.description ?? ""),
    tags: pool.tags,
    tier: pool.tier,
    cost: costOf(skill),
    reservation: typeof reservation === "number" ? reservation : null,
    castTime: pool.castTime,
    critChance: typeof critChance === "number" ? critChance / 100 : null,
    sets: sets.length > 1 ? sets : sets.map((set) => ({ ...set, label: null })),
    quality,
    itemClass: pool.category === "spirit" ? "Spirit Gem" : "Skill Gem",
    craftable: pool.tier > 0,
  };
}

const TAG_LABELS = { area: "AoE" };
const COSMETIC_TAGS = new Set([
  "strength",
  "dexterity",
  "intelligence",
  "grants_active_skill",
  "support",
  "lineage",
]);

/** Gem tags as the game prints them ("AoE", "Projectile", ...). */
export function displayTags(rawTags = []) {
  return rawTags
    .filter((tag) => !COSMETIC_TAGS.has(tag))
    .map((tag) => TAG_LABELS[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1));
}

export function buildAllDetails(gemsJson, skillsJson, pool) {
  const details = {};
  for (const entry of pool) {
    const raw = gemsJson[entry.id];
    const skill = skillsJson[raw.grants_skills?.[0]];
    details[entry.id] = buildSkillDetails(raw, skill, {
      tags: displayTags(raw.tags),
      tier: entry.tier,
      castTime: entry.castTime,
      category: entry.category,
    });
  }
  return details;
}

const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] === thisFile) {
  const projectRoot = dirname(dirname(dirname(thisFile)));
  const dataDir = join(projectRoot, "data");
  const read = (...parts) => JSON.parse(readFileSync(join(dataDir, ...parts), "utf8"));
  const requireFile = (...parts) => {
    if (!existsSync(join(dataDir, ...parts))) {
      throw new Error(
        `data/${parts.join("/")} is missing. Run "pnpm fetch-data" (and "node app/scripts/build-skill-versions.mjs") first.`,
      );
    }
  };
  requireFile("skill_gems.json");
  requireFile("base_items.json");
  requireFile("raw", "skills.json");
  requireFile("skill_versions.json");

  const gems = read("skill_gems.json");
  const baseItems = read("base_items.json");
  const skills = read("raw", "skills.json");
  const versions = read("skill_versions.json");
  const pool = buildSkillPool(gems, skills, versions, baseItems);
  writeFileSync(join(dataDir, "skill_pool.json"), `${JSON.stringify(pool, null, 1)}\n`);
  writeFileSync(
    join(dataDir, "skill_details.json"),
    `${JSON.stringify(buildAllDetails(gems, skills, pool))}\n`,
  );
  console.log(`Wrote ${pool.length} skills to data/skill_pool.json and data/skill_details.json`);
}
