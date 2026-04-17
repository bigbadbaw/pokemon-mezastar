import { z } from "zod/v4";

const pokemonTypeSchema = z.enum([
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
]);

const mezaGradeSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3),
  z.literal(4), z.literal(5), z.literal(6),
]).default(1);

const tagStatsSchema = z.object({
  hp: z.coerce.number().int().nonnegative().default(0),
  attack: z.coerce.number().int().nonnegative().default(0),
  defense: z.coerce.number().int().nonnegative().default(0),
  specialAttack: z.coerce.number().int().nonnegative().default(0),
  specialDefense: z.coerce.number().int().nonnegative().default(0),
  speed: z.coerce.number().int().nonnegative().default(0),
});

export const scanResultSchema = z.object({
  tag: z.object({
    pokemonName: z.string().min(1),
    collectionNumber: z.string().min(1),
    energy: z.coerce.number().int().positive(),
    grade: mezaGradeSchema,
    types: z.array(pokemonTypeSchema).max(2).default([]),
    moves: z.array(z.string().min(1)).default([]),
    stats: tagStatsSchema,
    imageUrl: z.string().url().optional(),
  }),
  confidence: z.coerce.number().min(0).max(1),
  rawResponse: z.string(),
});

const battleOpponentSchema = z.object({
  pokemonName: z.string().min(1),
  types: z.array(pokemonTypeSchema).max(2).default([]),
  estimatedEnergy: z.coerce
    .number()
    .int()
    .positive()
    .nullable()
    .optional()
    .default(null),
});

export const battleAnalysisSchema = z.object({
  opponents: z.array(battleOpponentSchema).min(1).max(3),
  recommendations: z.array(
    z.object({
      team: z.array(z.unknown()).min(1).max(3),
      reasoning: z.string().min(1),
      typeAdvantages: z.array(z.string()).default([]),
      overallScore: z.coerce.number().min(0).max(100),
    }),
  ),
});
