---
name: battle-advisor
description: Pokémon Mezastar arcade battle analysis and recommendation engine. Use when working on the battle page, game state recognition from arcade screen photos, 3v3 team composition, type matchup calculations, timing strategy, or catch optimization.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Battle Advisor Skill

## When to Use
- Building or modifying the battle page (`src/app/battle/`)
- Working on battle analysis logic (`src/lib/battle-engine.ts`)
- Implementing arcade screen recognition from photos
- Computing type advantages and 3v3 team recommendations
- Writing strategy guide content for the arcade game

## Mezastar Battle Format
- **3v3**: player places up to 3 tags in arcade lanes
- **Turn-based** with timing roulettes for attack power
- **Button-mashing** phases for extra damage
- **Get Gauge**: fills during battle — when full enough, catch attempt triggers
- **100 yen extra**: guarantees catching one of the three opposing Pokémon
- **Special Tag Battle**: co-op mode, two players, two connected screens, Super Star Pokémon appear

## Game State Schema
```typescript
interface MezastarGameState {
  player: {
    tags: MezastarTagInPlay[];  // up to 3 in lanes
    memoryTag: boolean;          // has memory tag inserted?
  };
  opponents: OpponentPokemon[];  // 3 wild Pokémon
  battlePhase: "selection" | "battle" | "catch" | "results";
  isSpecialTagBattle: boolean;   // dual-screen co-op mode
  getGauge: number;              // 0-100, catch threshold
}

interface MezastarTagInPlay {
  pokemon: string;
  types: string[];
  energy: number;
  grade: number;
  stats: MezastarStats;
  moves: MezastarMove[];
  lane: 1 | 2 | 3;
}

interface OpponentPokemon {
  pokemon: string;
  types: string[];
  estimatedEnergy: number;  // estimated from visual
  isStarPokemon: boolean;
  isSuperStar: boolean;
}
```

## Type Effectiveness (standard 18 types)
```typescript
// Super effective = 2x damage
// Not very effective = 0.5x damage
// Immune = 0x damage (Normal vs Ghost, etc.)
// Mezastar uses the standard mainline game type chart

const TYPE_MATCHUPS: Record<string, { superEffective: string[], notVeryEffective: string[], immune: string[] }> = {
  Fire:     { superEffective: ["Grass","Ice","Bug","Steel"], notVeryEffective: ["Fire","Water","Rock","Dragon"], immune: [] },
  Water:    { superEffective: ["Fire","Ground","Rock"], notVeryEffective: ["Water","Grass","Dragon"], immune: [] },
  Grass:    { superEffective: ["Water","Ground","Rock"], notVeryEffective: ["Fire","Grass","Poison","Flying","Bug","Dragon","Steel"], immune: [] },
  Electric: { superEffective: ["Water","Flying"], notVeryEffective: ["Electric","Grass","Dragon"], immune: ["Ground"] },
  // ... full 18-type chart in src/lib/type-chart.ts
};
```

## Recommendation Engine
1. **Identify opponent types** from arcade screen photo
2. **Find best counters** in user's inventory — prioritize super-effective coverage
3. **Optimize 3-tag lineup**:
   - Lane 1: strongest counter to the toughest opponent
   - Lane 2: type coverage for second opponent
   - Lane 3: backup/coverage for remaining weaknesses
4. **Grade matters**: higher grade = higher base stats = more forgiving
5. **Energy comparison**: user Energy vs opponent Energy gives rough power estimate
6. **Catch priority**: recommend which of the 3 opponents to target for catching (rarest first)
7. **Money advice**: recommend when the extra 100 yen for guaranteed catch is worth it (Star/Superstar tags)

## Scoring Formula
```
teamScore = sum(
  typeAdvantage(tag[i], opponent[i]) * energyRatio(tag[i], opponent[i])
  + coverageBonus(allTags, allOpponents)
)

catchValue = opponentGrade * rarityMultiplier
  - (isAvailableInCurrentSet ? 0.3 : 0)
  + (isNewToCollection ? 0.5 : 0)
```

## Timing Strategy Tips (for guide section)
- Roulette timing: aim for the golden zone — practice makes consistent
- Button mashing: steady rhythm beats random — 3-4 presses per second
- Get Gauge tips: type advantage fills it faster
- Co-op Special Tag Battles: coordinate types with partner for coverage
