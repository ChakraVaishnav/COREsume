import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/security/redis";
import { RATE_LIMITS } from "@/lib/security/rateLimitConfig";
import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// Create all rate limiters from the config automatically
// -----------------------------------------------------------------------------

export const rateLimiters = Object.fromEntries(
  Object.entries(RATE_LIMITS).map(([key, config]) => [
    key,
    new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        config.requests,
        config.window
      ),
    }),
  ])
);

// -----------------------------------------------------------------------------
// Get client IP
// -----------------------------------------------------------------------------

const getClientIp = (req) => {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
};

// -----------------------------------------------------------------------------
// Enforce rate limit
// -----------------------------------------------------------------------------

export const enforceRateLimit = async ({
  req,
  type,
  identifier,
}) => {
  const limiter = rateLimiters[type];

  if (!limiter) {
    throw new Error(`Rate limiter "${type}" does not exist.`);
  }

  const key = identifier ?? getClientIp(req);

  const { success, limit, remaining, reset } = await limiter.limit(key);

  if (!success) {
  const retryAfter = Math.max(
    1,
    Math.ceil((reset - Date.now()) / 1000)
  );

  return NextResponse.json(
    {
      error: `Too many requests. Please try again after ${retryAfter} second${
        retryAfter === 1 ? "" : "s"
      }.`,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    }
  );
}

  return null;
};