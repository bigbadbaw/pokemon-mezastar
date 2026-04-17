---
name: tag-scanner
description: Pokémon Mezastar tag recognition using Claude Vision API. Use when working on the tag scanner, photo capture, tag identification, QR code reading, or inventory import features. Covers camera integration, image preprocessing, API calls, and response parsing for Mezastar's stadium-shaped plastic tags.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Tag Scanner Skill

## When to Use
- Building or modifying the tag scanner page (`src/app/scan/`)
- Working on Claude Vision API integration (`src/lib/claude-vision.ts`)
- Implementing camera capture (`src/components/camera/`)
- Parsing tag recognition results
- Adding tags to inventory from scan results

## Mezastar Tag Anatomy

### Front (obverse):
- Pokémon artwork (large, central)
- Pokémon name
- Type icon(s) — to the right of the name
- Energy value (ポケエネ) — overall power indicator
- Grade indicator (star rating)

### Back (reverse):
- QR code (machine-readable data for arcade cabinet)
- Stats grid:
  - HP (yellow)
  - Attack (red)
  - Defense (red)
  - Special Attack (blue)
  - Special Defense (blue)
  - Speed (green)
- Move name(s)
- Collection number (colored edge)

### Physical properties:
- Stadium/oval shape: 36×64×3.5mm plastic tile
- NOT rectangular like trading cards
- Glossy surface — watch for glare in photos

## Claude Vision API Call Pattern
```typescript
const response = await anthropic.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: "image/jpeg",
          data: base64Image
        }
      },
      {
        type: "text",
        text: `This is a Pokémon Mezastar tag (stadium-shaped plastic tile from the arcade game).
Identify this tag and return JSON only:
{
  "pokemon": "name",
  "energy": number,
  "grade": number (1-6, where 5=Star, 6=Superstar),
  "types": ["type1", "type2 or null"],
  "stats": {
    "hp": number,
    "attack": number,
    "defense": number,
    "specialAttack": number,
    "specialDefense": number,
    "speed": number
  },
  "moves": [{"name": "move name", "type": "move type"}],
  "collectionNumber": "string",
  "side": "front" | "back"
}
If you can only see the front, omit the stats object.
If you can only see the back, fill stats and note the pokemon name if visible.`
      }
    ]
  }]
});
```

## Response Validation (Zod)
```typescript
const MezastarTagSchema = z.object({
  pokemon: z.string(),
  energy: z.number().min(0).max(9999),
  grade: z.number().min(1).max(6),
  types: z.array(z.string()).min(1).max(2),
  stats: z.object({
    hp: z.number(),
    attack: z.number(),
    defense: z.number(),
    specialAttack: z.number(),
    specialDefense: z.number(),
    speed: z.number(),
  }).optional(),
  moves: z.array(z.object({
    name: z.string(),
    type: z.string(),
  })).optional(),
  collectionNumber: z.string().optional(),
  side: z.enum(["front", "back"]),
});
```

## Error Handling
- Glare on plastic: ask user to angle the tag to reduce reflection
- Blurry photo: ask user to hold steady, ensure good lighting
- Not a Mezastar tag: show "not a Mezastar tag" — maybe suggest TCG scanner?
- Multiple tags in frame: detect and ask user to focus on one
- QR code only: note that QR scanning is for the arcade machine, not our app
- API timeout: retry once, then show error with retry button

## iPad Camera Tips for Tags
- Rear camera, close-up mode if available
- Tags are small (36×64mm) — need good macro focus
- Matte surface is easier than glossy — advise flat lighting
- Show a stadium-shaped overlay guide in the viewfinder
- Compress to JPEG quality 0.8 before sending
