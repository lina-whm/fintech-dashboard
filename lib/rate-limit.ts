const ipRequests = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60000;

export interface RateLimitResult {
  success: boolean;
  resetAt?: number;
  remaining?: number;
}

export function rateLimit(
  ip: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record || now > record.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, resetAt: record.resetAt, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}