import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  scope: string;
  max: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blockedUntil?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function getStoreKey(request: NextRequest, config: RateLimitConfig, identity?: string): string {
  const ip = getClientIP(request);
  const normalizedIdentity = identity?.trim().toLowerCase() || "anonymous";
  return `${config.scope}:${ip}:${normalizedIdentity}`;
}

export function checkRateLimit(request: NextRequest, config: RateLimitConfig, identity?: string): RateLimitResult {
  const now = Date.now();
  const storeKey = getStoreKey(request, config, identity);
  const entry = store.get(storeKey);

  if (!entry || now - entry.windowStart >= config.windowMs) {
    const resetAt = now + config.windowMs;
    store.set(storeKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: Math.max(0, config.max - 1), resetAt };
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter, resetAt: entry.windowStart + config.windowMs };
  }

  entry.count += 1;

  if (entry.count > config.max) {
    if (config.blockDurationMs && config.blockDurationMs > 0) {
      entry.blockedUntil = now + config.blockDurationMs;
    }
    store.set(storeKey, entry);

    const retryAfter = entry.blockedUntil
      ? Math.ceil((entry.blockedUntil - now) / 1000)
      : Math.ceil((entry.windowStart + config.windowMs - now) / 1000);

    return { allowed: false, remaining: 0, retryAfter, resetAt: entry.windowStart + config.windowMs };
  }

  store.set(storeKey, entry);

  return {
    allowed: true,
    remaining: Math.max(0, config.max - entry.count),
    resetAt: entry.windowStart + config.windowMs,
  };
}

export function createRateLimitHeaders(config: RateLimitConfig, result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(config.max),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    "X-RateLimit-Window": String(Math.ceil(config.windowMs / 1000)),
    ...(result.retryAfter ? { "Retry-After": String(result.retryAfter) } : {}),
  };
}

export function createRateLimitErrorResponse(
  config: RateLimitConfig,
  result: RateLimitResult,
  message: string = "Muitas tentativas. Tente novamente em instantes.",
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: createRateLimitHeaders(config, result),
    },
  );
}
