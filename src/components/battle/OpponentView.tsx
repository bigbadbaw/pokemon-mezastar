"use client";

import { type BattleOpponent } from "@/lib/types";

interface OpponentViewProps {
  opponents: BattleOpponent[];
}

export function OpponentView({ opponents }: OpponentViewProps) {
  if (opponents.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No opponents identified yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Opponents ({opponents.length})
      </h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {opponents.map((opp, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-[#1a1a2e] p-4"
          >
            <p className="font-bold">{opp.pokemonName}</p>
            <p className="text-sm text-gray-400">{opp.types.join(" / ")}</p>
            <p className="text-sm text-gray-400">
              ~{opp.estimatedEnergy} Energy
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
