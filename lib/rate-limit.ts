import { headers } from "next/headers";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const globalForRateLimit = globalThis as unknown as {
  rateLimitMap?: Map<string, RateLimitEntry>;
  lastCleanup?: number;
};

const store =
  globalForRateLimit.rateLimitMap ?? new Map<string, RateLimitEntry>();
if (!globalForRateLimit.rateLimitMap) {
  globalForRateLimit.rateLimitMap = store;
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (
    globalForRateLimit.lastCleanup &&
    now - globalForRateLimit.lastCleanup < 60_000
  ) {
    return;
  }
  globalForRateLimit.lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {}
  return "127.0.0.1";
}

export interface RateLimitResult {
  success: boolean;
  retryAfter: number;
}

/**
 * In-memory sliding rate limiter.
 * Zero database queries required.
 *
 * @param identifier Unique key (e.g., `otp:request:${ip}`)
 * @param limit Maximum allowed requests within the time window
 * @param windowSeconds Window duration in seconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return { success: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { success: false, retryAfter };
  }

  entry.count += 1;
  return { success: true, retryAfter: 0 };
}
