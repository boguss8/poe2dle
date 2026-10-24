import type { Skill } from "@/lib/games/skill/types";

export type ItemListProps = {
  id: string;
  items: Skill[];
  activeIndex: number;
  onSelect: (skill: Skill) => void;
  onHover: (index: number) => void;
};
