export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-teal-50 dark:bg-slate-900">
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            <span className="block">AI-Powered</span>
            <span className="block text-teal-600 dark:text-teal-400">
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
