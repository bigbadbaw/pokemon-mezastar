"use client";

import { useState, useCallback } from "react";
import { type BattleOpponent, type MezaTag } from "@/lib/types";

export interface BattleAdvice {
  opponents: BattleOpponent[];
  team: MezaTag[];
  reasoning: string;
  typeAdvantages: string[];
}

interface BattleAdviceApiResponse {
  opponents: BattleOpponent[];
  recommendedTeam: Array<string | number>;
  reasoning: string;
  typeAdvantages: string[];
}

interface UseBattleAdvisorReturn {
  advice: BattleAdvice | null;
  isAnalyzing: boolean;
  error: string | null;
  analyze: (imageData: string, inventory: MezaTag[]) => Promise<void>;
  reset: () => void;
}

export function useBattleAdvisor(): UseBattleAdvisorReturn {
  const [advice, setAdvice] = useState<BattleAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (imageData: string, inventory: MezaTag[]) => {
      setIsAnalyzing(true);
      setError(null);
      setAdvice(null);

      try {
        const response = await fetch("/api/battle-advice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData, inventory }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          setError(data.error ?? `Analysis failed (HTTP ${response.status})`);
          return;
        }

        const payload = data as BattleAdviceApiResponse;
        const team: MezaTag[] = payload.recommendedTeam
          .map((id) =>
            inventory.find((tag) => String(tag.id) === String(id)),
          )
          .filter((t): t is MezaTag => Boolean(t));

        setAdvice({
          opponents: payload.opponents,
          team,
          reasoning: payload.reasoning,
          typeAdvantages: payload.typeAdvantages,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setAdvice(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return { advice, isAnalyzing, error, analyze, reset };
}
