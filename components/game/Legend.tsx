const ROWS = [
  { tile: "tile-correct", glyph: "✓", text: "Exactly the same as the answer." },
  { tile: "tile-partial", glyph: "◐", text: "Some overlap — the white chips are shared with the answer." },
  { tile: "tile-wrong", glyph: "✕", text: "Nothing in common." },
] as const;

/** Colour key for the guess tiles. */
export default function Legend() {
  return (
    <ul className="space-y-2">
      {ROWS.map((row) => (
        <li key={row.tile} className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={`tile ${row.tile} flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold`}
          >
            {row.glyph}
          </span>
          <span>{row.text}</span>
        </li>
      ))}
      <li className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="tile tile-wrong flex h-8 w-8 shrink-0 items-center justify-center text-sm font-bold"
        >
          ▲
        </span>
        <span>
          On number clues an arrow shows whether the answer is higher (▲) or lower (▼).
        </span>
      </li>
    </ul>
  );
}
