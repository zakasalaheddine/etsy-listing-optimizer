import type { RatedItem } from "@/types";
import RatedItemCard from "./rated-item-card";

interface TitlesListProps {
  titles: RatedItem[];
}

export default function TitlesList({ titles }: TitlesListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Optimized Titles
        </h3>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Choose a title that balances SEO keywords with readability. Higher
          scores indicate better keyword optimization.
        </p>
        <div className="space-y-3">
          {titles.map((title, index) => (
            <RatedItemCard
              key={title.text}
              item={title}
              index={index}
              multiline={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
