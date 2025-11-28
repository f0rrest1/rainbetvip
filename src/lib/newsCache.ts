import { getAdminDb } from './firebase-admin';

interface CachedNewsData {
  articles: unknown[];
  timestamp: number;
  source: string;
}

const CACHE_DURATION = 30 * 60 * 1000;
const MAX_CACHE_AGE = 2 * 60 * 60 * 1000;

export async function getCachedNews(source: string): Promise<unknown[] | null> {
  try {
    const db = getAdminDb();
    const cacheRef = db.collection('newsCache').doc(source);
    const cacheDoc = await cacheRef.get();

    if (!cacheDoc.exists) {
      return null;
    }

    const cacheData = cacheDoc.data() as CachedNewsData;
    const now = Date.now();

    if (now - cacheData.timestamp > CACHE_DURATION) {
      return null;
    }

    console.log(`Using cached news from ${source} (age: ${Math.round((now - cacheData.timestamp) / 1000 / 60)} minutes)`);
    return cacheData.articles;
  } catch (error) {
    console.error('Error getting cached news:', error);
    return null;
  }
}

export async function setCachedNews(source: string, articles: unknown[]): Promise<void> {
  try {
    const db = getAdminDb();
    const cacheRef = db.collection('newsCache').doc(source);

    const cacheData: CachedNewsData = {
      articles,
      timestamp: Date.now(),
      source
    };

    await cacheRef.set(cacheData);
    console.log(`Cached ${articles.length} articles from ${source}`);
  } catch (error) {
    console.error('Error caching news:', error);
  }
}

export async function cleanupOldCache(): Promise<void> {
  try {
    const db = getAdminDb();
    const cacheRef = db.collection('newsCache');
    const now = Date.now();

    const snapshot = await cacheRef.get();
    const batch = db.batch();
    let deletedCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data() as CachedNewsData;
      if (now - data.timestamp > MAX_CACHE_AGE) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      console.log(`Cleaned up ${deletedCount} old cache entries`);
    }
  } catch (error) {
    console.error('Error cleaning up cache:', error);
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
