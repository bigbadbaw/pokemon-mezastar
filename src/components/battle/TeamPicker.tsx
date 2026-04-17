"use client";

import { type TeamRecommendation } from "@/lib/types";

interface TeamPickerProps {
  recommendations: TeamRecommendation[];
}

export function TeamPicker({ recommendations }: TeamPickerProps) {
  if (recommendations.length === 0) {
    return (
      <p className="text-center text-gray-500">
        Analyze a battle to see team recommendations
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Recommended Teams
      </h3>
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="rounded-xl border border-white/10 bg-[#1a1a2e] p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold">Team {i + 1}</span>
            <span className="rounded-full bg-[#e94560]/20 px-3 py-1 text-xs font-semibold text-[#e94560]">
              Score: {rec.overallScore}
            </span>
          </div>
          <div className="mb-2 flex flex-wrap gap-2">
            {rec.team.map((tag) => (
              <span
                key={tag.id}
                className="rounded-lg bg-white/10 px-3 py-1 text-sm"
              >
                {tag.pokemonName}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-400">{rec.reasoning}</p>
          {rec.typeAdvantages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {rec.typeAdvantages.map((adv) => (
                <span
                  key={adv}
                  className="rounded bg-green-500/20 px-2 py-0.5 text-xs text-green-400"
                >
                  {adv}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
