import { collection, getDocs } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import { aggregateNews, AggregatedArticle } from '@/lib/newsAggregator';
import { NewsItem } from '@/types/news';

export interface UnifiedNewsItem {
  id: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  author: string;
  publishedAt: Date;
  source: 'firestore' | 'api';
  isPriority?: boolean;
  url?: string;
  category?: string;
  imageUrl?: string;
}

/**
 * Fetches published news articles from Firestore
 */
async function getFirestoreNews(): Promise<UnifiedNewsItem[]> {
  try {
    const newsCollection = collection(getDbInstance(), 'news');
    const querySnapshot = await getDocs(newsCollection);
    const firestoreNews: UnifiedNewsItem[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as NewsItem;
      
      // Filter for published articles
      if (data.published) {
        firestoreNews.push({
          id: doc.id,
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt,
          author: data.author,
          publishedAt: data.createdAt.toDate(),
          source: 'firestore',
          isPriority: data.isPriority,
          imageUrl: data.imageUrl
        });
      }
    });
    
    return firestoreNews;
  } catch (error) {
    console.error('Error fetching Firestore news:', error);
    return [];
  }
}

/**
 * Fetches news from external APIs
 */
async function getApiNews(days: number = 7): Promise<UnifiedNewsItem[]> {
  try {
    const apiArticles = await aggregateNews({ days });
    
    return apiArticles.map((article: AggregatedArticle): UnifiedNewsItem => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      author: article.source,
      publishedAt: new Date(article.publishedAt),
      source: 'api',
      isPriority: false,
      url: article.url,
      category: article.category,
      imageUrl: article.imageUrl
    }));
  } catch (error) {
    console.error('Error fetching API news:', error);
    return [];
  }
}

/**
 * Combines and sorts news from both Firestore and external APIs
 */
export async function getUnifiedNews(days: number = 7): Promise<UnifiedNewsItem[]> {
  try {
    console.log('Getting unified news...');
    
    // Fetch news from both sources in parallel, but don't fail if one fails
    const [firestoreNews, apiNews] = await Promise.allSettled([
      getFirestoreNews(),
      getApiNews(days)
    ]);

    // Extract successful results
    const firestoreArticles = firestoreNews.status === 'fulfilled' ? firestoreNews.value : [];
    const apiArticles = apiNews.status === 'fulfilled' ? apiNews.value : [];

    // Log any failures
    if (firestoreNews.status === 'rejected') {
      console.warn('Firestore news fetch failed:', firestoreNews.reason);
    }
    if (apiNews.status === 'rejected') {
      console.warn('API news fetch failed:', apiNews.reason);
    }

    // Combine all news
    const allNews = [...firestoreArticles, ...apiArticles];

    // Sort by priority first, then by date
    allNews.sort((a, b) => {
      // Priority articles first
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      
      // If both have same priority status, sort by date (newest first)
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });

    console.log(`📰 Unified news: ${firestoreArticles.length} from Firestore, ${apiArticles.length} from APIs, ${allNews.length} total`);
    
    return allNews;
  } catch (error) {
    console.error('Error getting unified news:', error);
    // If everything fails, try to at least get API news as fallback
    try {
      const apiNews = await getApiNews(days);
      console.log('📰 Fallback: Using API news only');
      return apiNews;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Gets news for a specific category
 */
export async function getUnifiedNewsByCategory(category: string, days: number = 7): Promise<UnifiedNewsItem[]> {
  const allNews = await getUnifiedNews(days);
  
  return allNews.filter(article => 
    article.category === category || 
    (article.source === 'firestore' && category === 'Custom')
  );
}

/**
 * Gets only priority/featured news
 */
export async function getPriorityNews(): Promise<UnifiedNewsItem[]> {
  const allNews = await getUnifiedNews();
  
  return allNews.filter(article => article.isPriority);
}
