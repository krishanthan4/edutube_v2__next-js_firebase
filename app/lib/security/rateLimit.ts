/**
 * Rate limiting implementation for authentication attempts
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private maxAttempts: number;
  private windowMs: number;
  private blockDurationMs: number;

  constructor(
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    blockDurationMs: number = 60 * 60 * 1000 // 1 hour
  ) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  checkLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // Clean up expired entries
    if (entry && now > entry.resetTime) {
      this.attempts.delete(identifier);
    }

    // Check if currently blocked
    if (entry?.blocked && now < entry.resetTime) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }

    // Get current entry or create new one
    const currentEntry = this.attempts.get(identifier) || {
      count: 0,
      resetTime: now + this.windowMs,
      blocked: false
    };

    // Check if within limits
    if (currentEntry.count >= this.maxAttempts) {
      // Block the identifier
      currentEntry.blocked = true;
      currentEntry.resetTime = now + this.blockDurationMs;
      this.attempts.set(identifier, currentEntry);
      
      return {
        allowed: false,
        retryAfter: Math.ceil(this.blockDurationMs / 1000)
      };
    }

    return { allowed: true };
  }

  recordAttempt(identifier: string, success: boolean = false) {
    const now = Date.now();
    const entry = this.attempts.get(identifier) || {
      count: 0,
      resetTime: now + this.windowMs,
      blocked: false
    };

    if (success) {
      // Reset on successful attempt
      this.attempts.delete(identifier);
    } else {
      // Increment failed attempts
      entry.count++;
      this.attempts.set(identifier, entry);
    }
  }

  getAttemptCount(identifier: string): number {
    const entry = this.attempts.get(identifier);
    return entry?.count || 0;
  }

  reset(identifier: string) {
    this.attempts.delete(identifier);
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now > entry.resetTime && !entry.blocked) {
        this.attempts.delete(key);
      }
    }
  }
}

// Singleton instances for different rate limits
export const loginRateLimit = new RateLimiter(5, 15 * 60 * 1000, 60 * 60 * 1000); // 5 attempts per 15min, 1hr block
export const signupRateLimit = new RateLimiter(3, 60 * 60 * 1000, 24 * 60 * 60 * 1000); // 3 attempts per hour, 24hr block
export const passwordResetRateLimit = new RateLimiter(3, 60 * 60 * 1000, 2 * 60 * 60 * 1000); // 3 attempts per hour, 2hr block

// Cleanup intervals
setInterval(() => {
  loginRateLimit.cleanup();
  signupRateLimit.cleanup();
  passwordResetRateLimit.cleanup();
}, 10 * 60 * 1000); // Cleanup every 10 minutes

export { RateLimiter };