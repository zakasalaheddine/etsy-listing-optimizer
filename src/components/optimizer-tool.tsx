"use client";
import type React from "react";
import { useCallback, useState } from "react";
import type { OptimizationResult, TrademarkAnalysis } from "@/types";
import LoadingSpinner from "./loading-spinner";
import ResultsDisplay from "./results-display";
// import { extractProductDetails, generateOptimizedListing, analyzeTrademarks } from './services/geminiService'
import UrlInputForm from "./url-input-form";

export default function OptimizerTool() {
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [trademarkAnalysis, setTrademarkAnalysis] =
    useState<TrademarkAnalysis | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!url) {
        setError("Please enter a valid Etsy URL.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setOptimizationResult(null);
      setTrademarkAnalysis(null);

      try {
        setLoadingMessage("Analyzing listing URL...");
        // const details = await extractProductDetails(url);

        // if (!details || !details.description) {
        //   throw new Error("Could not extract product details from the URL.");
        // }

        // setLoadingMessage("Checking trademarks and generating SEO...");

        // // Run trademark check and SEO generation in parallel
        // const [optResult, tmResult] = await Promise.all([
        //   generateOptimizedListing(details.description),
        //   analyzeTrademarks(details.title),
        // ]);

        // setOptimizationResult(optResult);
        // setTrademarkAnalysis(tmResult);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "An unknown error occurred. Please check the URL and try again.",
        );
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
    },
    [url],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-blue-500">
            Etsy Listing Optimizer
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Paste an Etsy listing URL to generate SEO-optimized content based on
            the 2025 10-Minute Method.
            <br />
            <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
              Now includes Trademark Safety Check
            </span>
          </p>
        </header>

        <main>
          <UrlInputForm
            url={url}
            setUrl={setUrl}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />

          {isLoading && <LoadingSpinner message={loadingMessage} />}

          {error && (
            <div
              className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {optimizationResult && trademarkAnalysis && !isLoading && (
            <div className="mt-8">
              <ResultsDisplay
                result={optimizationResult}
                trademarkAnalysis={trademarkAnalysis}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
