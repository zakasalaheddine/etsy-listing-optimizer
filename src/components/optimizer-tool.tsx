"use client";

import type React from "react";
import { useCallback, useState } from "react";
import { useOptimize } from "@/hooks/use-optimize";
import type { OptimizationResult } from "@/types";
import LoadingSpinner from "./loading-spinner";
import ResultsDisplay from "./results-display";
import UrlInputForm from "./url-input-form";

export default function OptimizerTool() {
  const [url, setUrl] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);

  const optimizeMutation = useOptimize();

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!url) {
        return;
      }

      setLoadingMessage("Analyzing listing URL...");
      setOptimizationResult(null);

      try {
        const optimizationResult = await optimizeMutation.mutateAsync({ url });

        if (!optimizationResult) {
          throw new Error("Could not generate optimized listing.");
        }
        setOptimizationResult(optimizationResult);
        setLoadingMessage("Checking listing and generating SEO...");
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessage("");
      }
    },
    [url, optimizeMutation],
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
            isLoading={optimizeMutation.isPending}
          />

          {optimizeMutation.isPending && (
            <LoadingSpinner message={loadingMessage} />
          )}

          {optimizeMutation.error && (
            <div
              className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>
                {optimizeMutation.error instanceof Error
                  ? optimizeMutation.error.message
                  : "An unknown error occurred. Please check the URL and try again."}
              </p>
            </div>
          )}

          {optimizationResult && !optimizeMutation.isPending && (
            <div className="mt-8">
              <ResultsDisplay result={optimizationResult} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
