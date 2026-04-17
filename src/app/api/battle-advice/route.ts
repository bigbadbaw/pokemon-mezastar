import { NextResponse } from "next/server";
import { battleAnalysisSchema } from "@/lib/schemas";
import { type MezaTag } from "@/lib/types";

const PROMPT_TEMPLATE = `You are analyzing a Pokémon Mezastar arcade battle screen. Identify the 3 opponent Pokémon shown on screen. For each opponent, provide the name and types.

Then, given the player's tag inventory below, recommend the best 3 tags to use. Consider:
1. Type advantages against the opponents
2. Higher Energy tags are generally stronger
3. Coverage — the 3 picks should cover as many opponents' weaknesses as possible
4. Grade matters — higher grade tags have better stats

Player's inventory:
INVENTORY_PLACEHOLDER

Respond ONLY with valid JSON:
{
  "opponents": [
    { "pokemonName": "name", "types": ["type1", "type2"], "estimatedEnergy": null }
  ],
  "recommendedTeam": ["tagId1", "tagId2", "tagId3"],
  "reasoning": "Brief explanation of why these 3 tags were chosen",
  "typeAdvantages": ["Advantage 1 description", "Advantage 2 description"]
}`;

const opponentsOnlySchema = battleAnalysisSchema.pick({ opponents: true });

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

  const { image, inventory } = (body ?? {}) as {
    image?: unknown;
    inventory?: unknown;
  };

  if (typeof image !== "string" || image.length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid image" },
      { status: 400 },
    );
  }

  if (!Array.isArray(inventory) || inventory.length === 0) {
    return NextResponse.json(
      { error: "Inventory is empty" },
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

  const inventorySummary = (inventory as MezaTag[]).map((tag) => ({
    id: tag.id,
    pokemonName: tag.pokemonName,
    types: tag.types,
    energy: tag.energy,
    grade: tag.grade,
  }));

  const prompt = PROMPT_TEMPLATE.replace(
    "INVENTORY_PLACEHOLDER",
    JSON.stringify(inventorySummary, null, 2),
  );

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
        max_tokens: 2048,
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
              { type: "text", text: prompt },
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

  const data = parsed as {
    opponents?: unknown;
    recommendedTeam?: unknown;
    reasoning?: unknown;
    typeAdvantages?: unknown;
  };

  const opponentsValidation = opponentsOnlySchema.safeParse({
    opponents: data.opponents,
  });

  if (!opponentsValidation.success) {
    return NextResponse.json(
      {
        error: "Opponent validation failed",
        issues: opponentsValidation.error.issues,
      },
      { status: 422 },
    );
  }

  return NextResponse.json({
    opponents: opponentsValidation.data.opponents,
    recommendedTeam: Array.isArray(data.recommendedTeam)
      ? data.recommendedTeam
      : [],
    reasoning: typeof data.reasoning === "string" ? data.reasoning : "",
    typeAdvantages: Array.isArray(data.typeAdvantages)
      ? data.typeAdvantages
      : [],
  });
}
