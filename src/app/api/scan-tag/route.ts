import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 },
      );
    }

    // TODO: integrate Claude Vision API for tag recognition
    return NextResponse.json({
      error: "Tag scanning not yet implemented",
    }, { status: 501 });
  } catch {
    return NextResponse.json(
      { error: "Failed to process scan request" },
      { status: 500 },
    );
  }
}
