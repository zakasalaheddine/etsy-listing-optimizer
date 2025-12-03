"use client";

import type React from "react";
import { useState } from "react";

interface OptimizerFormProps {
  name: string | null;
  email: string | null;
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUserInfoSubmitted: (name: string, email: string) => void;
  isLoading: boolean;
}

export default function OptimizerForm({
  name,
  email,
  url,
  setUrl,
  onSubmit,
  onUserInfoSubmitted,
  isLoading,
}: OptimizerFormProps) {
  const [localName, setLocalName] = useState("");
  const [localEmail, setLocalEmail] = useState("");
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasUserInfo = name && email;

  const handleUserInfoSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError(null);
    setIsSubmittingInfo(true);

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: localName, email: localEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit information");
      }

      const data = await response.json();
      onUserInfoSubmitted(data.name, data.email);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit information",
      );
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!hasUserInfo) {
      event.preventDefault();
      handleUserInfoSubmit(event);
    } else {
      onSubmit(event);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
        {hasUserInfo
          ? "Optimize your Etsy listing"
          : "Enter your information to optimize your listing"}
      </h2>

      {hasUserInfo && (
        <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-md">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            Optimizing for:{" "}
            <span className="font-medium text-teal-600 dark:text-teal-400">
              {name} ({email})
            </span>
          </p>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {!hasUserInfo && (
          <>
            <div>
              <label
                htmlFor="name-input"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Name
              </label>
              <input
                id="name-input"
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={isSubmittingInfo || isLoading}
                required
              />
            </div>
            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={isSubmittingInfo || isLoading}
                required
              />
            </div>
          </>
        )}

        <div>
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
              disabled={isSubmittingInfo || isLoading}
              required
            />
            <button
              type="submit"
              disabled={isSubmittingInfo || isLoading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmittingInfo
                ? "Saving..."
                : isLoading
                  ? "Optimizing..."
                  : "Generate"}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md"
            role="alert"
          >
            <p className="text-sm">{error}</p>
          </div>
        )}
      </form>
    </div>
  );
}
