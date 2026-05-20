/**
 * In-memory token-bucket-ish rate limiter, keyed by client IP.
 *
 * Trade-off: counts live in the function instance's heap, so a burst that
 * fans out across multiple Fluid Compute instances could exceed the cap.
 * For a low-traffic portfolio that's acceptable; the limiter still catches
 * single-client abuse (curl loops, scrapers from one origin), which is the
 * concrete threat. Swap to @upstash/ratelimit if global accuracy is needed.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export interface RateLimitConfig {
  /** Logical name used for the bucket key and log lines. */
  name: string;
  /** Max requests allowed in the window. */
  requests: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Unix ms timestamp when the bucket resets. */
  resetAt: number;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function sweepIfNeeded(now: number) {
  // Cheap incremental cleanup — only walks when the map gets too big.
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(config: RateLimitConfig) {
  return {
    async limit(req: Request): Promise<RateLimitResult> {
      const ip = clientIp(req);
      const key = `${config.name}:${ip}`;
      const now = Date.now();
      sweepIfNeeded(now);

      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        bucket = { count: 0, resetAt: now + config.windowMs };
        buckets.set(key, bucket);
      }

      bucket.count += 1;
      const remaining = Math.max(0, config.requests - bucket.count);
      const success = bucket.count <= config.requests;

      return {
        success,
        limit: config.requests,
        remaining,
        resetAt: bucket.resetAt,
      };
    },
  };
}

export const chatLimiter = rateLimit({
  name: "chat",
  requests: 20,
  windowMs: 60_000,
});

export const transcribeLimiter = rateLimit({
  name: "transcribe",
  requests: 10,
  windowMs: 60_000,
});

export const ingestLimiter = rateLimit({
  name: "ingest",
  requests: 5,
  windowMs: 60_000,
});

export const leadsLimiter = rateLimit({
  name: "leads",
  requests: 5,
  windowMs: 5 * 60_000,
});

/**
 * Build a standardized 429 response with rate-limit headers.
 * Returns plain Response so it can be returned from any route handler.
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const retryAfterSec = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  return new Response(
    JSON.stringify({ error: "rate_limited", retry_after_seconds: retryAfterSec }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
      },
    },
  );
}

/**
 * Logs a rate-limit hit. Vercel surfaces console.warn in runtime logs.
 */
export function logRateLimitHit(route: string, req: Request, result: RateLimitResult) {
  console.warn("[rate-limit] blocked", {
    route,
    ip: clientIp(req),
    limit: result.limit,
    resetAt: new Date(result.resetAt).toISOString(),
  });
}
