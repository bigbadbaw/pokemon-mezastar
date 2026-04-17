# Pokémon Mezastar Companion

## Project Overview
- **Name**: Pokémon Mezastar Companion
- **Purpose**: iPad-optimized app for Mezastar tag inventory via photos, battle recommendations from game photos, and arcade strategy guides
- **GitHub**: github.com/bigbadbaw/pokemon-mezastar
- **Target**: Progressive Web App optimized for iPad (landscape + portrait)

## What is Pokémon Mezastar?
- An arcade game by Takara Tomy A.R.T.S. and Marvelous
- Uses physical collectible "tags" — stadium-shaped plastic tiles (36×64×3.5mm)
- Each tag has a QR code on the reverse containing Pokémon data
- Tags are placed in 3 blue lanes on the arcade cabinet for 3v3 battles
- Players battle wild Pokémon and catch them to receive new tags
- Available in Japan, Singapore, Malaysia, Indonesia, Hong Kong, Taiwan
- Successor to Pokémon Battrio, Tretta, and Ga-Olé

## Mezastar Tag Data
Each tag contains:
- **Pokémon name** and species
- **Energy (ポケエネ)**: overall strength indicator (like a level)
- **Grade/Rarity**: Grade 1-4 (Normal), Grade 5 (Star ★), Grade 6 (Superstar ★★)
- **Stats** (on reverse):
  - HP (yellow): damage capacity
  - Attack (red): physical move power
  - Defense (red): physical damage resistance
  - Special Attack (blue): special move power
  - Special Defense (blue): special damage resistance
  - Speed (green): turn order + dodge chance
- **Type(s)**: 1 or 2 types per Pokémon (standard 18 types)
- **Move(s)**: attacks available in battle
- **Collection number**: colored edge identifier

## Mezastar Battle Mechanics
- 3v3 format — place up to 3 tags in lanes
- Timing roulettes and button-mashing during attacks
- "Get Gauge" fills during battle — fills enough to attempt catching
- Extra 100 yen guarantees catch of one of three opposing Pokémon
- Maximum 5 tags per play
- Special Tag Battle: co-op mode connecting two cabinets
- Super Star Pokémon appear during Special Tag Battles
- Memory Tag (red) records player progress and unlocks extra Trainers

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude Vision API (tag recognition + battle analysis)
- **Database**: IndexedDB via Dexie.js (offline-first tag inventory)
- **Package Manager**: pnpm
- **PWA**: next-pwa for service worker + offline support

## Key Commands
- **Dev server**: `pnpm dev`
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Type check**: `pnpm tsc --noEmit`
- **Test**: `pnpm test`
- **Format**: `pnpm prettier --write .`

## Project Structure
```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with navigation
│   ├── page.tsx          # Dashboard / home
│   ├── scan/             # Tag scanner (camera + upload)
│   ├── inventory/        # Tag collection browser
│   ├── battle/           # Battle advisor (photo → recommendations)
│   └── guide/            # Strategy tutorials + arcade tips
├── components/           # Shared React components
│   ├── ui/               # Base UI primitives
│   ├── camera/           # Camera capture components
│   ├── tags/             # Tag display components
│   └── battle/           # Battle-related components
├── lib/                  # Core business logic
│   ├── claude-vision.ts  # Claude API integration
│   ├── inventory-db.ts   # Dexie.js database operations
│   ├── battle-engine.ts  # Battle recommendation logic
│   └── type-chart.ts     # Pokemon type effectiveness data
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
│   └── mezastar.ts       # Tag, Pokemon, Battle interfaces
└── data/                 # Static data (type charts, strategies)
    ├── type-chart.json
    └── tag-grades.json
```

## Code Conventions
- Use named exports, not default exports (except page.tsx files)
- Prefer `interface` over `type` for object shapes
- All components must be functional with hooks
- Use `async/await`, never raw `.then()` chains
- Use server actions for API calls to Claude Vision
- Error handling: use Result pattern `{ data, error }`, not try/catch in components
- All images go through `next/image` for optimization
- Touch targets minimum 44x44px for iPad usability
- Always handle loading and error states in UI

## iPad-Specific Rules
- Design for both landscape (primary) and portrait orientations
- Use CSS Grid for adaptive layouts, not fixed widths
- Camera access via `navigator.mediaDevices.getUserMedia()`
- Large, tappable buttons — this is a touch-first app
- Support pinch-to-zoom on tag images
- Bottom navigation bar (thumb-friendly on iPad)

## API Integration
- Claude Vision API endpoint: POST to `/api/analyze`
- Tag scan returns: pokémon name, energy, grade, stats, type(s), moves, collection number
- Battle analysis returns: opponent assessment, recommended tag lineup, type advantages
- Always validate API responses with Zod schemas
- Rate limit API calls — max 1 per 2 seconds from client

## Terminology — ALWAYS use these terms
- "Tag" or "Meza Tag" — NOT "card"
- "Grade" — NOT "rarity" (Grade 1-6, with 5=Star, 6=Superstar)
- "Energy (ポケエネ)" — the overall power level on the tag
- "Lanes" — the 3 slots on the arcade cabinet where tags are placed
- "Get Gauge" — the catch meter during battle
- "Memory Tag" — the red progress-tracking tag
- "Special Tag Battle" — the co-op dual-screen mode

## Git Workflow
- Branch naming: `feat/description` or `fix/description`
- Commit messages: conventional commits (feat:, fix:, chore:, docs:)
- Always run `pnpm lint && pnpm tsc --noEmit` before committing
- PR required before merging to main
