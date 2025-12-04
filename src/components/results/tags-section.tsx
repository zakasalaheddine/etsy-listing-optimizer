import { useState } from "react";
import type { RatedItem } from "@/types";
import { CheckIcon } from "../icons";
import TagCard from "./tag-card";

interface TagsSectionProps {
  tags: RatedItem[];
}

type SortOption = "score-desc" | "score-asc" | "length-asc" | "length-desc";

export default function TagsSection({ tags }: TagsSectionProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCopied, setSelectedCopied] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");

  // Sort tags based on selected option
  const sortedTags = [...(tags || [])].sort((a, b) => {
    switch (sortBy) {
      case "score-desc":
        return b.score - a.score;
      case "score-asc":
        return a.score - b.score;
      case "length-asc":
        return a.text.length - b.text.length;
      case "length-desc":
        return b.text.length - a.text.length;
      default:
        return b.score - a.score;
    }
  });

  const handleTagSelection = (tagText: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagText)) {
        newSet.delete(tagText);
      } else {
        if (newSet.size < 13) {
          newSet.add(tagText);
        }
      }
      return newSet;
    });
  };

  const handleSelectTop13 = () => {
    const top13 = sortedTags.slice(0, 13).map((tag) => tag.text);
    setSelectedTags(new Set(top13));
  };

  const handleClearSelection = () => {
    setSelectedTags(new Set());
  };

  const handleCopySelected = () => {
    if (selectedTags.size === 0) return;
    const tagsToCopy = Array.from(selectedTags).join(", ");
    navigator.clipboard.writeText(tagsToCopy).then(() => {
      setSelectedCopied(true);
      setTimeout(() => setSelectedCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Tag Options
        </h3>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Select up to 13 tags for your listing. Tags help buyers discover your
          product through Etsy search.
        </p>

        {/* Tag Controls */}
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {selectedTags.size}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  / 13 Selected
                </span>
              </div>
              <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${(selectedTags.size / 13) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSelectTop13}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>Check icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Select Top 13
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={selectedTags.size === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>Clear icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear All
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="score-desc">Score: High to Low</option>
                <option value="score-asc">Score: Low to High</option>
                <option value="length-asc">Length: Short to Long</option>
                <option value="length-desc">Length: Long to Short</option>
              </select>
              <button
                type="button"
                onClick={handleCopySelected}
                disabled={selectedTags.size === 0}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
              >
                {selectedCopied ? <CheckIcon className="w-4 h-4" /> : null}
                {selectedCopied ? "Copied!" : "Copy Selected"}
              </button>
            </div>
          </div>
        </div>

        {/* Tag Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 ">
          {sortedTags.map((tag) => (
            <TagCard
              key={tag.text}
              tag={tag}
              isSelected={selectedTags.has(tag.text)}
              onToggle={handleTagSelection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
