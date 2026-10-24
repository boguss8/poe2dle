import pool from "@/data/skill_pool.json";
import type { Skill } from "./types";

export const SKILLS = pool as Skill[];

export const SKILL_BY_ID: ReadonlyMap<string, Skill> = new Map(
  SKILLS.map((skill) => [skill.id, skill]),
);

/** Lowercase, strip diacritics, drop punctuation so "ruzhans" finds "Ruzhan's". */
export function normalizeQuery(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match quality: 0 name prefix, 1 word prefix, 2 substring, null no match. */
function rank(normalizedName: string, query: string): number | null {
  if (normalizedName.startsWith(query)) return 0;
  if (normalizedName.includes(` ${query}`)) return 1;
  if (normalizedName.includes(query)) return 2;
  return null;
}

/** Skills whose name matches `query`, best matches first, minus `excludeIds`. */
export function searchSkills(
  query: string,
  skills: readonly Skill[],
  excludeIds: ReadonlySet<string> = new Set(),
  limit = 8,
): Skill[] {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) return [];

  const ranked: { skill: Skill; rank: number }[] = [];
  for (const skill of skills) {
    if (excludeIds.has(skill.id)) continue;
    const r = rank(normalizeQuery(skill.name), normalizedQuery);
    if (r !== null) ranked.push({ skill, rank: r });
  }
  ranked.sort(
    (a, b) => a.rank - b.rank || a.skill.name.localeCompare(b.skill.name),
  );
  return ranked.slice(0, limit).map((entry) => entry.skill);
}
