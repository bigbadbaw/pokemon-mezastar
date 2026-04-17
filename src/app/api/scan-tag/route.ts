import { NextResponse } from "next/server";
import { scanResultSchema } from "@/lib/schemas";

const PROMPT = `Analyze this Pokémon Mezastar tag photo and extract all visible information.

Respond ONLY with valid JSON in this exact shape:
{
  "pokemonName": "Pokemon name",
  "collectionNumber": "collection number string (e.g. '025')",
  "energy": 1000,
  "grade": 3,
  "types": ["type1", "type2"],
  "moves": ["Move Name 1", "Move Name 2"],
  "stats": {
    "hp": 100,
    "attack": 85,
    "defense": 60,
    "specialAttack": 95,
    "specialDefense": 75,
    "speed": 120
  },
  "confidence": 0.9
}

Grades: 1-4 for normal tags (diamond markings), 5 for Star (★), 6 for Superstar (★★).
Types: lowercase, one of the 18 Pokémon types (normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy). One or two types only.
Confidence: 0-1 reflecting how clearly you can read the tag.`;

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { image } = (body ?? {}) as { image?: unknown };

  if (typeof image !== "string" || image.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid image" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Anthropic API key not configured" },
      { status: 500 },
    );
  }

  const base64Data = image.startsWith("data:")
    ? (image.split(",")[1] ?? "")
    : image;

  let apiResponse: Response;
  try {
    apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Data,
                },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Anthropic API request failed",
      },
      { status: 502 },
    );
  }

  if (!apiResponse.ok) {
    const details = await apiResponse.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Anthropic API returned ${apiResponse.status}`,
        details: details.slice(0, 500),
      },
      { status: 502 },
    );
  }

  const apiData = (await apiResponse.json()) as AnthropicResponse;
  const text = apiData.content?.[0]?.text;
  if (typeof text !== "string") {
    return NextResponse.json(
      { error: "Unexpected Anthropic response shape" },
      { status: 502 },
    );
  }

  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      {
        error: "Model did not return valid JSON",
        raw: cleaned.slice(0, 500),
      },
      { status: 422 },
    );
  }

  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { error: "Model response is not an object" },
      { status: 422 },
    );
  }

  const { confidence: rawConfidence, ...tagFields } = parsed as Record<
    string,
    unknown
  >;

  const validated = scanResultSchema.safeParse({
    tag: tagFields,
    confidence: rawConfidence ?? 0.85,
    rawResponse: text,
  });

  if (!validated.success) {
    return NextResponse.json(
      {
        error: "Scan result validation failed",
        issues: validated.error.issues,
      },
      { status: 422 },
    );
  }

  return NextResponse.json(validated.data);
}
