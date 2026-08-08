import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/security/redis";
import { RATE_LIMITS } from "@/lib/security/rateLimitConfig";
import { NextResponse } from "next/server";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";

// -----------------------------------------------------------------------------
// Create all rate limiters from the config automatically
// -----------------------------------------------------------------------------

export const rateLimiters = Object.fromEntries(
  Object.entries(RATE_LIMITS).map(([key, config]) => [
    key,
    new Ratelimit({
      redis,

      // IMPORTANT: Give every limiter its own Redis namespace
      prefix: `ratelimit:${key.toLowerCase()}`,

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

export const getClientIp = (req) => {
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
  cookieHeaders = [],
}) => {
  const limiter = rateLimiters[type];

  if (!limiter) {
    throw new Error(`Rate limiter "${type}" does not exist.`);
  }

  const key = identifier ?? getClientIp(req);

  let result;
  try {
    result = await limiter.limit(key);
  } catch (err) {
    // Fail open: don't take down the API if Redis/Upstash is unavailable
    logApiError(`[rateLimit] ${type} failed open:`, err);
    return null;
  }

  const { success, limit, remaining, reset } = result;

  if (!success) {
    const retryAfter = Math.max(
      1,
      Math.ceil((reset - Date.now()) / 1000)
    );

    const response = NextResponse.json(
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

    return appendSetCookieHeaders(response, cookieHeaders || []);
  }

  return null;
};
