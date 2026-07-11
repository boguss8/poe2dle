import ResultsTable from "./ResultsTable";

export default function GameBoard() {
  return (
    <section
      aria-label="game board"
      className="w-full max-w-xl rounded-xl border p-6"
    >
      <p className="mb-2 font-semibold">Game board</p>
      <ResultsTable />
    </section>
  );
}
