import { useState } from "react";
import type { OptimizationResult } from "@/types";
import CopyButton from "./copy-button";
import { CheckIcon } from "./icons";
import ScoreBar from "./score-bar";

interface ResultsDisplayProps {
  result: OptimizationResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedCopied, setSelectedCopied] = useState(false);

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

  const sortedTags = [...(tags || [])].sort((a, b) => b.score - a.score);

  const handleTagSelection = (tagText: string) => {
    setSelectedTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagText)) {
        newSet.delete(tagText);
      } else {
        if (newSet.size < 13) {
          newSet.add(tagText);
        } else {
          alert("You can only select up to 13 tags.");
        }
      }
      return newSet;
    });
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

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-200">
        Optimized Content for:{" "}
        <span className="text-teal-500">{productType || "Your Product"}</span>
      </h2>

      {/* Keyword Brainstorm */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          A. Keyword Brainstorm
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keywordSections.map(
            (section) =>
              section.data.length > 0 && (
                <div key={section.title}>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {section.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {section.data.map((keyword) => (
                      <span
                        key={keyword}
                        className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ),
          )}
        </div>
      </div>

      {/* Optimized Components */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
          B. Optimized Listing Components
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">
              1. Product Title Options
            </h4>
            <div className="space-y-4">
              {titles.map((title) => (
                <div
                  key={title.text}
                  className="relative bg-slate-100 dark:bg-slate-700 p-4 rounded-md"
                >
                  <p className="text-slate-800 dark:text-slate-200 pr-10">
                    {title.text}
                  </p>
                  <ScoreBar score={title.score} />
                  <CopyButton textToCopy={title.text} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <h4 className="text-lg font-semibold">2. Tag Options</h4>
              <div className="flex items-center gap-4 mt-2 sm:mt-0">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {selectedTags.size} / 13 Selected
                </span>
                <button
                  type="button"
                  onClick={handleCopySelected}
                  disabled={selectedTags.size === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedCopied ? <CheckIcon className="w-4 h-4" /> : null}
                  {selectedCopied ? "Copied!" : "Copy Selected"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedTags.map((tag) => (
                <label
                  key={tag.text}
                  htmlFor={`tag-${tag.text}`}
                  className="relative bg-slate-100 dark:bg-slate-700 p-3 rounded-md flex items-start gap-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`tag-${tag.text}`}
                    checked={selectedTags.has(tag.text)}
                    onChange={() => handleTagSelection(tag.text)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="grow">
                    <p className="text-sm text-slate-800 dark:text-slate-200 pr-8">
                      {tag.text}
                    </p>
                    <ScoreBar score={tag.score} />
                  </div>
                  <CopyButton textToCopy={tag.text} />
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">
              3. Action Checklist for Listing Setup
            </h4>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <strong>Categories:</strong> Select the most accurate and
                descriptive category path available in the Etsy taxonomy.
              </li>
              <li>
                <strong>Attributes:</strong> Only select attributes that are
                100% accurate and targeted to the product (e.g., occasions,
                colors, materials). Do not select irrelevant attributes simply
                for keyword inclusion.
              </li>
              <li>
                <strong>Description:</strong> Write a natural, compelling
                description focused on the customer experience. Do NOT attempt
                to use this section for keyword optimization.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
