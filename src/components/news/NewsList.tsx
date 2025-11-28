"use client";

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { memo } from 'react';
import { useNews } from "@/hooks/useNews";

// Removed unused interface

const NewsList = memo(function NewsList() {
  const { articles, loading, error } = useNews({ 
    limit: 12, 
    cacheKey: 'news-list' 
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rbv-card p-8 text-center max-w-md">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto border-4 border-[--color-primary]/30 border-t-[--color-primary] rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">Loading News</h2>
          <p className="text-white/70">Fetching the latest gambling industry updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rbv-card p-8 text-center max-w-md">
          <div className="mb-4">
            <svg 
              className="w-16 h-16 mx-auto text-red-500 opacity-60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">Error Loading News</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[--color-primary] text-black rounded-lg hover:bg-[--color-primary]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rbv-card p-8 text-center max-w-md">
          <div className="mb-4">
            <svg 
              className="w-16 h-16 mx-auto text-[--color-primary] opacity-60" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-white">No News Available</h2>
          <p className="text-white/70">No recent news articles found. Check back later for updates.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {articles.map((article) => {
          const isFirestoreArticle = article.source === 'RainbetVIP';
          const hasFullContent = isFirestoreArticle && article.content;

          return (
            <article 
              key={article.id} 
              className={`rbv-card p-6 hover:shadow-lg transition-all duration-300 ${
                article.isPriority ? 'ring-2 ring-yellow-400/50 bg-gradient-to-br from-yellow-500/5 to-transparent' : ''
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    {article.isPriority && <span className="text-yellow-400 text-sm">⭐</span>}
                    <span className="font-medium text-[--color-primary]">{article.source}</span>
                    {article.isPriority && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        Featured
                      </span>
                    )}
                  </div>
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </time>
                </div>
                
                <h3 className="text-lg font-semibold text-white line-clamp-2 hover:text-[--color-primary] transition-colors">
                  {hasFullContent ? (
                    <Link 
                      href={`/news/${article.slug || article.id}`}
                      className="block text-left w-full"
                    >
                      {article.title}
                    </Link>
                  ) : (
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {article.title}
                    </a>
                  )}
                </h3>
                
                {article.excerpt && (
                  <p className="text-white/70 text-sm line-clamp-3 italic">
                    {article.excerpt}
                  </p>
                )}

                {/* Show truncated content preview for articles without excerpts */}
                {!article.excerpt && hasFullContent && (
                  <div className="text-white/70 text-sm line-clamp-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {article.content!.length > 200 ? article.content!.substring(0, 200) + '...' : article.content}
                    </ReactMarkdown>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-[--color-primary]/20 text-[--color-primary] rounded-full">
                    {article.category}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {hasFullContent ? (
                      <Link
                        href={`/news/${article.slug || article.id}`}
                        className="text-sm text-[--color-primary] hover:text-[--color-primary]/80 transition-colors inline-flex items-center gap-1"
                      >
                        Read Full Article
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ) : article.url !== '#' ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[--color-primary] hover:text-[--color-primary]/80 transition-colors inline-flex items-center gap-1"
                      >
                        Read More
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      
      {articles.length > 0 && (
        <div className="text-center pt-8">
          <p className="text-white/60 text-sm">
            Showing {articles.length} recent articles from various sources
            {articles.some(a => a.source === "RainbetVIP") && ", including featured RainbetVIP articles"}
            {articles.some(a => a.isPriority) && " • ⭐ indicates priority/featured content"}
          </p>
        </div>
      )}
    </div>
  );
});

export default NewsList;



