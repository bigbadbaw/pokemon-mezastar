export type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export type MezaGrade = 1 | 2 | 3 | 4 | 5 | 6;

export interface TagStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface MezaTag {
  id?: number;
  pokemonName: string;
  collectionNumber: string;
  energy: number;
  grade: MezaGrade;
  types: [PokemonType] | [PokemonType, PokemonType];
  moves: string[];
  stats: TagStats;
  imageUrl?: string;
  scannedAt: Date;
}

export interface ScanResult {
  tag: Omit<MezaTag, "id" | "scannedAt">;
  confidence: number;
  rawResponse: string;
}

export interface BattleOpponent {
  pokemonName: string;
  types: [PokemonType] | [PokemonType, PokemonType];
  estimatedEnergy?: number | null;
}

export interface TeamRecommendation {
  team: MezaTag[];
  reasoning: string;
  typeAdvantages: string[];
  overallScore: number;
}

export interface BattleAnalysis {
  opponents: BattleOpponent[];
  recommendations: TeamRecommendation[];
}

export type Effectiveness = 0 | 0.25 | 0.5 | 1 | 2 | 4;

export interface ApiResult<T> {
  data?: T;
  error?: string;
}
