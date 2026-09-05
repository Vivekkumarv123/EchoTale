// PERSONA A — SECURE BACKEND ENGINEER
// THREAT: Denial of Service (DoS) and API quota exhaustion via rapid automated requests.
// RULE: Apply per-user rate limit / quota on backend endpoints to prevent cost and resource abuse.

interface RateLimitRecord {
  timestamps: number[];
}

// SECURITY CONTROL: Sliding window in-memory rate limiter per authenticated UID
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks sliding window rate limit for an authenticated user.
 * @param uid User ID from verified token
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowSeconds Window length in seconds
 */
export function checkRateLimit(
  uid: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const userRecord = rateLimitStore.get(uid) || { timestamps: [] };

  // Remove timestamps outside the sliding window
  userRecord.timestamps = userRecord.timestamps.filter((ts) => now - ts < windowMs);

  if (userRecord.timestamps.length >= maxRequests) {
    const earliest = userRecord.timestamps[0];
    const resetTime = Math.ceil((earliest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetTime };
  }

  userRecord.timestamps.push(now);
  rateLimitStore.set(uid, userRecord);

  return {
    allowed: true,
    remaining: maxRequests - userRecord.timestamps.length,
    resetTime: windowSeconds,
  };
}
