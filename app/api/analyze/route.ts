import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema } from "@/types/analysis";
import { analyzeCodeWithGemini } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rate-limit";
import { saveReviewToDatabase } from "@/lib/supabase";

// Set max duration for Vercel Serverless Function to allow Gemini audit time
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // 1. Determine client identifier for rate limiting (session ID or IP)
    const sessionId =
      req.headers.get("x-session-id") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous-client";

    // 2. Enforce Rate Limiting (10 requests per minute)
    const rateCheck = checkRateLimit(sessionId, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a minute before analyzing more code.",
          remaining: rateCheck.remaining,
          resetMs: rateCheck.resetMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(rateCheck.resetMs / 1000).toString(),
          },
        }
      );
    }

    // 3. Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body provided." },
        { status: 400 }
      );
    }

    const validation = AnalyzeRequestSchema.safeParse(rawBody);
    if (!validation.success) {
      const issueMessage = validation.error.issues
        .map((i) => i.message)
        .join(", ");
      return NextResponse.json(
        { error: `Validation error: ${issueMessage}` },
        { status: 400 }
      );
    }

    const { code, language } = validation.data;

    // 4. Call Gemini AI Audit
    const result = await analyzeCodeWithGemini(code, language);

    // 5. Persist to Supabase if session ID provided
    let savedId: string | null = null;
    if (sessionId) {
      savedId = await saveReviewToDatabase({
        sessionId,
        language,
        code,
        result,
        score: result.overallScore,
      });
    }

    return NextResponse.json(
      {
        ...result,
        savedId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Analysis route error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error occurred.";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
