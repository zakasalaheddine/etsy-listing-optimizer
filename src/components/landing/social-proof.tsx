export default function SocialProof() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-750 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-teal-500 to-blue-500 flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <title>User icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Built by a Developer Who Runs an Etsy Store
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 max-w-2xl">
                This tool was created out of necessity. As both a developer and
                an Etsy seller, I needed a way to optimize my listings quickly
                and effectively. Now, I'm sharing this tool with fellow sellers
                to help you boost your visibility and sales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-teal-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <title>Check icon</title>
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Real Etsy seller</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-teal-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <title>Check icon</title>
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">SEO expertise</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-teal-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <title>Check icon</title>
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">AI-powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
