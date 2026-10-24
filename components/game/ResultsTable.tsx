import type { ReactNode } from "react";
import SkillTooltip from "@/components/tooltip/SkillTooltip";
import type {
  Attribute,
  GuessResult,
  MatchStatus,
  NumberCell,
} from "@/lib/games/skill/types";
import SkillIcon from "./SkillIcon";

const COLUMNS = [
  "Skill",
  "Category",
  "Attribute",
  "Source",
  "Damage",
  "Delivery",
  "Tier",
  "Mana",
  "Cast time",
  "Version",
  "Mechanics",
];

const STATUS: Record<MatchStatus, { tile: string; glyph: string; label: string }> = {
  correct: { tile: "tile-correct", glyph: "✓", label: "Correct" },
  partial: { tile: "tile-partial", glyph: "◐", label: "Partially correct" },
  wrong: { tile: "tile-wrong", glyph: "✕", label: "Incorrect" },
};

const ATTRIBUTE_COLOR: Record<Attribute, string> = {
  str: "text-attr-str",
  dex: "text-attr-dex",
  int: "text-attr-int",
};

const DAMAGE_COLOR: Record<string, string> = {
  physical: "text-[#e4dccf]",
  fire: "text-[#ffb27a]",
  cold: "text-[#a6dcff]",
  lightning: "text-[#ffe96f]",
  chaos: "text-[#e9a0ff]",
};

const CELL_REVEAL_MS = 260;

/** Time until the last tile of a freshly revealed row has flipped in. */
export const ROW_REVEAL_MS = COLUMNS.length * CELL_REVEAL_MS + 600;

export const prettyLabel = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");

const seconds = (value: number) => `${Number(value.toFixed(2))}s`;

type TileProps = {
  status: MatchStatus;
  column: number;
  animate: boolean;
  children: ReactNode;
};

function Tile({ status, column, animate, children }: TileProps) {
  const style = STATUS[status];
  return (
    <td className="p-0 align-top">
      <div
        className={`tile ${style.tile} flex h-full min-h-[4.6rem] flex-col items-center justify-center gap-0.5 px-1.5 py-2 text-center ${
          animate ? "animate-tile-flip" : ""
        }`}
        style={animate ? { animationDelay: `${column * CELL_REVEAL_MS}ms` } : undefined}
      >
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-0.5 text-[10px] font-bold opacity-70"
        >
          {style.glyph}
        </span>
        <span className="sr-only">{style.label}: </span>
        {children}
      </div>
    </td>
  );
}

function ChipList({
  values,
  matched,
  highlight,
  label = prettyLabel,
  chipClass,
}: {
  values: readonly string[];
  matched: readonly string[];
  highlight: boolean;
  label?: (value: string) => string;
  chipClass?: (value: string) => string;
}) {
  if (values.length === 0) {
    return <span className="text-sm font-bold opacity-80">None</span>;
  }
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {values.map((value) => (
        <span
          key={value}
          className={`chip ${
            highlight && matched.includes(value) ? "chip-hit" : chipClass?.(value) ?? ""
          }`}
        >
          {label(value)}
        </span>
      ))}
    </div>
  );
}

function NumberTile({
  cell,
  display,
  column,
  animate,
}: {
  cell: NumberCell;
  display: string;
  column: number;
  animate: boolean;
}) {
  const hint =
    cell.direction === "higher"
      ? { glyph: "▲", word: "higher" }
      : cell.direction === "lower"
        ? { glyph: "▼", word: "lower" }
        : null;
  return (
    <Tile status={cell.status} column={column} animate={animate}>
      <span className="text-xl font-bold leading-none">{display}</span>
      {hint ? (
        <span aria-hidden="true" className="text-xs font-bold leading-none">
          {hint.glyph}
        </span>
      ) : null}
      {hint ? <span className="sr-only">Answer is {hint.word}</span> : null}
    </Tile>
  );
}

function ResultRow({ result, animate }: { result: GuessResult; animate: boolean }) {
  const { skill } = result;
  const partial = (status: MatchStatus) => status === "partial";

  return (
    <tr>
      <td className="sticky left-0 z-10 p-0 align-top">
        <SkillTooltip skill={skill} className="h-full rounded-[0.65rem]">
          <div
            className={`tile flex h-full min-h-[4.6rem] w-[6.75rem] cursor-help flex-col items-center justify-center gap-1 px-1.5 py-2 text-center ${
              result.isCorrect ? "tile-correct" : "tile-neutral"
            } ${animate ? "animate-tile-flip" : ""}`}
          >
            <SkillIcon icon={skill.icon} name={skill.name} size={36} />
            <span
              className={`poe-caps text-[0.95rem] leading-tight ${
                result.isCorrect ? "text-white" : "text-gem"
              }`}
            >
              {skill.name}
            </span>
          </div>
        </SkillTooltip>
      </td>

      <Tile status={result.category.status} column={1} animate={animate}>
        <span className="text-sm font-bold">{prettyLabel(skill.category)}</span>
      </Tile>

      <Tile status={result.attributes.status} column={2} animate={animate}>
        <ChipList
          values={skill.attributes}
          matched={result.attributes.matched}
          highlight={partial(result.attributes.status)}
          label={(value) => value.toUpperCase()}
          chipClass={(value) => ATTRIBUTE_COLOR[value as Attribute]}
        />
      </Tile>

      <Tile status={result.sources.status} column={3} animate={animate}>
        <ChipList
          values={skill.sources}
          matched={result.sources.matched}
          highlight={partial(result.sources.status)}
        />
      </Tile>

      <Tile status={result.damage.status} column={4} animate={animate}>
        <ChipList
          values={skill.damage}
          matched={result.damage.matched}
          highlight={partial(result.damage.status)}
          chipClass={(value) => DAMAGE_COLOR[value] ?? ""}
        />
      </Tile>

      <Tile status={result.delivery.status} column={5} animate={animate}>
        <ChipList
          values={skill.delivery}
          matched={result.delivery.matched}
          highlight={partial(result.delivery.status)}
        />
      </Tile>

      <NumberTile
        cell={result.tier}
        display={skill.tier > 0 ? String(skill.tier) : "—"}
        column={6}
        animate={animate}
      />
      <NumberTile
        cell={result.mana}
        display={skill.mana > 0 ? String(skill.mana) : "—"}
        column={7}
        animate={animate}
      />
      <NumberTile
        cell={result.castTime}
        display={skill.castTime > 0 ? seconds(skill.castTime) : "—"}
        column={8}
        animate={animate}
      />
      <NumberTile
        cell={result.version}
        display={`0.${skill.version}`}
        column={9}
        animate={animate}
      />

      <Tile status={result.mechanics.status} column={10} animate={animate}>
        <ChipList
          values={skill.mechanics}
          matched={result.mechanics.matched}
          highlight={result.mechanics.status !== "wrong"}
        />
      </Tile>
    </tr>
  );
}

type ResultsTableProps = {
  /** Newest guess first. */
  results: GuessResult[];
  /** Skill id of the row that should play its reveal animation. */
  freshId: string | null;
};

export default function ResultsTable({ results, freshId }: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <p className="card-deep px-4 py-8 text-center text-muted">
        No guesses yet. Name any skill gem — the colour of each tile tells you
        how close you are.
      </p>
    );
  }

  return (
    <div className="-mx-3 overflow-x-auto px-3 pb-2">
      <table className="w-full min-w-[60rem] border-separate border-spacing-1.5">
        <caption className="sr-only">Your guesses, newest first</caption>
        <thead>
          <tr>
            {COLUMNS.map((column, index) => (
              <th
                key={column}
                scope="col"
                className={`whitespace-nowrap px-1 pb-0.5 text-center text-xs font-bold uppercase tracking-wide text-accent ${
                  index === 0 ? "sticky left-0 z-10 bg-background" : ""
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <ResultRow
              key={result.skill.id}
              result={result}
              animate={result.skill.id === freshId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
