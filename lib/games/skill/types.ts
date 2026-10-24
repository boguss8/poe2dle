export type Attribute = "str" | "dex" | "int";

export type Category =
  | "attack"
  | "spell"
  | "spirit"
  | "minion"
  | "companion"
  | "buff"
  | "curse"
  | "meta"
  | "utility";

/** One guessable skill gem, as emitted by `build-skill-pool.mjs`. */
export type Skill = {
  id: string;
  name: string;
  /** Path below `/icons/poe2/`. */
  icon: string;
  category: Category;
  /** Primary attribute first; empty when the gem has no requirement. */
  attributes: Attribute[];
  /**
   * Where the skill comes from or what it needs: the weapon/spell group it is
   * cut for (Bow, Elemental, ...), the item class granting it (Wand, Staff, ...),
   * Ascendancy, Runeforged, or Other.
   */
  sources: string[];
  /** Physical, fire, cold, lightning, chaos. */
  damage: string[];
  /** Projectile, area, melee. */
  delivery: string[];
  /** Remaining in-game tags (duration, trigger, channelling, ...). */
  mechanics: string[];
  /** In-game gem tier; 0 when the gem is not cut from uncut gems. */
  tier: number;
  /** Mana cost at gem level 1; 0 when it costs no mana. */
  mana: number;
  /** Seconds; 0 when the skill has no cast time. */
  castTime: number;
  /** PoE2 minor version the gem was first released in (3 = 0.3). */
  version: number;
};

/** Hover-tooltip content, loaded lazily from `skill_details.json`. */
export type SkillDetails = {
  description: string;
  tags: string[];
  tier: number;
  cost: { label: string; min: string; max: string }[];
  reservation: number | null;
  castTime: number;
  critChance: number | null;
  sets: { label: string | null; lines: string[] }[];
  quality: string[];
  itemClass: string;
  craftable: boolean;
};

export type MatchStatus = "correct" | "partial" | "wrong";

/** Cell compared as a whole value. */
export type ExactCell = { status: "correct" | "wrong" };

/** Cell compared as a set; `matched` are the guessed values the answer shares. */
export type SetCell = { status: MatchStatus; matched: readonly string[] };

/** Numeric cell; `direction` says where the answer lies relative to the guess. */
export type NumberCell = {
  status: "correct" | "wrong";
  direction: "higher" | "lower" | null;
};

export type GuessResult = {
  skill: Skill;
  isCorrect: boolean;
  category: ExactCell;
  attributes: SetCell;
  sources: SetCell;
  damage: SetCell;
  delivery: SetCell;
  tier: NumberCell;
  mana: NumberCell;
  castTime: NumberCell;
  version: NumberCell;
  mechanics: SetCell;
};

export type GameStatus = "playing" | "won" | "gave_up";

/** Optional help the player can unlock after enough wrong guesses. */
export type HintId = "letter" | "icon";

export type SavedGame = {
  /** Days since the Unix epoch (UTC) this game belongs to. */
  day: number;
  /** Guessed skill ids, oldest first. */
  guesses: string[];
  status: GameStatus;
  /** Hints the player chose to reveal today. */
  hints: HintId[];
};

export type Stats = {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastWonDay: number | null;
  /** Number of guesses needed -> number of wins. */
  distribution: Record<string, number>;
};
