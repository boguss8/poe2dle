import type { MatchStatus } from "@/lib/games/skill/types";
import { STATUS } from "./status";

const ROWS: readonly { status: MatchStatus; text: string }[] = [
  { status: "correct", text: "Exactly the same as the answer." },
  { status: "partial", text: "Some overlap — the white chips are shared with the answer." },
  { status: "wrong", text: "Nothing in common." },
];

function Swatch({ tile, glyph }: { tile: string; glyph: string }) {
  return (
    <span
      aria-hidden="true"
      className={`tile ${tile} flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold`}
    >
      {glyph}
    </span>
  );
}

/** Colour key for the guess tiles. */
export default function Legend() {
  return (
    <ul className="space-y-2">
      {ROWS.map(({ status, text }) => (
        <li key={status} className="flex items-center gap-3">
          <Swatch tile={STATUS[status].tile} glyph={STATUS[status].glyph} />
          <span>{text}</span>
        </li>
      ))}
      <li className="flex items-center gap-3">
        <Swatch tile={STATUS.wrong.tile} glyph="▲" />
        <span>
          On number clues an arrow shows whether the answer is higher (▲) or lower (▼).
        </span>
      </li>
    </ul>
  );
}
