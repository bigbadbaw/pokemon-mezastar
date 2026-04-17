"use client";

import { type ScanResult } from "@/lib/types";
import { GRADE_LABELS, GRADE_COLORS, TYPE_COLORS } from "@/lib/constants";

interface TagPreviewProps {
  result: ScanResult;
  onConfirm: () => void;
  onRetry: () => void;
}

const STAT_LABELS: Array<{
  key: keyof ScanResult["tag"]["stats"];
  label: string;
  color: string;
}> = [
  { key: "hp", label: "HP", color: "text-yellow-400" },
  { key: "attack", label: "Atk", color: "text-red-400" },
  { key: "defense", label: "Def", color: "text-red-400" },
  { key: "specialAttack", label: "SpAtk", color: "text-blue-400" },
  { key: "specialDefense", label: "SpDef", color: "text-blue-400" },
  { key: "speed", label: "Spd", color: "text-green-400" },
];

export function TagPreview({ result, onConfirm, onRetry }: TagPreviewProps) {
  const { tag, confidence } = result;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">{tag.pokemonName}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${GRADE_COLORS[tag.grade]}`}
        >
          {GRADE_LABELS[tag.grade]}
        </span>
      </div>

      <div className="mb-4">
        <span className="text-sm text-gray-400">Types</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {tag.types.map((t) => (
            <span
              key={t}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize text-white ${TYPE_COLORS[t]}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-400">Energy</span>
          <p className="font-semibold">{tag.energy}</p>
        </div>
        <div>
          <span className="text-gray-400">Confidence</span>
          <p className="font-semibold">{Math.round(confidence * 100)}%</p>
        </div>
      </div>

      <div className="mb-4">
        <span className="text-sm text-gray-400">Moves</span>
        <p className="text-sm font-semibold">{tag.moves.join(", ")}</p>
      </div>

      <div className="mb-6">
        <span className="text-sm text-gray-400">Stats</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {STAT_LABELS.map(({ key, label, color }) => (
            <div
              key={key}
              className="rounded-lg bg-white/5 p-2 text-center"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
              </div>
              <div className={`text-lg font-bold ${color}`}>
                {tag.stats[key]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className="min-h-[44px] flex-1 rounded-xl bg-[#e94560] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#d63d56]"
          aria-label="Save tag to inventory"
        >
          Save Tag
        </button>
        <button
          onClick={onRetry}
          className="min-h-[44px] rounded-xl border border-white/20 px-4 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          aria-label="Scan again"
        >
          Scan Again
        </button>
      </div>
    </div>
  );
}
