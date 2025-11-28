import Parser from "rss-parser";
import { getCachedNews, setCachedNews, canMakeNewsAPICall, recordNewsAPICall, cleanupOldCache } from "./newsCacheSimple";
import { fetchAlternativeNews } from "./alternativeNewsSources";

type AggregatorOptions = {
  days?: number;
  category?: string;
};

export type AggregatedArticle = {
  id: string;
  title: string;
  publishedAt: string;
  source: string;
  url: string;
  category: string;
  excerpt?: string;
  imageUrl?: string;
};

type NewsAPIArticle = {
  source: { id: string; name: string };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
};

const sources: { url: string; category: string; name: string }[] = [
  { url: "https://www.igamingbusiness.com/feed", category: "Industry News", name: "iGaming Business" },
  { url: "https://www.casinonewsdaily.com/feed/", category: "Casino News", name: "Casino News Daily" },
  { url: "https://www.gambling.com/news/feed", category: "Gambling News", name: "Gambling.com" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", category: "Crypto News", name: "CoinDesk" },
  { url: "https://cointelegraph.com/rss", category: "Crypto News", name: "Cointelegraph" },
  { url: "https://www.legalsportsreport.com/feed/", category: "Regulation Updates", name: "Legal Sports Report" },
];

const parser = new Parser();

function withinDays(date: Date, days: number): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const daysMs = days * 24 * 60 * 60 * 1000;
  return diff <= daysMs;
}

function passesKeywordFilter(title: string): boolean {
  const include = [
    "casino", "gambling", "betting", "gaming", "wager", "jackpot",
    "crypto casino", "bitcoin casino", "ethereum gambling", "crypto betting",
    "blockchain gaming", "nft gaming", "defi gambling", "web3 casino",
    "slots", "poker", "blackjack", "roulette", "baccarat", "dice", "crash",
    "igaming", "online casino", "live dealer", "game provider", "rng",
    "gambling regulation", "casino license", "gaming law", "restriction",
    "ban", "legalization", "compliance", "jurisdiction",
    "new casino", "casino opening", "gaming expansion", "market entry"
  ];
  const exclude = ["porn", "adult", "xxx", "dating", "stock market", "traditional finance"];
  const t = title.toLowerCase();
  if (exclude.some((x) => t.includes(x))) return false;
  return include.some((x) => t.includes(x));
}

function passesNewsAPIFilter(title: string): boolean {
  const exclude = ["porn", "adult", "xxx", "dating"];
  const t = title.toLowerCase();
  return !exclude.some((x) => t.includes(x));
}

function stripHtmlTags(text: string): string {
  if (!text) return text;
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchFromNewsAPI(days: number = 7): Promise<AggregatedArticle[]> {
  const cachedData = await getCachedNews('newsapi') as AggregatedArticle[] | null;
  if (cachedData) {
    return cachedData;
  }

  const apiKey = process.env.NEWSAPI_ORG_API_KEY;
  if (!apiKey) {
    console.log("NewsAPI key not found - skipping NewsAPI sources");
    return [];
  }

  if (!canMakeNewsAPICall()) {
    console.log("NewsAPI rate limit reached - skipping for now");
    return [];
  }

  const results: AggregatedArticle[] = [];
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const queries = [
    { q: "crypto casino OR bitcoin casino OR blockchain gaming", category: "Crypto Gaming" },
    { q: "casino regulation OR gambling ban OR gaming license", category: "Regulation Updates" },
    { q: "online casino OR live dealer OR casino games", category: "Casino News" },
    { q: "igaming OR casino operator OR gambling technology", category: "Industry News" },
  ];

  try {
    for (const query of queries) {
      console.log(`Fetching NewsAPI articles for: ${query.q}`);
      
      const url = new URL("https://newsapi.org/v2/everything");
      url.searchParams.set("q", query.q);
      url.searchParams.set("from", fromDate);
      url.searchParams.set("sortBy", "publishedAt");
      url.searchParams.set("language", "en");
      url.searchParams.set("pageSize", "30");
      url.searchParams.set("apiKey", apiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.log(`NewsAPI query failed for "${query.q}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data.articles) {
        for (const article of data.articles as NewsAPIArticle[]) {
          if (!article.title || !article.url) continue;
          
          if (!passesNewsAPIFilter(article.title)) continue;
          
          const publishedAt = new Date(article.publishedAt);
          if (!withinDays(publishedAt, days)) continue;

          results.push({
            id: `newsapi:${article.url}`,
            title: article.title,
            publishedAt: article.publishedAt,
            source: article.source.name || "NewsAPI",
            url: article.url,
            category: query.category,
            excerpt: article.description ? stripHtmlTags(article.description).substring(0, 300) : undefined,
            imageUrl: undefined,
          });
        }
        
        console.log(`NewsAPI: Successfully fetched ${data.articles.length} articles for "${query.q}"`);
      }
    }

    recordNewsAPICall();
    if (results.length > 0) {
      await setCachedNews('newsapi', results);
    }
  } catch (error) {
    console.log("NewsAPI fetch error:", error instanceof Error ? error.message : 'Unknown error');
  }

  return results;
}

export async function aggregateNews(opts: AggregatorOptions = {}): Promise<AggregatedArticle[]> {
  const days = opts.days ?? 7;
  const categoryFilter = opts.category;

  if (Math.random() < 0.1) {
    cleanupOldCache().catch(console.error);
  }

  const results: AggregatedArticle[] = [];
  
  const [rssResults, alternativeResults, newsAPIResults] = await Promise.all([
    Promise.all(
      sources.map(async (source) => {
        const cachedData = await getCachedNews(`rss-${source.name}`) as AggregatedArticle[] | null;
        if (cachedData) {
          return cachedData;
        }

        try {
          console.log(`Fetching RSS from ${source.name}...`);
          const feed = await parser.parseURL(source.url);
          
          const sourceResults: AggregatedArticle[] = [];
          
          for (const item of feed.items) {
            const link = (item.link || item.guid || "").toString();
            const title = (item.title || "").toString();
            const content = (item.content || item.contentSnippet || item.summary || "").toString();
            
            if (!link || !title) continue;
            
            const dateStr = (item.isoDate || item.pubDate || new Date().toISOString()).toString();
            const date = new Date(dateStr);
            
            if (!withinDays(date, days)) continue;
            if (!passesKeywordFilter(title)) continue;
            
            const category = source.category;
            if (categoryFilter && categoryFilter !== category) continue;
            
            const cleanContent = stripHtmlTags(content);
            const excerpt = cleanContent.length > 200 ? cleanContent.substring(0, 200) + "..." : cleanContent;
            
            sourceResults.push({
              id: `rss-${source.name}:${link}`,
              title,
              publishedAt: date.toISOString(),
              source: source.name,
              url: link,
              category,
              excerpt: excerpt || undefined,
              imageUrl: undefined,
            });
          }
          
          if (sourceResults.length > 0) {
            await setCachedNews(`rss-${source.name}`, sourceResults);
          }
          
          console.log(`RSS: Successfully fetched ${sourceResults.length} relevant articles from ${source.name}`);
          return sourceResults;
        } catch (error) {
          console.log(`RSS: Failed to fetch from ${source.name}:`, error instanceof Error ? error.message : 'Unknown error');
          return [];
        }
      })
    ).then(results => results.flat()),
    
    (async () => {
      const cachedData = await getCachedNews('alternative-sources') as AggregatedArticle[] | null;
      if (cachedData) {
        return cachedData;
      }

      const results = await fetchAlternativeNews(days);
      if (results.length > 0) {
        await setCachedNews('alternative-sources', results);
      }
      return results;
    })(),
    
    fetchFromNewsAPI(days)
  ]);

  results.push(...rssResults, ...alternativeResults, ...newsAPIResults);

  const uniqueResults = results.filter((article, index, self) => 
    index === self.findIndex(a => a.url === article.url)
  );

  const filteredResults = categoryFilter 
    ? uniqueResults.filter(article => article.category === categoryFilter)
    : uniqueResults;

  filteredResults.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  
  console.log(`Total unique articles aggregated: ${filteredResults.length} (RSS: ${rssResults.length}, Alternative: ${alternativeResults.length}, NewsAPI: ${newsAPIResults.length})`);
  return filteredResults;
}
