/** "area_damage" -> "Area damage": the way tags and categories are shown to players. */
export const prettyLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
