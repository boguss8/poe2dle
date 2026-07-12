import ResultsTable from "./ResultsTable";
import InputField from "../search/InputField";

export default function GameBoard() {
  return (
    <section aria-label="game board" className="w-full max-w-xl rounded-xl p-6">
      <p className="mb-2 font-semibold">Game board</p>
      <ResultsTable />
      <InputField />
    </section>
  );
}
