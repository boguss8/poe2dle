import type {
  ExactCell,
  GuessResult,
  NumberCell,
  SetCell,
  Skill,
} from "./types";

function compareSets(
  guess: readonly string[],
  answer: readonly string[],
): SetCell {
  const matched = guess.filter((value) => answer.includes(value));
  const sameSize = new Set(guess).size === new Set(answer).size;

  if (matched.length === new Set(answer).size && sameSize) {
    return { status: "correct", matched };
  }
  return { status: matched.length > 0 ? "partial" : "wrong", matched };
}

function compareNumber(guess: number, answer: number): NumberCell {
  if (guess === answer) return { status: "correct", direction: null };
  return { status: "wrong", direction: answer > guess ? "higher" : "lower" };
}

function compareExact<T>(guess: T, answer: T): ExactCell {
  return { status: guess === answer ? "correct" : "wrong" };
}

/** Compare a guessed skill against the answer, one result per clue column. */
export function compareSkills(guess: Skill, answer: Skill): GuessResult {
  return {
    skill: guess,
    isCorrect: guess.id === answer.id,
    category: compareExact(guess.category, answer.category),
    attributes: compareSets(guess.attributes, answer.attributes),
    sources: compareSets(guess.sources, answer.sources),
    damage: compareSets(guess.damage, answer.damage),
    delivery: compareSets(guess.delivery, answer.delivery),
    tier: compareNumber(guess.tier, answer.tier),
    mana: compareNumber(guess.mana, answer.mana),
    castTime: compareNumber(guess.castTime, answer.castTime),
    version: compareNumber(guess.version, answer.version),
    mechanics: compareSets(guess.mechanics, answer.mechanics),
  };
}
