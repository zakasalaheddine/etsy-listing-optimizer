import { useState } from "react";
import type { Keywords } from "@/types";

interface KeywordSectionProps {
  keywords: Keywords;
}

interface KeywordCategory {
  title: string;
  data: string[];
}

export default function KeywordSection({ keywords }: KeywordSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const keywordSections: KeywordCategory[] = [
    { title: "Anchor Keywords", data: keywords.anchor || [] },
    { title: "Descriptive Keywords", data: keywords.descriptive || [] },
    { title: "Who", data: keywords.who || [] },
    { title: "What", data: keywords.what || [] },
    { title: "Where", data: keywords.where || [] },
    { title: "When", data: keywords.when || [] },
    { title: "Why", data: keywords.why || [] },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
      >
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Keyword Brainstorm
        </h3>
        <svg
          className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
      {isOpen && (
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
  );
}
