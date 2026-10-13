import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AnalysisResult, SavedReview } from "@/types/analysis";

let supabaseServerClient: SupabaseClient | null = null;

/**
 * Get or create server-side Supabase client.
 * Strictly uses server-side environment variables.
 */
export function getServerSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseServerClient) {
    supabaseServerClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseServerClient;
}

/**
 * Persist an audit review to Supabase.
 * Returns the created review ID, or null if Supabase is unconfigured.
 */
export async function saveReviewToDatabase(params: {
  sessionId: string;
  language: string;
  code: string;
  result: AnalysisResult;
  score: number;
}): Promise<string | null> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    console.warn("Supabase not configured. Skipping database persistence.");
    return null;
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        session_id: params.sessionId,
        language: params.language,
        code: params.code,
        result: params.result,
        score: params.score,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting review into Supabase:", error);
    return null;
  }

  return data?.id || null;
}

/**
 * Fetch reviews for a specific session ID, ordered by creation date desc.
 */
export async function getReviewsForSession(
  sessionId: string
): Promise<SavedReview[]> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching reviews for session:", error);
    return [];
  }

  return (data as SavedReview[]) || [];
}

/**
 * Delete a review by ID and verify matching session ID.
 */
export async function deleteReviewFromDatabase(
  id: string,
  sessionId: string
): Promise<boolean> {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return false;
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error deleting review:", error);
    return false;
  }

  return true;
}
