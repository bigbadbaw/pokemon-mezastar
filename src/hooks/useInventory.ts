"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { type MezaTag, type PokemonType, type MezaGrade } from "@/lib/types";

interface InventoryFilters {
  type?: PokemonType;
  grade?: MezaGrade;
  search?: string;
}

export function useInventory(filters?: InventoryFilters) {
  const tags = useLiveQuery(async () => {
    const collection = db.tags.orderBy("scannedAt");

    let results = await collection.reverse().toArray();

    if (filters?.type) {
      results = results.filter((tag) => tag.types.includes(filters.type!));
    }
    if (filters?.grade) {
      results = results.filter((tag) => tag.grade === filters.grade);
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      results = results.filter((tag) =>
        tag.pokemonName.toLowerCase().includes(query),
      );
    }

    return results;
  }, [filters?.type, filters?.grade, filters?.search]);

  async function addTag(tag: Omit<MezaTag, "id">): Promise<number | undefined> {
    return db.tags.add(tag as MezaTag);
  }

  async function deleteTag(id: number): Promise<void> {
    await db.tags.delete(id);
  }

  async function getTagCount(): Promise<number> {
    return db.tags.count();
  }

  async function getTagsByType(type: PokemonType): Promise<MezaTag[]> {
    return db.tags.where("types").equals(type).toArray();
  }

  async function getTagsByGrade(grade: MezaGrade): Promise<MezaTag[]> {
    return db.tags.where("grade").equals(grade).toArray();
  }

  async function searchTags(query: string): Promise<MezaTag[]> {
    const lowered = query.toLowerCase();
    return db.tags
      .filter((tag) => tag.pokemonName.toLowerCase().includes(lowered))
      .toArray();
  }

  return {
    tags: tags ?? [],
    isLoading: tags === undefined,
    addTag,
    deleteTag,
    getTagCount,
    getTagsByType,
    getTagsByGrade,
    searchTags,
  };
}
