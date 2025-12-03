import type { TrademarkAnalysis } from "@/types";

export default function TrademarkSection({
  analysis,
}: {
  analysis: TrademarkAnalysis;
}) {
  let borderColor = "border-yellow-500";
  let bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
  let titleColor = "text-yellow-800 dark:text-yellow-200";
  let icon = "⚠️";

  if (analysis.riskLevel === "High Risk") {
    borderColor = "border-red-600";
    bgColor = "bg-red-50 dark:bg-red-900/20";
    titleColor = "text-red-800 dark:text-red-200";
    icon = "🚫";
  } else if (analysis.riskLevel === "Safe") {
    borderColor = "border-green-500";
    bgColor = "bg-green-50 dark:bg-green-900/20";
    titleColor = "text-green-800 dark:text-green-200";
    icon = "✅";
  }

  // Helper to extract unique source URLs
  const sources = analysis.chunks?.map((c) => c.web?.uri).filter(Boolean) || [];
  const uniqueSources = Array.from(new Set(sources));

  return (
    <div
      className={`mb-8 border-l-4 ${borderColor} ${bgColor} p-6 rounded-r-lg shadow-sm`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl" role="img" aria-label={analysis.riskLevel}>
          {icon}
        </span>
        <div>
          <h3 className={`text-xl font-bold ${titleColor}`}>
            Trademark Analysis: {analysis.riskLevel}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Automated check via Google Search. Verify with{" "}
            <a
              href="http://tmhunt.com"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-teal-600"
            >
              TMHunt
            </a>{" "}
            or USPTO.
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-wrap text-sm leading-relaxed">
        {analysis.text}
      </div>

      {uniqueSources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Sources:
          </p>
          <ul className="text-sm space-y-1">
            {uniqueSources.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
