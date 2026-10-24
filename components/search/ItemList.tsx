import SkillIcon from "@/components/game/SkillIcon";
import SkillTooltip from "@/components/tooltip/SkillTooltip";
import { prettyLabel } from "@/lib/format";
import type { Skill } from "@/lib/games/skill/types";

export const optionId = (listId: string, index: number) =>
  `${listId}-option-${index}`;

type ItemListProps = {
  id: string;
  items: Skill[];
  activeIndex: number;
  onSelect: (skill: Skill) => void;
  onHover: (index: number) => void;
};

export default function ItemList({
  id,
  items,
  activeIndex,
  onSelect,
  onHover,
}: ItemListProps) {
  return (
    <ul
      id={id}
      role="listbox"
      aria-label="Matching skills"
      // On wide screens the list is narrower than the input so the tooltip has
      // room beside it instead of covering the suggestions.
      className="card-deep absolute left-0 right-0 top-full z-20 mt-1.5 max-h-80 overflow-y-auto border-[#5a4b31] shadow-[0_10px_30px_rgb(0_0_0/0.45)] lg:right-auto lg:w-[30rem]"
    >
      {items.length === 0 ? (
        <li role="presentation" className="px-4 py-3 text-muted">
          No matching skill
        </li>
      ) : (
        items.map((skill, index) => (
          <li
            key={skill.id}
            id={optionId(id, index)}
            role="option"
            aria-selected={index === activeIndex}
            // Keep focus in the input while the pointer picks an option.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(skill)}
            onMouseMove={() => onHover(index)}
            className={`cursor-pointer ${index === activeIndex ? "bg-white/10" : ""}`}
          >
            <SkillTooltip
              skill={skill}
              focusable={false}
              anchor={() => document.getElementById(id)}
              className="flex items-center gap-3 px-3 py-1.5"
            >
              <SkillIcon icon={skill.icon} name="" size={34} />
              <span className="poe-caps text-[1.05rem] text-gem">{skill.name}</span>
              <span className="ml-auto text-sm text-muted">
                {prettyLabel(skill.category)}
              </span>
            </SkillTooltip>
          </li>
        ))
      )}
    </ul>
  );
}
