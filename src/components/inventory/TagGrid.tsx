"use client";

import Link from "next/link";
import { type MezaTag } from "@/lib/types";
import { TagCard } from "./TagCard";

interface TagGridProps {
  tags: MezaTag[];
  onSelectTag?: (tag: MezaTag) => void;
  isFiltered?: boolean;
}

export function TagGrid({ tags, onSelectTag, isFiltered = false }: TagGridProps) {
  if (tags.length === 0) {
    if (isFiltered) {
      return (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-lg font-semibold text-gray-200">
            No tags match your filters
          </p>
          <p className="text-sm text-gray-500">
            Try clearing filters or searching a different name
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-lg font-semibold text-gray-200">
          No tags yet — start scanning!
        </p>
        <Link
          href="/scanner"
          className="inline-flex min-h-[44px] items-center rounded-xl bg-[#e94560] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#d63d56]"
        >
          Scan Your First Tag
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tags.map((tag) => (
        <TagCard key={tag.id} tag={tag} onSelect={onSelectTag} />
      ))}
    </div>
  );
}
