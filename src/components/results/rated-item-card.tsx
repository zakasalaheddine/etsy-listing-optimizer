import type { RatedItem } from "@/types";
import CopyButton from "../copy-button";
import ScoreBar from "../score-bar";

interface RatedItemCardProps {
  item: RatedItem;
  index: number;
  multiline?: boolean;
}

export default function RatedItemCard({
  item,
  index,
  multiline = false,
}: RatedItemCardProps) {
  const getScoreBadge = (score: number) => {
    if (score >= 85)
      return {
        label: "Excellent",
        color:
          "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-700",
      };
    if (score >= 65)
      return {
        label: "Good",
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700",
      };
    return {
      label: "Fair",
      color:
        "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-600",
    };
  };

  const badge = getScoreBadge(item.score);

  return (
    <div className="relative bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 pr-12">
        <span className="shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={`text-slate-800 dark:text-slate-200 leading-relaxed mb-2 ${multiline ? "whitespace-pre-wrap" : ""}`}
          >
            {item.text}
          </p>
          <div className="flex items-center gap-3">
            <ScoreBar score={item.score} />
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded border ${badge.color}`}
              >
                {badge.label}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {item.score}/100
              </span>
            </div>
          </div>
        </div>
      </div>
      <CopyButton textToCopy={item.text} />
    </div>
  );
}
