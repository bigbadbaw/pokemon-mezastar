import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod/v4";
import { POKEMON_TYPES } from "./constants";
import { type PokemonType, type TagStats } from "./types";

const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(CACHE_DIR, "pokeapi-cache.json");
const POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon";
const MOVE_LIMIT = 20;

export interface PokeApiData {
  types: PokemonType[];
  stats: TagStats;
  moves: string[];
  imageUrl?: string;
}

const pokeApiResponseSchema = z.object({
  types: z.array(z.object({ type: z.object({ name: z.string() }) })),
  stats: z.array(
    z.object({
      base_stat: z.number(),
      stat: z.object({ name: z.string() }),
    }),
  ),
  moves: z.array(z.object({ move: z.object({ name: z.string() }) })),
  sprites: z.object({
    front_default: z.string().nullable(),
    other: z
      .object({
        "official-artwork": z
          .object({ front_default: z.string().nullable() })
          .optional(),
      })
      .optional(),
  }),
});

export function normalizePokemonName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/['.’]/g, "")
    .replace(/\s+/g, "-");
}

let cache: Record<string, PokeApiData> | null = null;

async function loadCache(): Promise<Record<string, PokeApiData>> {
  if (cache) return cache;
  try {
    const text = await fs.readFile(CACHE_FILE, "utf-8");
    cache = JSON.parse(text) as Record<string, PokeApiData>;
  } catch {
    cache = {};
  }
  return cache;
}

async function saveCache(): Promise<void> {
  if (!cache) return;
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    console.error("pokeapi: failed to persist cache", err);
  }
}

function mapStatName(name: string): keyof TagStats | null {
  switch (name) {
    case "hp":
      return "hp";
    case "attack":
      return "attack";
    case "defense":
      return "defense";
    case "special-attack":
      return "specialAttack";
    case "special-defense":
      return "specialDefense";
    case "speed":
      return "speed";
    default:
      return null;
  }
}

export async function fetchPokemon(
  rawName: string,
): Promise<PokeApiData | null> {
  const key = normalizePokemonName(rawName);
  if (!key) return null;

  const cached = await loadCache();
  if (cached[key]) return cached[key];

  let response: Response;
  try {
    response = await fetch(`${POKEAPI_URL}/${key}`);
  } catch (err) {
    console.error("pokeapi: fetch failed", err);
    return null;
  }

  if (!response.ok) {
    console.warn(`pokeapi: ${response.status} for "${key}"`);
    return null;
  }

  const json: unknown = await response.json();
  const parsed = pokeApiResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error("pokeapi: response validation failed", parsed.error.issues);
    return null;
  }

  const types = parsed.data.types
    .map((t) => t.type.name.toLowerCase())
    .filter((t): t is PokemonType =>
      (POKEMON_TYPES as readonly string[]).includes(t),
    );

  const stats: TagStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
  for (const s of parsed.data.stats) {
    const statKey = mapStatName(s.stat.name);
    if (statKey) stats[statKey] = s.base_stat;
  }

  const moves = parsed.data.moves
    .slice(0, MOVE_LIMIT)
    .map((m) => m.move.name.replace(/-/g, " "));

  const imageUrl =
    parsed.data.sprites.other?.["official-artwork"]?.front_default ??
    parsed.data.sprites.front_default ??
    undefined;

  const data: PokeApiData = {
    types,
    stats,
    moves,
    ...(imageUrl ? { imageUrl } : {}),
  };
  cached[key] = data;
  await saveCache();
  return data;
}
