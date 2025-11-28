"use client";

import Link from "next/link";
import { memo } from "react";
import { useNews } from "@/hooks/useNews";

function ArticleContent({ article }: { article: PreviewArticle }) {
  return (
    <>
      {/* Source badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="rbv-badge-secondary text-xs">
          {article.source}
        </span>
        <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <svg className="w-3 h-3 text-white/60 group-hover:text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>

      {/* Article title */}
      <h3 className="font-bold text-lg leading-tight mb-4 group-hover:text-white transition-colors line-clamp-3">
        {article.title}
      </h3>

      {/* Article metadata */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/60">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="text-xs">
            {new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
        <div className="flex items-center gap-1 text-white/60 group-hover:text-cyan-400 transition-colors">
          <span className="text-xs font-medium">Read more</span>
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </>
  );
}

type PreviewArticle = {
  id: string;
  title: string;
  publishedAt: string;
  source: string;
  url: string;
  slug?: string;
};

const NewsPreview = memo(function NewsPreview() {
  const { articles, loading: isLoading, error } = useNews({ 
    limit: 3, 
    cacheKey: 'news-preview' 
  });

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rbv-badge mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
          </svg>
          Industry Updates
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Latest <span className="text-gradient-primary">News</span>
        </h2>
        <p className="text-white/70">
          Stay updated with the latest developments in the gambling and casino industry.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-white/70">Loading latest news...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-xl text-red-400">Failed to load news: {error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center">
          <p className="text-xl text-white/70">No articles available</p>
        </div>
      ) : (
        <>
          {/* Enhanced news grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => {
              // Use internal link for Firestore articles (with slug), external link for API articles
              const isInternalArticle = article.slug && article.source === 'RainbetVIP';
              const href = isInternalArticle ? `/news/${article.slug}` : article.url;
              
              if (isInternalArticle) {
                return (
                  <Link
                    key={article.id}
                    href={href}
                    className="rbv-card-premium p-6 hover:transform hover:scale-[1.02] transition-all duration-300 animate-float group block"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <ArticleContent article={article} />
                  </Link>
                );
              } else {
                return (
                  <a
                    key={article.id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="rbv-card-premium p-6 hover:transform hover:scale-[1.02] transition-all duration-300 animate-float group"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <ArticleContent article={article} />
                  </a>
                );
              }
            })}
          </div>

          {/* View All News Link */}
          <div className="text-center mt-8">
            <Link 
              href="/news" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
            >
              View All News
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

        </>
      )}
    </div>
  );
});

export default NewsPreview;



