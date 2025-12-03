interface UrlInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export default function UrlInputForm({
  url,
  setUrl,
  onSubmit,
  isLoading,
}: UrlInputFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md"
    >
      <label
        htmlFor="url-input"
        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
      >
        Etsy Listing URL
      </label>
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          id="url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.etsy.com/listing/..."
          className="grow block w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Optimizing..." : "Generate"}
        </button>
      </div>
    </form>
  );
}
