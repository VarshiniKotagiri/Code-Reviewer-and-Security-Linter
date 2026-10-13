import { NextRequest, NextResponse } from "next/server";
import { deleteReviewFromDatabase } from "@/lib/supabase";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = req.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing x-session-id header." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: "Review ID is required." },
        { status: 400 }
      );
    }

    const success = await deleteReviewFromDatabase(id, sessionId);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete review or review not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      (error as { digest?: string }).digest === "NEXT_PRERENDER_INTERRUPTED"
    ) {
      throw error;
    }
    console.error("DELETE /api/history/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
