/**
 * Every cookie the site sets. The stores take their names from here and the
 * cookie settings dialog lists them, so the two cannot drift apart.
 */
export const COOKIES = {
  consent: {
    name: "poe2dle_consent",
    purpose: "Remembers your cookie choice.",
  },
  game: {
    name: "poe2dle_skill_game",
    purpose: "Today's guesses and hints, so a reload doesn't lose your game.",
  },
  stats: {
    name: "poe2dle_skill_stats",
    purpose: "Games played, wins and your streak.",
  },
  help: {
    name: "poe2dle_help_seen",
    purpose: "Whether you have already seen the how-to-play dialog.",
  },
} as const;
