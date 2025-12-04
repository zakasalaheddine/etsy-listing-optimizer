export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-teal-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            <span className="block">AI-Powered</span>
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-teal-500 via-blue-500 to-indigo-500">
              Etsy Listing Optimizer
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Turn your Etsy listings into sales magnets with AI-optimized titles,
            descriptions, and tags
          </p>
        </div>
      </div>
    </section>
  );
}
