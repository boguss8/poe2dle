import type { SkillItem } from "@/components/search/types";

/**
 * Get detailed information about a skill item
 */
export function getItemDetails(item: SkillItem) {
  return {
    name: item.base_item?.display_name,
    class: item.base_item?.item_class,
    cost: item.base_item?.cost,
    description: item.base_item?.description,
    icon: item.icon_dds_file,
  };
}

/**
 * Compare guess against answer
 */
export function verifyGuess(guess: SkillItem, answer: SkillItem) {
  // Helper to determine primary requirement from requirement_weights
  function primaryRequirement(req?: {
    dexterity?: number;
    intelligence?: number;
    strength?: number;
  }): "dexterity" | "intelligence" | "strength" | null {
    if (!req) return null;
    const dex = req.dexterity ?? 0;
    const intel = req.intelligence ?? 0;
    const str = req.strength ?? 0;
    if (dex === 0 && intel === 0 && str === 0) return null;
    if (dex >= intel && dex >= str) return "dexterity";
    if (intel >= dex && intel >= str) return "intelligence";
    return "strength";
  }

  const guessReq = primaryRequirement(guess.requirement_weights);
  const answerReq = primaryRequirement(answer.requirement_weights);

  const guessLevel = guess.crafting_level ?? null;
  const answerLevel = answer.crafting_level ?? null;

  const guessWeapons = Array.isArray(guess.crafting_types)
    ? (guess.crafting_types as string[])
    : [];
  const answerWeapons = Array.isArray(answer.crafting_types)
    ? (answer.crafting_types as string[])
    : [];

  const weaponOverlap = guessWeapons.filter((w) => answerWeapons.includes(w));

  const guessTags = Array.isArray(guess.tags) ? (guess.tags as string[]) : [];
  const answerTags = Array.isArray(answer.tags)
    ? (answer.tags as string[])
    : [];
  const tagOverlap = guessTags.filter((t) => answerTags.includes(t));

  return {
    isCorrectName:
      guess.base_item?.display_name === answer.base_item?.display_name,
    isCorrectPrimaryRequirement: guessReq !== null && guessReq === answerReq,
    isCorrectMinLevel:
      guessLevel !== null && answerLevel !== null
        ? guessLevel === answerLevel
        : null,
    isCorrectWeapon:
      weaponOverlap.length > 0 ||
      (guessWeapons.length === 0 && answerWeapons.length === 0),
    isCorrectTags: tagOverlap.length > 0,
    isCorrectRelease:
      guess.base_item?.release_state === answer.base_item?.release_state,
    isCorrectAll:
      guess.base_item?.display_name === answer.base_item?.display_name &&
      guessReq === answerReq &&
      (guessLevel === null ||
        answerLevel === null ||
        guessLevel === answerLevel) &&
      weaponOverlap.length > 0 &&
      tagOverlap.length > 0,
  };
}
