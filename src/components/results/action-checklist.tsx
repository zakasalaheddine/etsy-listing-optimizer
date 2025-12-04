export default function ActionChecklist() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Action Checklist for Listing Setup
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
                  Only select attributes that are 100% accurate and targeted to
                  the product (e.g., occasions, colors, materials). Do not
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
  );
}
