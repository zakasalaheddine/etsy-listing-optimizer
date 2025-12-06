"use client";

import { useEffect, useState } from "react";

export default function AnalyticsDisplay() {
  const [totalOptimizations, setTotalOptimizations] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setTotalOptimizations(data.totalOptimizations);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (isLoading || totalOptimizations === null) {
    return null;
  }

  return (
    <div className="text-sm text-slate-400 mt-3">
      <p className="font-semibold text-teal-400">
        {totalOptimizations.toLocaleString()} listings optimized
      </p>
    </div>
  );
}
