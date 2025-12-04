import type { OptimizationResult } from "@/types";
import ActionChecklist from "./results/action-checklist";
import DescriptionsList from "./results/descriptions-list";
import KeywordSection from "./results/keyword-section";
import ResultsHeader from "./results/results-header";
import TagsSection from "./results/tags-section";
import TitlesList from "./results/titles-list";

interface ResultsDisplayProps {
  result: OptimizationResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  // Guard against incomplete data.
  if (
    !result.keywords ||
    !result.titles ||
    !result.descriptions ||
    !result.tags
  ) {
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

  const { productType, keywords, titles, descriptions, tags } = result;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <ResultsHeader productType={productType} />

      {/* Two Column Layout: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: Keywords (Sticky on Desktop) */}
        <div className="w-full lg:w-[400px] lg:shrink-0">
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <KeywordSection keywords={keywords} />
          </div>
        </div>

        {/* Right Column: Main Content */}
        <div className="flex-1 space-y-6 min-w-0">
          <TitlesList titles={titles} />
          <DescriptionsList descriptions={descriptions} />
          <TagsSection tags={tags} />
          <ActionChecklist />
        </div>
      </div>
    </div>
  );
}
