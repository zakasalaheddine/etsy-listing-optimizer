import { useState } from "react";
import type { OptimizationResult } from "@/types";
import CopyButton from "./copy-button";
import { CheckIcon } from "./icons";
import ScoreBar from "./score-bar";

interface ResultsDisplayProps {
  result: OptimizationResult;
}

type SortOption = "score-desc" | "score-asc" | "length-asc" | "length-desc";

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCopied, setSelectedCopied] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("score-desc");
  const [keywordsSectionOpen, setKeywordsSectionOpen] = useState(true);

  // Guard against incomplete data.
  if (!result.keywords || !result.titles || !result.tags) {
    return (
      <div
        className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
        role="alert"
      >
        <p className="font-bold">Incomplete Response</p>
        <p>The AI returned a malformed response. Please try again.</p>
      </div>
    );
  }

  const { productType, keywords, titles, tags } = result;

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

  const keywordSections = [
    { title: "Anchor Keywords", data: keywords.anchor || [] },
    { title: "Descriptive Keywords", data: keywords.descriptive || [] },
    { title: "Who", data: keywords.who || [] },
    { title: "What", data: keywords.what || [] },
    { title: "Where", data: keywords.where || [] },
    { title: "When", data: keywords.when || [] },
    { title: "Why", data: keywords.why || [] },
  ];

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-200">
          Optimized Content
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          For:{" "}
          <span className="font-semibold text-teal-600 dark:text-teal-400">
            {productType || "Your Product"}
          </span>
        </p>
      </div>

      {/* Two Column Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Keywords */}
        <div className="space-y-6">
          {/* Keyword Brainstorm - Collapsible */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setKeywordsSectionOpen(!keywordsSectionOpen)}
              className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                A. Keyword Brainstorm
              </h3>
              <svg
                className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${keywordsSectionOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <title>Toggle section</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {keywordsSectionOpen && (
              <div className="px-6 py-5 space-y-6">
                {keywordSections.map(
                  (section) =>
                    section.data.length > 0 && (
                      <div key={section.title}>
                        <h4 className="font-bold text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                          {section.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {section.data.map((keyword) => (
                            <span
                              key={keyword}
                              className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Titles and Tags */}
        <div className="space-y-6">
          {/* Product Titles */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                B. Optimized Titles
              </h3>
            </div>
            <div className="px-6 py-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Choose a title that balances SEO keywords with readability.
                Higher scores indicate better keyword optimization.
              </p>
              <div className="space-y-3">
                {titles.map((title, index) => {
                  const badge = getScoreBadge(title.score);
                  return (
                    <div
                      key={title.text}
                      className="relative bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 pr-12">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 dark:text-slate-200 leading-relaxed mb-2">
                            {title.text}
                          </p>
                          <div className="flex items-center gap-3">
                            <ScoreBar score={title.score} />
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded border ${badge.color}`}
                              >
                                {badge.label}
                              </span>
                              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                {title.score}/100
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <CopyButton textToCopy={title.text} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden col-span-2">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              C. Tag Options
            </h3>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Select up to 13 tags for your listing. Tags help buyers discover
              your product through Etsy search.
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
            <div className="grid grid-cols-3 gap-3 ">
              {sortedTags.map((tag) => {
                const badge = getScoreBadge(tag.score);
                const isSelected = selectedTags.has(tag.text);
                return (
                  <label
                    key={tag.text}
                    htmlFor={`tag-${tag.text}`}
                    className={`relative rounded-lg p-4 flex items-start gap-3 cursor-pointer border-2 transition-all ${
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-900/30 border-teal-500 dark:border-teal-600 shadow-md"
                        : "bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm"
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`tag-${tag.text}`}
                      checked={isSelected}
                      onChange={() => handleTagSelection(tag.text)}
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
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Checklist - Full Width Below */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            D. Action Checklist for Listing Setup
          </h3>
        </div>
        <div className="px-6 py-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Categories:
                  </strong>
                  <span className="text-slate-600 dark:text-slate-400 ml-1">
                    Select the most accurate and descriptive category path
                    available in the Etsy taxonomy.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Attributes:
                  </strong>
                  <span className="text-slate-600 dark:text-slate-400 ml-1">
                    Only select attributes that are 100% accurate and targeted
                    to the product (e.g., occasions, colors, materials). Do not
                    select irrelevant attributes simply for keyword inclusion.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-800 dark:text-slate-200">
                    Description:
                  </strong>
                  <span className="text-slate-600 dark:text-slate-400 ml-1">
                    Write a natural, compelling description focused on the
                    customer experience. Do NOT attempt to use this section for
                    keyword optimization.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
