"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type RateLimitError, useOptimize } from "@/hooks/use-optimize";
import type { OptimizationResult } from "@/types";
import BeforeAfter from "./landing/before-after";
import HeroCTA from "./landing/hero-cta";
import HowItWorks from "./landing/how-it-works";
import SocialProof from "./landing/social-proof";
import LoadingSpinner from "./loading-spinner";
import OptimizerForm from "./optimizer-form";
import ResultsDisplay from "./results-display";

export default function OptimizerTool() {
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [url, setUrl] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [loadingStep, setLoadingStep] = useState<number>(1);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number;
    maxPerDay: number;
    contactEmail?: string;
  } | null>(null);

  const optimizeMutation = useOptimize();
  const resultsRef = useRef<HTMLDivElement>(null);

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

  // Scroll to results when optimization completes
  useEffect(() => {
    if (optimizationResult && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [optimizationResult]);

  // Auto-trigger optimization when user info becomes available and URL is pending
  useEffect(() => {
    if (name && email && pendingUrl && !optimizeMutation.isPending) {
      const urlToOptimize = pendingUrl;
      setUrl(urlToOptimize);
      setPendingUrl("");

      // Trigger optimization directly
      setLoadingMessage("Fetching listing details...");
      setLoadingStep(1);
      setOptimizationResult(null);

      // Simulate progress steps
      setTimeout(() => {
        setLoadingMessage("Analyzing product information...");
        setLoadingStep(2);
      }, 1000);

      setTimeout(() => {
        setLoadingMessage("Generating SEO optimizations...");
        setLoadingStep(3);
      }, 2500);

      optimizeMutation
        .mutateAsync({
          url: urlToOptimize,
          email,
          name,
        })
        .then((result) => {
          if (result) {
            setOptimizationResult(result);
            if (result.rateLimit) {
              setRateLimitInfo(result.rateLimit);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          if ((err as RateLimitError).rateLimitExceeded) {
            const rateLimitErr = err as RateLimitError;
            setRateLimitInfo({
              remaining: rateLimitErr.remaining || 0,
              maxPerDay: rateLimitErr.maxPerDay || 5,
              contactEmail: rateLimitErr.contactEmail || undefined,
            });
          }
        })
        .finally(() => {
          setLoadingMessage("");
          setLoadingStep(1);
        });
    }
  }, [name, email, pendingUrl, optimizeMutation]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!url || !email || !name) {
        return;
      }

      setLoadingMessage("Fetching listing details...");
      setLoadingStep(1);
      setOptimizationResult(null);

      // Simulate progress steps
      const step2Timer = setTimeout(() => {
        setLoadingMessage("Analyzing product information...");
        setLoadingStep(2);
      }, 1000);

      const step3Timer = setTimeout(() => {
        setLoadingMessage("Generating SEO optimizations...");
        setLoadingStep(3);
      }, 2500);

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
        if (optimizationResult.rateLimit) {
          setRateLimitInfo(optimizationResult.rateLimit);
        }
      } catch (err) {
        console.error(err);
        // Clear timers on error
        clearTimeout(step2Timer);
        clearTimeout(step3Timer);
        if ((err as RateLimitError).rateLimitExceeded) {
          const rateLimitErr = err as RateLimitError;
          setRateLimitInfo({
            remaining: rateLimitErr.remaining || 0,
            maxPerDay: rateLimitErr.maxPerDay || 5,
            contactEmail: rateLimitErr.contactEmail || undefined,
          });
        }
      } finally {
        setLoadingMessage("");
        setLoadingStep(1);
      }
    },
    [url, email, name, optimizeMutation],
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section with Integrated Tool */}
      <section className="relative overflow-hidden bg-teal-50 dark:bg-slate-900">
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 mask-[linear-gradient(0deg,transparent,black)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              <span className="block">AI-Powered</span>
              <span className="block text-teal-600 dark:text-teal-400">
                Etsy Listing Optimizer
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              Turn your Etsy listings into sales magnets with AI-optimized
              titles, descriptions, and tags
            </p>
          </div>

          {/* Optimizer Tool */}
          <div className="max-w-4xl mx-auto">
            <OptimizerForm
              name={name}
              email={email}
              url={url}
              setUrl={setUrl}
              onSubmit={handleSubmit}
              onUserInfoSubmitted={handleUserInfoSubmitted}
              isLoading={optimizeMutation.isPending}
            />

            <HeroCTA />

            {rateLimitInfo && (
              <div
                className={`mt-6 border-l-4 p-4 rounded-md ${
                  rateLimitInfo.remaining === 0
                    ? "bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-400"
                    : "bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400"
                }`}
                role="alert"
              >
                <p className="font-bold">
                  {rateLimitInfo.remaining === 0
                    ? "Daily Limit Reached"
                    : "Optimizations Remaining"}
                </p>
                {rateLimitInfo.remaining === 0 ? (
                  <p>
                    Daily limit reached. Request more access:{" "}
                    <a
                      href={`mailto:${
                        rateLimitInfo.contactEmail || "salaheddine@zakadev.com"
                      }`}
                      className="underline font-semibold"
                    >
                      {rateLimitInfo.contactEmail || "salaheddine@zakadev.com"}
                    </a>
                  </p>
                ) : (
                  <p>
                    You have {rateLimitInfo.remaining} optimization
                    {rateLimitInfo.remaining !== 1 ? "s" : ""} remaining today.
                  </p>
                )}
              </div>
            )}

            {optimizeMutation.isPending && (
              <LoadingSpinner message={loadingMessage} step={loadingStep} />
            )}

            {optimizeMutation.error &&
              !(optimizeMutation.error as RateLimitError).rateLimitExceeded && (
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
          </div>
        </div>
      </section>

      {/* Results Section */}
      {optimizationResult && !optimizeMutation.isPending && (
        <section
          ref={resultsRef}
          id="results"
          className="py-12 bg-slate-50 dark:bg-slate-900"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ResultsDisplay result={optimizationResult} />
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <HowItWorks />

      {/* Before/After Section */}
      <BeforeAfter />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            Built with AI by a developer who runs an Etsy store
          </p>
          <p className="text-xs mt-2 text-slate-400">
            Using the 2025 10-Minute SEO Method with Google Gemini AI
          </p>
        </div>
      </footer>
    </div>
  );
}
