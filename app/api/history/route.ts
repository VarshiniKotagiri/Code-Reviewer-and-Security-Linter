import { NextRequest, NextResponse } from "next/server";
import { getReviewsForSession } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing x-session-id header." },
        { status: 400 }
      );
    }

    const reviews = await getReviewsForSession(sessionId);
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest?: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("GET /api/history error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve history.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
