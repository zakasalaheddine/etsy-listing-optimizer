interface ResultsHeaderProps {
  productType: string;
}

export default function ResultsHeader({ productType }: ResultsHeaderProps) {
  return (
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
  );
}
