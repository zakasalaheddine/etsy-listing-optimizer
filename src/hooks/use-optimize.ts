import { useMutation } from "@tanstack/react-query";
import type { OptimizationResult } from "@/types";

interface OptimizeRequest {
  url: string;
}

const optimizeListing = async (
  request: OptimizeRequest,
): Promise<OptimizationResult> => {
  const response = await fetch("/api/optimizer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: request.url }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to optimize listing");
  }

  return response.json();
};

export function useOptimize() {
  return useMutation({
    mutationFn: optimizeListing,
  });
}
