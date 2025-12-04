import type { RatedItem } from "@/types";
import RatedItemCard from "./rated-item-card";

interface DescriptionsListProps {
  descriptions: RatedItem[];
}

export default function DescriptionsList({
  descriptions,
}: DescriptionsListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          SEO-Optimized Descriptions
        </h3>
      </div>
      <div className="px-6 py-6">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Choose a description that incorporates all focus keywords naturally
          while maintaining customer appeal. Higher scores indicate better SEO
          effectiveness.
        </p>
        <div className="space-y-3">
          {descriptions.map((description, index) => (
            <RatedItemCard
              key={description.text}
              item={description}
              index={index}
              multiline={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
