import { type MezaGrade, type PokemonType } from "./types";

export const APP_NAME = "Mezastar Companion";

export const GRADE_LABELS: Record<MezaGrade, string> = {
  1: "Grade 1",
  2: "Grade 2",
  3: "Grade 3",
  4: "Grade 4",
  5: "Star \u2605",
  6: "Superstar \u2605\u2605",
};

export const GRADE_COLORS: Record<MezaGrade, string> = {
  1: "bg-gray-400",
  2: "bg-green-500",
  3: "bg-blue-500",
  4: "bg-purple-500",
  5: "bg-yellow-500",
  6: "bg-red-500",
};

export const TYPE_COLORS: Record<PokemonType, string> = {
  normal: "bg-gray-400",
  fire: "bg-orange-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-amber-600",
  flying: "bg-sky-400",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-700",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-600",
  dark: "bg-gray-700",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

export const API_RATE_LIMIT_MS = 2000;

export const MIN_TOUCH_TARGET = 44;

export const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/scanner", label: "Scan", icon: "scan" as const },
  { href: "/inventory", label: "Tags", icon: "archive" as const },
  { href: "/battle", label: "Battle", icon: "swords" as const },
  { href: "/strategy", label: "Guide", icon: "book-open" as const },
];
