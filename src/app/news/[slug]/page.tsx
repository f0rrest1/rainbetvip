"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import { NewsItem } from '@/types/news';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

export default function ArticlePage() {
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const articleSlug = params.slug as string;

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleSlug) return;

      try {
        setLoading(true);
        
        // Query by slug first, then fall back to ID for backwards compatibility
        let articleData: NewsItem | null = null;
        // Try to get article by slug first (more efficient)
        const slugQuery = query(
          collection(getDbInstance(), 'news'),
          where('slug', '==', articleSlug),
          where('published', '==', true)
        );
        
        const slugSnapshot = await getDocs(slugQuery);
        
        if (!slugSnapshot.empty) {
          const doc = slugSnapshot.docs[0];
          const data = doc.data();
          articleData = {
            id: doc.id,
            source: 'firestore',
            ...data
          } as NewsItem;
        } else {
          // Fallback: try to get by ID (for backwards compatibility)
          const idQuery = query(
            collection(getDbInstance(), 'news'),
            where('__name__', '==', articleSlug),
            where('published', '==', true)
          );
          
          const idSnapshot = await getDocs(idQuery);
          
          if (!idSnapshot.empty) {
            const doc = idSnapshot.docs[0];
            const data = doc.data();
            articleData = {
              id: doc.id,
              source: 'firestore',
              ...data
            } as NewsItem;
          }
        }
        
        if (articleData) {
          setArticle(articleData);
        } else {
          setError('Article not found or not published');
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[--background] text-[--foreground]">
        <div className="w-full px-6 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 mx-auto border-4 border-[--color-primary]/30 border-t-[--color-primary] rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold mb-2 text-white">Loading Article</h2>
            <p className="text-white/70">Please wait while we fetch the article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[--background] text-[--foreground]">
        <div className="w-full px-6 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <NewspaperIcon className="text-6xl mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Article Not Found</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Link
              href="/news"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground]">
      {/* Full width, no container */}
      <div className="w-full">
        {/* Back navigation with container only for navigation */}
        <div className="mx-auto w-full max-w-4xl px-6 py-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to News
          </Link>
        </div>

        {/* Article - Full width */}
        <article className="w-full">
          {/* Article Header - with container */}
          <header className="mx-auto w-full max-w-4xl px-6 pb-8 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              {article.isPriority && <StarRoundedIcon className="text-yellow-400" fontSize="small" />}
              <span className="px-3 py-1 text-sm rounded-full bg-[--color-primary]/20 text-[--color-primary] border border-[--color-primary]/30">
                RainbetVIP
              </span>
              {article.isPriority && (
                <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  Featured Article
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed italic">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm text-white/60">
              <div className="flex items-center gap-4">
                <span className="font-medium">By {article.author}</span>
              </div>
              <time dateTime={article.createdAt.toDate().toISOString()}>
                {article.createdAt.toDate().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </time>
            </div>
          </header>

          {/* Article Content - Full width with wider max-width */}
          <div className="mx-auto w-full max-w-5xl px-6 py-12">
            <div className="prose prose-lg prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 className="text-4xl font-bold text-white mb-8 mt-12">{children}</h1>,
                  h2: ({children}) => <h2 className="text-3xl font-semibold text-white mb-6 mt-10">{children}</h2>,
                  h3: ({children}) => <h3 className="text-2xl font-semibold text-white mb-4 mt-8">{children}</h3>,
                  h4: ({children}) => <h4 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h4>,
                  p: ({children}) => <p className="text-white/85 mb-6 leading-relaxed text-lg">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside mb-8 text-white/85 space-y-3 pl-6">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside mb-8 text-white/85 space-y-3 pl-6">{children}</ol>,
                  li: ({children}) => <li className="text-white/85 leading-relaxed">{children}</li>,
                  strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                  em: ({children}) => <em className="text-white/90">{children}</em>,
                  code: ({children}) => <code className="bg-white/10 px-3 py-1 rounded text-cyan-300 font-mono text-base">{children}</code>,
                  pre: ({children}) => <pre className="bg-white/10 p-6 rounded-lg overflow-x-auto mb-8 border border-white/10">{children}</pre>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-cyan-400/50 pl-8 py-4 text-white/75 italic mb-8 bg-white/5 rounded-r-lg text-lg">
                      {children}
                    </blockquote>
                  ),
                  a: ({href, children}) => (
                    <a 
                      href={href} 
                      className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/50 hover:decoration-cyan-300 transition-colors" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="border-white/20 my-12" />,
                  table: ({children}) => (
                    <div className="overflow-x-auto mb-8">
                      <table className="min-w-full border border-white/20 rounded-lg">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({children}) => (
                    <th className="border border-white/20 px-4 py-3 bg-white/10 text-white font-semibold text-left">
                      {children}
                    </th>
                  ),
                  td: ({children}) => (
                    <td className="border border-white/20 px-4 py-3 text-white/85">
                      {children}
                    </td>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Article Footer - with container */}
          <footer className="mx-auto w-full max-w-4xl px-6 py-8 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-white/60">
                <p>Published by RainbetVIP</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/news"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all duration-200 text-sm"
                >
                  More Articles
                </Link>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
