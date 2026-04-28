import { NextResponse } from "next/server";
import { visionScanSchema } from "@/lib/schemas";
import { fetchPokemon } from "@/lib/pokeapi";

const PROMPT = `You are analyzing a Pokémon Mezastar tag — a stadium/oval-shaped plastic tile from an arcade game. The text on this tag is in Traditional Chinese (繁體中文) from the Taiwan release.

YOUR #1 TASK: Read the Traditional Chinese text printed on the tag to identify the Pokémon name. Do NOT identify by artwork, colors, pose, or silhouette.

WHERE TO FIND THE NAME:
- The name is printed in large Chinese characters in the lower portion of the tag
- It appears near or below a "Special" label (if present)
- It is separate from any English text like "Pokemon" at the bottom edge

COMMON NAMES (for reference only — always read what is actually printed):
路卡利歐 = Lucario | 甲賀忍蛙 = Greninja | 噴火龍 = Charizard
皮卡丘 = Pikachu | 烈咬陸鯊 = Garchomp | 夜伽洛加 = Darkrai
水箭龜 = Blastoise | 妙蛙花 = Venusaur | 超夢 = Mewtwo
固拉多 = Groudon | 蓋乘龍歐 = Kyogre | 烈空坐 = Rayquaza
索爾迦雷歐 = Solgaleo | 露奈雅拉 = Lunala

WHERE TO FIND ENERGY VALUE:
- Look for "寶可能量" label with a number in a yellow/orange badge on the right side
- Typically a 2-4 digit number (e.g. 102, 1620, 2800)

WHERE TO FIND GRADE:
- "Special ★" = Grade 5 (Star)
- "Special ★★" = Grade 6 (Superstar)
- Diamond markings without "Special" = Grade 1-4 (count the diamonds)

WHERE TO FIND COLLECTION NUMBER:
- Small alphanumeric code at the bottom edge of the tag (e.g. "R-1-2 TC")

RULES:
- You MUST read the actual Chinese characters printed on the tag
- If the Chinese text says 路卡利歐, the answer is Lucario regardless of what the artwork looks like
- If you cannot clearly read the Chinese characters, set confidence to 0.3 or lower
- NEVER set confidence above 0.7 if you are identifying from artwork rather than text

Respond with ONLY valid JSON, no other text before or after:
{
  "pokemonName": "English name translated from the Chinese text on the tag",
  "collectionNumber": "alphanumeric code from bottom edge",
  "energy": 102,
  "grade": 5,
  "confidence": 0.9
}`;

const DEBUG_PROMPT = `What Traditional Chinese characters (繁體中文) are printed in the lower portion of this tag, near the Special label? Return ONLY the Chinese text, nothing else.`;

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
}

interface VisionCallResult {
  text: string;
  rawStatus: number;
}

async function callVision(
  apiKey: string,
  base64Data: string,
  prompt: string,
  maxTokens: number,
): Promise<VisionCallResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
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

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(
      `Anthropic API returned ${response.status}: ${details.slice(0, 200)}`,
    );
  }

  const data = (await response.json()) as AnthropicResponse;
  const text = data.content?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Unexpected Anthropic response shape");
  }
  return { text, rawStatus: response.status };
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

  const [mainSettled, debugSettled] = await Promise.allSettled([
    callVision(apiKey, base64Data, PROMPT, 1024),
    callVision(apiKey, base64Data, DEBUG_PROMPT, 256),
  ]);

  if (debugSettled.status === "fulfilled") {
    console.log(
      "scan-tag: [DEBUG] Chinese text reading:",
      debugSettled.value.text.trim(),
    );
  } else {
    console.warn(
      "scan-tag: [DEBUG] Chinese-text probe failed:",
      debugSettled.reason instanceof Error
        ? debugSettled.reason.message
        : String(debugSettled.reason),
    );
  }

  if (mainSettled.status === "rejected") {
    const message =
      mainSettled.reason instanceof Error
        ? mainSettled.reason.message
        : "Anthropic API request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const text = mainSettled.value.text;
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
      stats: null,
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
