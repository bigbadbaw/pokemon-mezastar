"use client";

import { useState, useCallback } from "react";
import { type BattleAnalysis, type ApiResult } from "@/lib/types";

interface UseBattleAdvisorReturn {
  analysis: BattleAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  analyze: (imageData: string) => Promise<void>;
  reset: () => void;
}

export function useBattleAdvisor(): UseBattleAdvisorReturn {
  const [analysis, setAnalysis] = useState<BattleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (imageData: string) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/battle-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const result: ApiResult<BattleAnalysis> = await response.json();

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setAnalysis(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return { analysis, isAnalyzing, error, analyze, reset };
}
