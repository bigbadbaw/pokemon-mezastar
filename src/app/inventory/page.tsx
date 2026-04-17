"use client";

import { useState, useMemo } from "react";
import { useInventory } from "@/hooks/useInventory";
import {
  FilterBar,
  type SortOrder,
} from "@/components/inventory/FilterBar";
import { TagGrid } from "@/components/inventory/TagGrid";
import {
  type PokemonType,
  type MezaGrade,
  type MezaTag,
} from "@/lib/types";

export default function InventoryPage() {
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<MezaGrade | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOrder>("recent");

  const trimmedQuery = searchQuery.trim();
  const hasFilters =
    selectedType !== null || selectedGrade !== null || trimmedQuery !== "";

  const { tags: allTags, isLoading: isLoadingAll } = useInventory();
  const { tags: filteredTags, isLoading } = useInventory({
    type: selectedType ?? undefined,
    grade: selectedGrade ?? undefined,
    search: trimmedQuery || undefined,
  });

  const sortedTags = useMemo(() => {
    const arr = [...filteredTags];
    switch (sortBy) {
      case "recent":
        return arr.sort(
          (a, b) => b.scannedAt.getTime() - a.scannedAt.getTime(),
        );
      case "energy-desc":
        return arr.sort((a, b) => b.energy - a.energy);
      case "grade-desc":
        return arr.sort((a, b) => b.grade - a.grade);
      case "name-asc":
        return arr.sort((a, b) =>
          a.pokemonName.localeCompare(b.pokemonName),
        );
    }
  }, [filteredTags, sortBy]);

  function handleSelectTag(tag: MezaTag) {
    window.alert(JSON.stringify(tag, null, 2));
  }

  const totalCount = allTags.length;
  const filteredCount = sortedTags.length;
  const isBusy = isLoading || isLoadingAll;

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0a0a1a]/95 px-6 py-4 backdrop-blur-md">
        <h1 className="mb-4 text-3xl font-bold">Tag Inventory</h1>
        <FilterBar
          selectedType={selectedType ?? undefined}
          selectedGrade={selectedGrade ?? undefined}
          searchQuery={searchQuery}
          sortOrder={sortBy}
          onTypeChange={(t) => setSelectedType(t ?? null)}
          onGradeChange={(g) => setSelectedGrade(g ?? null)}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
        />
      </div>

      <div className="px-6 pb-8 pt-4">
        <p className="mb-4 text-sm text-gray-400" aria-live="polite">
          {hasFilters && totalCount > 0
            ? `${filteredCount} of ${totalCount} tags`
            : `${totalCount} ${totalCount === 1 ? "tag" : "tags"}`}
        </p>

        {isBusy ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading inventory...
          </div>
        ) : (
          <TagGrid
            tags={sortedTags}
            onSelectTag={handleSelectTag}
            isFiltered={hasFilters && totalCount > 0}
          />
        )}
      </div>
    </div>
  );
}
