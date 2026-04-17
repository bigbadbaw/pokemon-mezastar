"use client";

import { Search } from "lucide-react";
import { type PokemonType, type MezaGrade } from "@/lib/types";
import { GRADE_LABELS, GRADE_COLORS, TYPE_COLORS } from "@/lib/constants";

export type SortOrder = "recent" | "energy-desc" | "grade-desc" | "name-asc";

interface FilterBarProps {
  selectedType: PokemonType | undefined;
  selectedGrade: MezaGrade | undefined;
  searchQuery: string;
  sortOrder: SortOrder;
  onTypeChange: (type: PokemonType | undefined) => void;
  onGradeChange: (grade: MezaGrade | undefined) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortOrder) => void;
}

const ALL_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

const ALL_GRADES: MezaGrade[] = [1, 2, 3, 4, 5, 6];

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
  { value: "recent", label: "Recent" },
  { value: "energy-desc", label: "Energy \u2193" },
  { value: "grade-desc", label: "Grade \u2193" },
  { value: "name-asc", label: "Name A-Z" },
];

export function FilterBar({
  selectedType,
  selectedGrade,
  searchQuery,
  sortOrder,
  onTypeChange,
  onGradeChange,
  onSearchChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search Pokémon..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="min-h-[44px] w-full rounded-lg bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#e94560]"
          aria-label="Search by Pokémon name"
        />
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="radiogroup"
        aria-label="Filter by type"
      >
        <button
          onClick={() => onTypeChange(undefined)}
          className={`min-h-[44px] shrink-0 rounded-full px-4 text-xs font-semibold transition ${
            selectedType === undefined
              ? "bg-white text-black"
              : "bg-white/10 text-white opacity-70 hover:opacity-100"
          }`}
          role="radio"
          aria-checked={selectedType === undefined}
        >
          All
        </button>
        {ALL_TYPES.map((t) => {
          const isActive = selectedType === t;
          return (
            <button
              key={t}
              onClick={() => onTypeChange(isActive ? undefined : t)}
              className={`min-h-[44px] shrink-0 rounded-full px-4 text-xs font-semibold capitalize text-white transition ${TYPE_COLORS[t]} ${
                isActive
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a1a]"
                  : "opacity-60 hover:opacity-100"
              }`}
              role="radio"
              aria-checked={isActive}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-2"
        role="radiogroup"
        aria-label="Filter by grade"
      >
        <button
          onClick={() => onGradeChange(undefined)}
          className={`min-h-[44px] shrink-0 rounded-full px-4 text-xs font-semibold transition ${
            selectedGrade === undefined
              ? "bg-white text-black"
              : "bg-white/10 text-white opacity-70 hover:opacity-100"
          }`}
          role="radio"
          aria-checked={selectedGrade === undefined}
        >
          All
        </button>
        {ALL_GRADES.map((g) => {
          const isActive = selectedGrade === g;
          return (
            <button
              key={g}
              onClick={() => onGradeChange(isActive ? undefined : g)}
              className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 text-xs font-semibold text-white transition ${GRADE_COLORS[g]} ${
                isActive
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a1a]"
                  : "opacity-60 hover:opacity-100"
              }`}
              role="radio"
              aria-checked={isActive}
            >
              {GRADE_LABELS[g]}
            </button>
          );
        })}
      </div>

      <select
        value={sortOrder}
        onChange={(e) => onSortChange(e.target.value as SortOrder)}
        className="min-h-[44px] rounded-lg border border-white/20 bg-gray-800 px-4 py-2 text-sm text-white"
        aria-label="Sort tags"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
