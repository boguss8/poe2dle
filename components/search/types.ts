export type SkillItem = {
  base_item?: {
    display_name?: string;
    id?: string;
    release_state?: string;
    [key: string]: unknown;
  };
  color?: string;
  crafting_level?: number;
  crafting_types?: unknown;
  gem_type?: string;
  grants_skills?: string[];
  icon_dds_file?: string | null;
  is_lineage?: boolean;
  requirement_weights?: {
    dexterity?: number;
    intelligence?: number;
    strength?: number;
  };
  [key: string]: unknown;
};

export type ItemListProps = {
  items: SkillItem[];
  onSelect?: (item: SkillItem) => void;
};
