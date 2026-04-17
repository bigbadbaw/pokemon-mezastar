import { ChevronDown } from "lucide-react";
import { TYPE_COLORS, GRADE_COLORS, GRADE_LABELS } from "@/lib/constants";
import { getTypeEffectiveness } from "@/lib/pokemon-types";
import { type PokemonType, type MezaGrade } from "@/lib/types";

const ALL_TYPES: PokemonType[] = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

const ALL_GRADES: MezaGrade[] = [1, 2, 3, 4, 5, 6];

interface TypeMatchups {
  superEffective: PokemonType[];
  notVeryEffective: PokemonType[];
  noEffect: PokemonType[];
}

function computeMatchups(attackType: PokemonType): TypeMatchups {
  const matchups: TypeMatchups = {
    superEffective: [],
    notVeryEffective: [],
    noEffect: [],
  };
  for (const defender of ALL_TYPES) {
    const eff = getTypeEffectiveness(attackType, [defender]);
    if (eff === 2) matchups.superEffective.push(defender);
    else if (eff === 0.5) matchups.notVeryEffective.push(defender);
    else if (eff === 0) matchups.noEffect.push(defender);
  }
  return matchups;
}

const MATCHUP_MAP: Record<PokemonType, TypeMatchups> = ALL_TYPES.reduce(
  (acc, t) => {
    acc[t] = computeMatchups(t);
    return acc;
  },
  {} as Record<PokemonType, TypeMatchups>,
);

const GRADE_MARKS: Record<MezaGrade, string> = {
  1: "\u25c6",
  2: "\u25c6\u25c6",
  3: "\u25c6\u25c6\u25c6",
  4: "\u25c6\u25c6\u25c6\u25c6",
  5: "\u2605",
  6: "\u2605\u2605",
};

const GRADE_DESCRIPTIONS: Record<MezaGrade, string> = {
  1: "Basic tags — entry-level stats. Common drops, good for starting out.",
  2: "Slightly better base stats than Grade 1. Still very common.",
  3: "Mid-tier normal tags with noticeably stronger stats.",
  4: "Top-tier normal tags. Strong base stats across the board.",
  5: "Star tags — powerful Pokémon with high Energy. Uncommon.",
  6: "Superstar tags — the rarest and strongest tags in the game.",
};

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = false, children }: SectionProps) {
  return (
    <details
      className="group overflow-hidden rounded-xl border border-white/10 bg-[#1a1a2e]"
      open={defaultOpen}
    >
      <summary className="flex min-h-[44px] cursor-pointer select-none list-none items-center justify-between p-4 font-semibold text-white [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown
          size={20}
          className="text-gray-400 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t border-white/10 p-4">{children}</div>
    </details>
  );
}

interface TypeGroupProps {
  label: string;
  types: PokemonType[];
}

function TypeGroup({ label, types }: TypeGroupProps) {
  if (types.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="w-36 shrink-0 text-gray-400">{label}</span>
      <div className="flex flex-wrap gap-1">
        {types.map((t) => (
          <span
            key={t}
            className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize text-white ${TYPE_COLORS[t]}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StrategyPage() {
  return (
    <div className="px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Strategy Guide</h1>
        <p className="mt-2 text-gray-400">
          Tips, type charts, and strategies for Pokémon Mezastar
        </p>
      </header>

      <div className="space-y-3">
        <Section title="Type Effectiveness" defaultOpen>
          <div className="space-y-3">
            {ALL_TYPES.map((t) => {
              const matchups = MATCHUP_MAP[t];
              return (
                <div key={t} className="rounded-lg bg-white/5 p-3">
                  <div className="mb-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold capitalize text-white ${TYPE_COLORS[t]}`}
                    >
                      {t}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <TypeGroup
                      label="Super effective vs"
                      types={matchups.superEffective}
                    />
                    <TypeGroup
                      label="Not very effective vs"
                      types={matchups.notVeryEffective}
                    />
                    <TypeGroup
                      label="No effect on"
                      types={matchups.noEffect}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Grade Guide">
          <div className="space-y-3">
            {ALL_GRADES.map((g) => (
              <div
                key={g}
                className="flex items-start gap-4 rounded-lg bg-white/5 p-4"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${GRADE_COLORS[g]}`}
                >
                  {g}
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold">{GRADE_LABELS[g]}</span>
                    <span
                      className="font-mono text-sm text-yellow-400"
                      aria-label={`Grade ${g} marking`}
                    >
                      {GRADE_MARKS[g]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {GRADE_DESCRIPTIONS[g]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Battle Tips">
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <strong className="text-white">3v3 lane placement:</strong> put
              your strongest type advantage in the lane facing the toughest
              opponent — the cabinet matches lane positions left to right.
            </li>
            <li>
              <strong className="text-white">Timing roulette:</strong> tap
              when the marker is in the gold zone for bonus damage; the silver
              zone still lands, but misses halve your output.
            </li>
            <li>
              <strong className="text-white">Get Gauge strategy:</strong>{" "}
              focus attacks on one opponent to fill the Get Gauge faster —
              scattering damage slows the meter.
            </li>
            <li>
              <strong className="text-white">Extra 100¥ continue:</strong> use
              it when the Get Gauge is close to full and you have a clean catch
              attempt; it guarantees one of the three opposing Pokémon.
            </li>
          </ul>
        </Section>

        <Section title="Tag Scanning Tips">
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <strong className="text-white">Flat, well-lit surface:</strong>{" "}
              lay the tag face-up on a table under even lighting.
            </li>
            <li>
              <strong className="text-white">Avoid glare and shadows:</strong>{" "}
              angle the tag away from direct overhead light so the QR code
              stays readable.
            </li>
            <li>
              <strong className="text-white">Center in the viewfinder:</strong>{" "}
              align the tag with the stadium-shaped outline in the scanner —
              the whole tag should fit inside.
            </li>
            <li>
              <strong className="text-white">Use the rear camera:</strong>{" "}
              iPad rear cameras give sharper focus on small text than the
              front-facing one.
            </li>
          </ul>
        </Section>

        <Section title="Mezastar Basics">
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <h4 className="mb-1 font-semibold text-white">
                What is Mezastar?
              </h4>
              <p>
                Pokémon Mezastar is an arcade game by Takara Tomy A.R.T.S. and
                Marvelous. Players collect physical stadium-shaped tags
                (36×64×3.5mm) with QR codes on the reverse, then place them
                on the arcade cabinet to battle.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-white">
                How a round works
              </h4>
              <ol className="list-inside list-decimal space-y-1">
                <li>Insert 100¥ to start a game.</li>
                <li>Place up to 3 tags in the blue lanes on the cabinet.</li>
                <li>Battle 3v3 against wild Pokémon using timing roulettes.</li>
                <li>
                  Fill the Get Gauge during battle to attempt a catch — win
                  a new tag for your collection.
                </li>
              </ol>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-white">Memory Tag</h4>
              <p>
                The red Memory Tag records your player progress between
                sessions and unlocks extra Trainers as you play.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-white">
                Special Tag Battle
              </h4>
              <p>
                A co-op mode that connects two adjacent arcade cabinets.
                Super Star Pokémon can appear during these battles for a
                chance at rare tags.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
