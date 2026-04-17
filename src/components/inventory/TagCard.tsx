"use client";

import { type MezaTag } from "@/lib/types";
import { GRADE_LABELS, GRADE_COLORS, TYPE_COLORS } from "@/lib/constants";

interface TagCardProps {
  tag: MezaTag;
  onSelect?: (tag: MezaTag) => void;
}

export function TagCard({ tag, onSelect }: TagCardProps) {
  const totalStats = Object.values(tag.stats).reduce(
    (sum, value) => sum + value,
    0,
  );
  const firstType = tag.types[0];

  return (
    <button
      onClick={() => onSelect?.(tag)}
      className="relative min-h-[44px] w-full overflow-hidden rounded-xl bg-gray-800/50 p-3 pl-4 text-left transition-colors hover:bg-gray-800/70"
      aria-label={`${tag.pokemonName} tag, ${GRADE_LABELS[tag.grade]}, Energy ${tag.energy}, Total stats ${totalStats}`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${TYPE_COLORS[firstType]}`}
        aria-hidden
      />

      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-bold">{tag.pokemonName}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${GRADE_COLORS[tag.grade]}`}
        >
          {GRADE_LABELS[tag.grade]}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        {tag.types.map((t) => (
          <span
            key={t}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize text-white ${TYPE_COLORS[t]}`}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span className="font-semibold">Total: {totalStats}</span>
        <span>Energy {tag.energy}</span>
      </div>
    </button>
  );
}
