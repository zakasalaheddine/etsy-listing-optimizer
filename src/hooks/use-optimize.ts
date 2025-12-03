import { useMutation } from "@tanstack/react-query";
import type { OptimizationResult } from "@/types";

interface OptimizeRequest {
  url: string;
  email: string;
  name: string;
}

const optimizeListing = async (
  request: OptimizeRequest,
): Promise<OptimizationResult> => {
  const response = await fetch("/api/optimizer", {
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
