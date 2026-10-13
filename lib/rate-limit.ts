interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window rate limiter
// For serverless deployments, each warm instance maintains its window.
const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      const active = record.timestamps.filter((ts) => now - ts < 60000);
      if (active.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, { timestamps: active });
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

/**
 * Check if a client (by IP or session ID) has exceeded requests per window.
 * Default: 10 requests per 60,000 ms (1 minute).
 */
export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(key) || { timestamps: [] };

  // Retain only timestamps within the current sliding window
  const activeTimestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (activeTimestamps.length >= limit) {
    const oldest = activeTimestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      success: false,
      limit,
      remaining: 0,
      resetMs,
    };
  }

  activeTimestamps.push(now);
  rateLimitMap.set(key, { timestamps: activeTimestamps });

  return {
    success: true,
    limit,
    remaining: limit - activeTimestamps.length,
    resetMs: windowMs,
  };
}
