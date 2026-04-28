import { NextResponse } from "next/server";
import { fetchPokemon } from "@/lib/pokeapi";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name } = (body ?? {}) as { name?: unknown };
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid name" },
      { status: 400 },
    );
  }

  const data = await fetchPokemon(name);
  if (!data) {
    return NextResponse.json(
      { error: `Could not find "${name}" in PokeAPI` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    types: data.types,
    moves: data.moves,
    ...(data.imageUrl ? { imageUrl: data.imageUrl } : {}),
  });
}
