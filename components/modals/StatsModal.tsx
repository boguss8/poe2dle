import type { Stats } from "@/lib/games/skill/types";
import Modal from "./Modal";

type StatsModalProps = {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  streak: number;
};

function StatFigures({ stats, streak }: { stats: Stats; streak: number }) {
  const winRate =
    stats.played === 0 ? 0 : Math.round((stats.won / stats.played) * 100);
  const figures = [
    { value: stats.played, label: "Played" },
    { value: `${winRate}%`, label: "Solved" },
    { value: streak, label: "Streak" },
    { value: stats.maxStreak, label: "Best" },
  ];
  return (
    <dl className="grid grid-cols-4 gap-2">
      {figures.map((figure) => (
        <div key={figure.label} className="card-deep px-2 py-3 text-center">
          <dd className="text-2xl font-bold leading-none">{figure.value}</dd>
          <dt className="mt-1 text-xs uppercase tracking-wide text-muted">
            {figure.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

export default function StatsModal({
  open,
  onClose,
  stats,
  streak,
}: StatsModalProps) {
  const entries = Object.entries(stats.distribution)
    .map(([guesses, wins]) => [Number(guesses), wins] as const)
    .sort((a, b) => a[0] - b[0]);
  const most = Math.max(1, ...entries.map(([, wins]) => wins));

  return (
    <Modal open={open} onClose={onClose} title="Statistics">
      <StatFigures stats={stats} streak={streak} />

      <h3 className="mb-2 mt-5 font-bold">Guesses per solve</h3>
      {entries.length === 0 ? (
        <p className="text-muted">Solve a puzzle to see your results.</p>
      ) : (
        <ul className="space-y-1">
          {entries.map(([guesses, wins]) => (
            <li key={guesses} className="flex items-center gap-2">
              <span className="w-6 text-right tabular-nums text-muted">{guesses}</span>
              <div
                className="tile tile-correct min-w-7 px-2 text-right text-sm font-bold"
                style={{ width: `${Math.max(8, (wins / most) * 100)}%` }}
              >
                {wins}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
