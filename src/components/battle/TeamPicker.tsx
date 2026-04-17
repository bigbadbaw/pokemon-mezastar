"use client";

import { type MezaTag } from "@/lib/types";
import { TagCard } from "@/components/inventory/TagCard";

interface TeamPickerProps {
  team: MezaTag[];
  reasoning: string;
  typeAdvantages: string[];
}

export function TeamPicker({
  team,
  reasoning,
  typeAdvantages,
}: TeamPickerProps) {
  if (team.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No team recommendation available
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
        Recommended Team
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {team.map((tag) => (
          <TagCard key={tag.id} tag={tag} />
        ))}
      </div>

      {reasoning && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-300">
            Why this team?
          </h4>
          <p className="text-sm text-gray-400">{reasoning}</p>
        </div>
      )}

      {typeAdvantages.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-300">
            Type advantages
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-400">
            {typeAdvantages.map((adv, i) => (
              <li key={i}>{adv}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
