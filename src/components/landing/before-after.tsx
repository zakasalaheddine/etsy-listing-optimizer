export default function BeforeAfter() {
  return (
    <section
      id="before-after"
      className="py-16 sm:py-20 lg:py-24 bg-slate-50 dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            See The Transformation
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Real example of how AI optimization improves your Etsy listing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Before */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border-2 border-red-200 dark:border-red-900">
            <div className="bg-linear-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <title>X icon</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Before</h3>
                  <p className="text-red-100 text-sm">Generic listing</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Title
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  Cute Notebook Journal
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-1/4" />
                  </div>
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    25/100
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["notebook", "journal", "cute", "stationery"].map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                  Issues: Generic keywords, poor SEO, limited discoverability
                </p>
              </div>
            </div>
          </div>

          {/* After */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border-2 border-teal-200 dark:border-teal-900">
            <div className="bg-linear-to-r from-teal-500 to-blue-500 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">After</h3>
                  <p className="text-teal-100 text-sm">AI-optimized listing</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Title
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  Handmade Leather Journal, Vintage Notebook, Personalized Gift
                  for Writers, Bullet Journal Planner, Travel Diary
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-teal-500 to-blue-500 w-11/12" />
                  </div>
                  <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                    92/100
                  </span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "leather journal",
                    "vintage notebook",
                    "personalized gift",
                    "bullet journal",
                    "travel diary",
                    "handmade journal",
                    "writer gift",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="bg-linear-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 text-teal-700 dark:text-teal-400 text-xs px-2 py-1 rounded border border-teal-200 dark:border-teal-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <p className="text-sm text-teal-700 dark:text-teal-400 font-medium">
                  Benefits: Targeted keywords, better SEO, increased visibility
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-linear-to-br from-teal-50 to-blue-50 dark:from-teal-900/30 dark:to-blue-900/30 border border-teal-200 dark:border-teal-800 rounded-full px-6 py-3">
            <svg
              className="w-5 h-5 text-teal-600 dark:text-teal-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <title>Trending up icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              Average score improvement:{" "}
              <span className="text-teal-600 dark:text-teal-400">
                +67 points
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
