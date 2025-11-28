import Parser from "rss-parser";

export type AlternativeNewsArticle = {
  id: string;
  title: string;
  publishedAt: string;
  source: string;
  url: string;
  category: string;
  excerpt?: string;
  imageUrl?: string;
};

// Additional free RSS sources for gambling/casino news
const additionalSources = [
  // Casino and Gaming News
  { url: "https://www.casinoreports.com/feed/", category: "Casino News", name: "Casino Reports" },
  { url: "https://www.casino.org/news/feed/", category: "Casino News", name: "Casino.org" },
  { url: "https://www.pokernews.com/news/rss.xml", category: "Poker News", name: "PokerNews" },
  { url: "https://www.cardplayer.com/rss", category: "Poker News", name: "CardPlayer" },
  
  // Crypto Gaming
  { url: "https://cryptonews.com/news/feed/", category: "Crypto Gaming", name: "CryptoNews" },
  { url: "https://decrypt.co/feed", category: "Crypto Gaming", name: "Decrypt" },
  { url: "https://cointelegraph.com/rss", category: "Crypto Gaming", name: "Cointelegraph" },
  
  // Gaming Industry
  { url: "https://www.gamesindustry.biz/feed", category: "Industry News", name: "GamesIndustry.biz" },
  { url: "https://www.pocketgamer.biz/feed/", category: "Industry News", name: "PocketGamer.biz" },
  
  // Sports Betting
  { url: "https://www.actionnetwork.com/feed", category: "Sports Betting", name: "Action Network" },
  { url: "https://www.sportsbookreview.com/feed/", category: "Sports Betting", name: "Sportsbook Review" },
  
  // Regulation and Legal
  { url: "https://www.law360.com/rss", category: "Regulation Updates", name: "Law360" },
  { url: "https://www.gamingpost.com/feed/", category: "Regulation Updates", name: "Gaming Post" },
];

const parser = new Parser();

/**
 * Fetch news from alternative RSS sources
 */
export async function fetchAlternativeNews(days: number = 7): Promise<AlternativeNewsArticle[]> {
  const results: AlternativeNewsArticle[] = [];
  
  console.log(`🔍 Fetching from ${additionalSources.length} alternative RSS sources...`);
  
  const fetchPromises = additionalSources.map(async (source) => {
    try {
      console.log(`📡 Fetching from ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      const sourceResults: AlternativeNewsArticle[] = [];
      
      for (const item of feed.items) {
        const link = (item.link || item.guid || "").toString();
        const title = (item.title || "").toString();
        const content = (item.content || item.contentSnippet || item.summary || "").toString();
        
        if (!link || !title) continue;
        
        const dateStr = (item.isoDate || item.pubDate || new Date().toISOString()).toString();
        const date = new Date(dateStr);
        
        // Check if article is within the specified days
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const daysMs = days * 24 * 60 * 60 * 1000;
        if (diff > daysMs) continue;
        
        // Filter for relevant content
        if (!isRelevantContent(title, content)) continue;
        
        // Extract and clean excerpt
        const cleanContent = stripHtmlTags(content);
        const excerpt = cleanContent.length > 200 ? cleanContent.substring(0, 200) + "..." : cleanContent;
        
        sourceResults.push({
          id: `alt-${source.name}:${link}`,
          title,
          publishedAt: date.toISOString(),
          source: source.name,
          url: link,
          category: source.category,
          excerpt: excerpt || undefined,
          imageUrl: undefined, // Skip images for performance
        });
      }
      
      console.log(`✅ ${source.name}: Found ${sourceResults.length} relevant articles`);
      return sourceResults;
    } catch (error) {
      console.log(`❌ Failed to fetch from ${source.name}:`, error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  });
  
  const allResults = await Promise.all(fetchPromises);
  results.push(...allResults.flat());
  
  // Remove duplicates based on URL
  const uniqueResults = results.filter((article, index, self) => 
    index === self.findIndex(a => a.url === article.url)
  );
  
  // Sort by date (newest first)
  uniqueResults.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  
  console.log(`📰 Alternative sources: ${uniqueResults.length} unique articles from ${additionalSources.length} sources`);
  return uniqueResults;
}

/**
 * Check if content is relevant to gambling/casino industry
 */
function isRelevantContent(title: string, content: string): boolean {
  const relevantKeywords = [
    // Core terms
    "casino", "gambling", "betting", "gaming", "poker", "slots", "blackjack", "roulette",
    // Crypto gaming
    "crypto casino", "bitcoin casino", "ethereum gambling", "blockchain gaming", "crypto betting",
    "defi gambling", "web3 casino", "nft gaming", "play-to-earn",
    // Industry terms
    "igaming", "online casino", "live dealer", "game provider", "rng", "sports betting",
    // Regulation
    "gambling regulation", "casino license", "gaming law", "compliance", "jurisdiction",
    // Business
    "casino operator", "gaming revenue", "market entry", "acquisition", "merger",
    // Technology
    "virtual reality", "augmented reality", "ai gaming", "machine learning casino"
  ];
  
  const excludeKeywords = [
    "porn", "adult", "xxx", "dating", "stock market", "traditional finance", "real estate",
    "cooking", "travel", "fashion", "celebrity", "politics", "sports news"
  ];
  
  const text = `${title} ${content}`.toLowerCase();
  
  // Check exclude keywords first
  if (excludeKeywords.some(keyword => text.includes(keyword))) {
    return false;
  }
  
  // Check relevant keywords
  return relevantKeywords.some(keyword => text.includes(keyword));
}

/**
 * Strip HTML tags from text
 */
function stripHtmlTags(text: string): string {
  if (!text) return text;
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
}
