"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useOptimize } from "@/hooks/use-optimize";
import type { OptimizationResult } from "@/types";
import LoadingSpinner from "./loading-spinner";
import OptimizerForm from "./optimizer-form";
import ResultsDisplay from "./results-display";

export default function OptimizerTool() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);

  const optimizeMutation = useOptimize();

  // Load name and email from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem("optimizer_name");
    const storedEmail = localStorage.getItem("optimizer_email");
    if (storedName) {
      setName(storedName);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const [pendingUrl, setPendingUrl] = useState<string>("");

  const handleUserInfoSubmitted = useCallback(
    (submittedName: string, submittedEmail: string) => {
      setName(submittedName);
      setEmail(submittedEmail);
      localStorage.setItem("optimizer_name", submittedName);
      localStorage.setItem("optimizer_email", submittedEmail);
      // If URL was filled when submitting user info, store it for auto-optimization
      if (url.trim()) {
        setPendingUrl(url);
      }
    },
    [url],
  );

  // Auto-trigger optimization when user info becomes available and URL is pending
  useEffect(() => {
    if (name && email && pendingUrl && !optimizeMutation.isPending) {
      const urlToOptimize = pendingUrl;
      setUrl(urlToOptimize);
      setPendingUrl("");

      // Trigger optimization directly
      setLoadingMessage("Analyzing listing URL...");
      setOptimizationResult(null);

      optimizeMutation
        .mutateAsync({
          url: urlToOptimize,
          email,
          name,
        })
        .then((result) => {
          if (result) {
            setOptimizationResult(result);
            setLoadingMessage("Checking listing and generating SEO...");
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          setLoadingMessage("");
        });
    }
  }, [name, email, pendingUrl, optimizeMutation]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!url || !email || !name) {
        return;
      }

      setLoadingMessage("Analyzing listing URL...");
      setOptimizationResult(null);

      try {
        const optimizationResult = await optimizeMutation.mutateAsync({
          url,
          email,
          name,
        });

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
    [url, email, name, optimizeMutation],
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
          <OptimizerForm
            name={name}
            email={email}
            url={url}
            setUrl={setUrl}
            onSubmit={handleSubmit}
            onUserInfoSubmitted={handleUserInfoSubmitted}
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
