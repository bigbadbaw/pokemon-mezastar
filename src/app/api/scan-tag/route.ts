import { NextResponse } from "next/server";
import { visionScanSchema } from "@/lib/schemas";
import { fetchPokemon } from "@/lib/pokeapi";

const PROMPT = `You are looking at a Pokémon Mezastar tag — a stadium/oval-shaped plastic tile from an arcade game. The text is in Traditional Chinese (Taiwan version).

STEP 1: Find the Pokémon name.
It is printed in large Traditional Chinese characters in the lower-left area of the tag, below the artwork. On this tag format it appears near a "Special" or grade label. Common examples:
- 路卡利歐 = Lucario
- 噴火龍 = Charizard
- 甲賀忍蛙 = Greninja
- 皮卡丘 = Pikachu
READ THE CHINESE CHARACTERS. Do NOT guess from the artwork colors.

STEP 2: Find the Energy value (寶可能量).
Look for the label "寶可能量" with a number next to it, usually on the right side in a yellow/orange badge. This is the Energy value — typically a 2-4 digit number.

STEP 3: Find the Grade.
- If it says "Special ★" = Grade 5 (Star)
- If it says "Special ★★" = Grade 6 (Superstar)
- Diamond markings without "Special" = Grade 1-4

STEP 4: Find the Collection Number.
A small code at the bottom edge, like "R-1-2 TC" or similar alphanumeric string.

Respond ONLY with valid JSON, no other text:
{
  "pokemonName": "English Pokemon name translated from Chinese",
  "collectionNumber": "alphanumeric code like R-1-2 TC",
  "energy": 102,
  "grade": 5,
  "confidence": 0.9
}

Do NOT include types, moves, or stats — those are looked up from a separate database using the Pokémon name.`;

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

  console.log("scan-tag: raw API response:", text);

  let cleaned = text;
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    cleaned = fencedMatch[1].trim();
  } else {
    const braceStart = text.indexOf("{");
    const braceEnd = text.lastIndexOf("}");
    if (braceStart !== -1 && braceEnd > braceStart) {
      cleaned = text.slice(braceStart, braceEnd + 1).trim();
    }
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON", raw: cleaned.slice(0, 500) },
      { status: 422 },
    );
  }

  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { error: "Model response is not an object" },
      { status: 422 },
    );
  }

  console.log("scan-tag: parsed JSON:", JSON.stringify(parsed, null, 2));

  const { confidence: rawConfidence, ...visionFields } = parsed as Record<
    string,
    unknown
  >;

  const visionValidated = visionScanSchema.safeParse(visionFields);
  if (!visionValidated.success) {
    console.error(
      "scan-tag: vision validation failed:",
      JSON.stringify(visionValidated.error.issues, null, 2),
    );
    return NextResponse.json(
      {
        error: "Scan result validation failed",
        issues: visionValidated.error.issues,
      },
      { status: 422 },
    );
  }

  const vision = visionValidated.data;
  const confidence = Math.max(
    0,
    Math.min(1, Number(rawConfidence ?? 0.85) || 0),
  );

  const name = vision.pokemonName;
  const isLowConfidence =
    confidence < 0.3 ||
    name === "Unable to determine" ||
    name === "Unknown" ||
    name.length === 0;

  if (isLowConfidence) {
    return NextResponse.json({
      tag: {
        ...vision,
        types: [],
        moves: [],
        stats: null,
      },
      confidence,
      rawResponse: text,
      lowConfidence: true,
      message:
        "Could not clearly read the tag. Try again with better lighting and positioning.",
    });
  }

  const pokeData = await fetchPokemon(name);

  return NextResponse.json({
    tag: {
      ...vision,
      types: pokeData?.types ?? [],
      moves: pokeData?.moves ?? [],
      stats: pokeData?.stats ?? null,
      ...(pokeData?.imageUrl ? { imageUrl: pokeData.imageUrl } : {}),
    },
    confidence,
    rawResponse: text,
    ...(pokeData
      ? {}
      : {
          pokeApiMissing: true,
          message: `Could not find "${name}" in PokeAPI. Saved without canonical data.`,
        }),
  });
}
