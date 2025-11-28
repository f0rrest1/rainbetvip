import { NextRequest } from "next/server";
import { getUnifiedNews, getUnifiedNewsByCategory } from "@/lib/unifiedNewsService";

export const revalidate = 1800; // cache for 30 minutes by default
export const dynamic = 'force-dynamic'; // Ensure proper caching behavior

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 0);
  const days = Number(searchParams.get("days") || 7);
  const category = searchParams.get("category") || undefined;

  try {
    // Use unified news service that combines Firestore and API news
    const articles = category 
      ? await getUnifiedNewsByCategory(category, days)
      : await getUnifiedNews(days);
    
    const data = limit > 0 ? articles.slice(0, limit) : articles;
    
    // Transform unified news to match the expected API format
    const transformedData = data.map(article => ({
      id: article.id,
      title: article.title,
      slug: 'slug' in article ? (article as { slug: string }).slug : undefined,
      publishedAt: article.publishedAt.toISOString(),
      source: article.source === 'firestore' ? 'RainbetVIP' : article.author,
      url: article.url || '#',
      category: article.category || (article.source === 'firestore' ? 'Custom' : 'Industry News'),
      excerpt: article.excerpt,
      imageUrl: article.imageUrl,
      isPriority: article.isPriority,
      content: article.content
    }));
    
    const response = Response.json({ articles: transformedData });
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=1800');
    
    return response;
  } catch (e) {
    console.error("/api/news error", e);
    return Response.json({ articles: [] }, { status: 200 });
  }
}



