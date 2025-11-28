interface CachedNewsData {
  articles: unknown[];
  timestamp: number;
  source: string;
}

const CACHE_DURATION = 30 * 60 * 1000;
const inMemoryCache = new Map<string, CachedNewsData>();

const clientNewsCache = new Map<string, { data: unknown; timestamp: number }>();
const CLIENT_CACHE_DURATION = 5 * 60 * 1000;

export async function getCachedNews(source: string): Promise<unknown[] | null> {
  const cached = inMemoryCache.get(source);
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  
  if (now - cached.timestamp > CACHE_DURATION) {
    inMemoryCache.delete(source);
    return null;
  }
  
  console.log(`Using cached news from ${source} (age: ${Math.round((now - cached.timestamp) / 1000 / 60)} minutes)`);
  return cached.articles;
}

export async function setCachedNews(source: string, articles: unknown[]): Promise<void> {
  const cacheData: CachedNewsData = {
    articles,
    timestamp: Date.now(),
    source
  };
  
  inMemoryCache.set(source, cacheData);
  console.log(`Cached ${articles.length} articles from ${source}`);
}

export async function cleanupOldCache(): Promise<void> {
  const now = Date.now();
  let deletedCount = 0;
  
  for (const [key, data] of inMemoryCache.entries()) {
    if (now - data.timestamp > CACHE_DURATION * 4) {
      inMemoryCache.delete(key);
      deletedCount++;
    }
  }
  
  if (deletedCount > 0) {
    console.log(`Cleaned up ${deletedCount} old cache entries`);
  }
}

class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  
  canMakeCall(apiKey: string, maxCalls: number, windowMs: number): boolean {
    const now = Date.now();
    const calls = this.calls.get(apiKey) || [];
    
    const validCalls = calls.filter(time => now - time < windowMs);
    this.calls.set(apiKey, validCalls);
    
    return validCalls.length < maxCalls;
  }
  
  recordCall(apiKey: string): void {
    const now = Date.now();
    const calls = this.calls.get(apiKey) || [];
    calls.push(now);
    this.calls.set(apiKey, calls);
  }
}

export const rateLimiter = new RateLimiter();

export function canMakeNewsAPICall(): boolean {
  const apiKey = process.env.NEWSAPI_ORG_API_KEY;
  if (!apiKey) return false;
  
  const maxCallsPerDay = 90;
  const dayMs = 24 * 60 * 60 * 1000;
  
  return rateLimiter.canMakeCall(apiKey, maxCallsPerDay, dayMs);
}

export function recordNewsAPICall(): void {
  const apiKey = process.env.NEWSAPI_ORG_API_KEY;
  if (apiKey) {
    rateLimiter.recordCall(apiKey);
  }
}

export function getClientCachedNews(cacheKey: string): unknown | null {
  const cached = clientNewsCache.get(cacheKey);
  
  if (!cached) {
    return null;
  }
  
  const now = Date.now();
  
  if (now - cached.timestamp > CLIENT_CACHE_DURATION) {
    clientNewsCache.delete(cacheKey);
    return null;
  }
  
  return cached.data;
}

export function setClientCachedNews(cacheKey: string, data: unknown): void {
  clientNewsCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

export function cleanupClientCache(): void {
  const now = Date.now();
  for (const [key, value] of clientNewsCache.entries()) {
    if (now - value.timestamp > CLIENT_CACHE_DURATION) {
      clientNewsCache.delete(key);
    }
  }
}
