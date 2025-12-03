/** biome-ignore-all lint/complexity/useOptionalChain: Needed for rate limit error */
import { useMutation } from "@tanstack/react-query";
import type { OptimizationResult } from "@/types";

interface OptimizeRequest {
  url: string;
  email: string;
  name: string;
}

export interface RateLimitError extends Error {
  rateLimitExceeded?: boolean;
  contactEmail?: string;
  remaining?: number;
  maxPerDay?: number;
}

const optimizeListing = async (
  request: OptimizeRequest,
): Promise<OptimizationResult> => {
  let response: Response;

  try {
    response = await fetch("/api/optimizer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: request.url,
        email: request.email,
        name: request.name,
      }),
    });
  } catch (error) {
    // Handle network errors (no internet, server unreachable, etc.)
    console.error("Network error:", error);
    throw new Error(
      "Connection failed. Please check your internet connection and try again.",
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Failed to optimize listing. Please try again.",
    }));
    const rateLimitError: RateLimitError = new Error(
      error.error || "Failed to optimize listing. Please try again.",
    );
    if (response.status === 429) {
      rateLimitError.rateLimitExceeded = true;
      // Ensure contactEmail is properly extracted from the error response
      rateLimitError.contactEmail =
        error.contactEmail && error.contactEmail.trim()
          ? error.contactEmail.trim()
          : undefined;
      rateLimitError.remaining = error.remaining ?? 0;
      rateLimitError.maxPerDay = error.maxPerDay ?? 5;
    }
    throw rateLimitError;
  }

  return response.json();
};

export function useOptimize() {
  return useMutation({
    mutationFn: optimizeListing,
  });
}
