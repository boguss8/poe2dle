export type GameInfo = {
  id: string;
  title: string;
  href: string;
  available: boolean;
};

/** Every game on the site. The first entry is the default front page. */
export const GAMES: readonly GameInfo[] = [
  { id: "skill", title: "Skill Gems", href: "/", available: true },
  { id: "support", title: "Support Gems", href: "/support", available: false },
];
