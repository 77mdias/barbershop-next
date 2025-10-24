/**
 * ⚡ Rate Limiter
 * 
 * Sistema de rate limiting para uploads baseado em IP e usuário.
 * Previne spam e ataques de DDoS nos endpoints de upload.
 * 
 * @author GitHub Copilot
 * @since 2024-10-24
 */

import { RATE_LIMIT_CONFIG, ERROR_MESSAGES } from './upload/config';

// ===== IN-MEMORY STORAGE FOR RATE LIMITING =====
// In production, consider using Redis for distributed systems

interface RateLimitEntry {
  count: number;
  windowStart: number;
  isBlocked: boolean;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// ===== RATE LIMITING FUNCTIONS =====

/**
 * Generate rate limit key for IP/User combination
 */
function generateRateLimitKey(ip: string, userId?: string): string {
  return `${RATE_LIMIT_CONFIG.STORAGE_PREFIX}:${ip}${userId ? `:user:${userId}` : ''}`;
}

/**
 * Get current rate limit entry for key
 */
function getRateLimitEntry(key: string): RateLimitEntry {
  const existing = rateLimitStore.get(key);
  const now = Date.now();
  
  if (!existing || (now - existing.windowStart) > RATE_LIMIT_CONFIG.WINDOW_MS) {
    // Create new entry or reset window
    const entry: RateLimitEntry = {
      count: 0,
      windowStart: now,
      isBlocked: false
    };
    rateLimitStore.set(key, entry);
    return entry;
  }
  
  return existing;
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(ip: string, userId?: string): {
  allowed: boolean;
  error?: string;
  remaining?: number;
  resetTime?: number;
} {
  const key = generateRateLimitKey(ip, userId);
  const entry = getRateLimitEntry(key);
  const now = Date.now();
  
  // Check if currently blocked
  if (entry.isBlocked && entry.blockedUntil && now < entry.blockedUntil) {
    const remainingBlockTime = Math.ceil((entry.blockedUntil - now) / 1000);
    console.log(`🚫 Rate limit blocked: ${key}, remaining: ${remainingBlockTime}s`);
    
    return {
      allowed: false,
      error: `${ERROR_MESSAGES.RATE_LIMIT_EXCEEDED}. Bloqueado por ${remainingBlockTime} segundos.`,
      resetTime: entry.blockedUntil
    };
  }
  
  // Reset block if time expired
  if (entry.isBlocked && entry.blockedUntil && now >= entry.blockedUntil) {
    entry.isBlocked = false;
    entry.blockedUntil = undefined;
    entry.count = 0;
    entry.windowStart = now;
  }
  
  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW) {
    // Block the key
    entry.isBlocked = true;
    entry.blockedUntil = now + RATE_LIMIT_CONFIG.BLOCK_DURATION_MS;
    rateLimitStore.set(key, entry);
    
    console.log(`🚫 Rate limit exceeded: ${key}, blocked until ${new Date(entry.blockedUntil).toISOString()}`);
    
    return {
      allowed: false,
      error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      resetTime: entry.blockedUntil
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  const remaining = RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW - entry.count;
  const resetTime = entry.windowStart + RATE_LIMIT_CONFIG.WINDOW_MS;
  
  console.log(`✅ Rate limit check passed: ${key}, count: ${entry.count}/${RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW}, remaining: ${remaining}`);
  
  return {
    allowed: true,
    remaining,
    resetTime
  };
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(ip: string, userId?: string): {
  count: number;
  remaining: number;
  resetTime: number;
  isBlocked: boolean;
  blockedUntil?: number;
} {
  const key = generateRateLimitKey(ip, userId);
  const entry = getRateLimitEntry(key);
  
  return {
    count: entry.count,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW - entry.count),
    resetTime: entry.windowStart + RATE_LIMIT_CONFIG.WINDOW_MS,
    isBlocked: entry.isBlocked,
    blockedUntil: entry.blockedUntil
  };
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export function resetRateLimit(ip: string, userId?: string): boolean {
  const key = generateRateLimitKey(ip, userId);
  const deleted = rateLimitStore.delete(key);
  
  if (deleted) {
    console.log(`🔄 Rate limit reset for: ${key}`);
  }
  
  return deleted;
}

/**
 * Cleanup expired rate limit entries
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    const windowExpired = (now - entry.windowStart) > RATE_LIMIT_CONFIG.WINDOW_MS;
    const blockExpired = entry.blockedUntil && now >= entry.blockedUntil;
    
    if (windowExpired && (!entry.isBlocked || blockExpired)) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired rate limit entries`);
  }
  
  return cleaned;
}

/**
 * Get all current rate limit entries (for monitoring)
 */
export function getAllRateLimitEntries(): Array<{
  key: string;
  count: number;
  remaining: number;
  isBlocked: boolean;
  windowStart: string;
  blockedUntil?: string;
}> {
  return Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
    key,
    count: entry.count,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW - entry.count),
    isBlocked: entry.isBlocked,
    windowStart: new Date(entry.windowStart).toISOString(),
    blockedUntil: entry.blockedUntil ? new Date(entry.blockedUntil).toISOString() : undefined
  }));
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  totalEntries: number;
  activeBlocks: number;
  totalRequests: number;
  averageRequestsPerEntry: number;
} {
  const entries = Array.from(rateLimitStore.values());
  const totalEntries = entries.length;
  const activeBlocks = entries.filter(e => e.isBlocked).length;
  const totalRequests = entries.reduce((sum, entry) => sum + entry.count, 0);
  const averageRequestsPerEntry = totalEntries > 0 ? totalRequests / totalEntries : 0;
  
  return {
    totalEntries,
    activeBlocks,
    totalRequests,
    averageRequestsPerEntry: Math.round(averageRequestsPerEntry * 100) / 100
  };
}

/**
 * Setup periodic cleanup (call this in your application startup)
 */
export function setupRateLimitCleanup(intervalMinutes: number = 30): NodeJS.Timeout {
  const interval = setInterval(() => {
    cleanupExpiredEntries();
  }, intervalMinutes * 60 * 1000);
  
  console.log(`⏰ Rate limit cleanup scheduled every ${intervalMinutes} minutes`);
  
  return interval;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Extract IP address from request
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Try various headers that might contain the real IP
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // Take the first IP if multiple are present
      const ip = value.split(',')[0].trim();
      if (ip && ip !== 'unknown') {
        return ip;
      }
    }
  }
  
  // Fallback to a default (this shouldn't happen in normal circumstances)
  return '127.0.0.1';
}

/**
 * Create rate limit headers for API responses
 */
export function createRateLimitHeaders(status: {
  count: number;
  remaining: number;
  resetTime: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': RATE_LIMIT_CONFIG.MAX_UPLOADS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': status.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(status.resetTime / 1000).toString(),
    'X-RateLimit-Window': (RATE_LIMIT_CONFIG.WINDOW_MS / 1000).toString()
  };
}