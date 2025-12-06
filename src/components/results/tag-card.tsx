import type { RatedItem } from "@/types";
import ScoreBar from "../score-bar";

interface TagCardProps {
  tag: RatedItem;
  isSelected: boolean;
  onToggle: (tagText: string) => void;
}

export default function TagCard({ tag, isSelected, onToggle }: TagCardProps) {
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

  const badge = getScoreBadge(tag.score);

  return (
    <label
      htmlFor={`tag-${tag.text}`}
      className={`relative rounded-lg p-4 flex items-start gap-3 cursor-pointer border-2 transition-all ${
        isSelected
          ? "bg-teal-50 dark:bg-teal-900/30 border-teal-500 dark:border-teal-600 shadow-md"
          : "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm"
      }`}
    >
      <input
        type="checkbox"
        id={`tag-${tag.text}`}
        checked={isSelected}
        onChange={() => onToggle(tag.text)}
        className="mt-1 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 cursor-pointer"
      />
      <div className="flex-1 min-w-0 pr-10">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2 leading-snug">
          {tag.text}
        </p>
        <div className="space-y-1.5">
          <ScoreBar score={tag.score} />
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${badge.color}`}
            >
              {badge.label}
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {tag.score}/100
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {tag.text.length} chars
            </span>
          </div>
        </div>
      </div>
      <div className="absolute top-3 right-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(tag.text);
          }}
          className="p-1.5 rounded-md bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
          aria-label="Copy tag"
        >
          <svg
            className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <title>Copy icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
    </label>
  );
}
