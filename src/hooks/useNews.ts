"use client";

import { useState, useEffect, useCallback } from 'react';
import { getClientCachedNews, setClientCachedNews, cleanupClientCache } from '@/lib/newsCacheSimple';

interface NewsArticle {
  id: string;
  title: string;
  publishedAt: string;
  source: string;
  url: string;
  category: string;
  excerpt?: string;
  isPriority?: boolean;
  content?: string;
  slug?: string;
  imageUrl?: string;
}

interface UseNewsOptions {
  limit?: number;
  days?: number;
  category?: string;
  cacheKey?: string;
}

interface UseNewsReturn {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useNews(options: UseNewsOptions = {}): UseNewsReturn {
  const { limit = 12, days = 7, category, cacheKey } = options;
  
  // Generate cache key based on options
  const finalCacheKey = cacheKey || `news-${limit}-${days}-${category || 'all'}`;
  
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check client-side cache first
      const cachedData = getClientCachedNews(finalCacheKey) as { articles: NewsArticle[] } | null;
      if (cachedData) {
        setArticles(cachedData.articles || []);
        setLoading(false);
        return;
      }

      // Build API URL
      const params = new URLSearchParams();
      if (limit) params.set('limit', limit.toString());
      if (days) params.set('days', days.toString());
      if (category) params.set('category', category);

      const response = await fetch(`/api/news?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.status}`);
      }

      const data = await response.json();
      const fetchedArticles = data.articles || [];

      // Cache the result
      setClientCachedNews(finalCacheKey, { articles: fetchedArticles });
      setArticles(fetchedArticles);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, days, category, finalCacheKey]);

  const refetch = useCallback(() => {
    // Clear cache and refetch
    setClientCachedNews(finalCacheKey, { articles: [] });
    fetchNews();
  }, [fetchNews, finalCacheKey]);

  useEffect(() => {
    fetchNews();
    
    // Cleanup old cache entries periodically
    cleanupClientCache();
  }, [fetchNews]);

  return {
    articles,
    loading,
    error,
    refetch
  };
}
