"use client";

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import dynamic from 'next/dynamic';
import { NewsItem, NewsFormData } from '@/types/news';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

export function NewsManagement() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    slug: '',
    content: '',
    author: '',
    published: false,
    isPriority: false,
    excerpt: ''
  });

  // Fetch news from Firestore
  const fetchNews = async () => {
    try {
      const newsCollection = collection(getDbInstance(), 'news');
      const querySnapshot = await getDocs(newsCollection);
      const newsData: NewsItem[] = [];
      
      querySnapshot.forEach((doc) => {
        newsData.push({
          id: doc.id,
          source: 'firestore',
          ...doc.data()
        } as NewsItem);
      });
      
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      author: '',
      published: false,
      isPriority: false,
      excerpt: ''
    });
    setShowAddForm(false);
    setEditingItem(null);
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    setFormData({ 
      ...formData, 
      title,
      // Only auto-generate slug if it's empty or matches the previous auto-generated one
      slug: !formData.slug || formData.slug === generateSlug(formData.title) 
        ? generateSlug(title) 
        : formData.slug
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = Timestamp.now();
      
      if (editingItem) {
        // Update existing news item
        await updateDoc(doc(getDbInstance(), 'news', editingItem.id), {
          ...formData,
          updatedAt: now
        });
      } else {
        // Add new news item
        const docRef = await addDoc(collection(getDbInstance(), 'news'), {
          ...formData,
          createdAt: now,
          updatedAt: now
        });
        console.log('New article created with ID:', docRef.id);
      }
      
      resetForm();
      await fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Error saving article: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this news item?')) {
      try {
        await deleteDoc(doc(getDbInstance(), 'news', id));
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  // Handle edit
  const handleEdit = (item: NewsItem) => {
    setFormData({
      title: item.title,
      slug: item.slug || generateSlug(item.title),
      content: item.content,
      author: item.author,
      published: item.published,
      isPriority: item.isPriority,
      excerpt: item.excerpt || ''
    });
    setEditingItem(item);
    setShowAddForm(true);
  };

  // Toggle published status
  const togglePublished = async (item: NewsItem) => {
    try {
      await updateDoc(doc(getDbInstance(), 'news', item.id), {
        published: !item.published,
        updatedAt: Timestamp.now()
      });
      fetchNews();
    } catch (error) {
      console.error('Error updating news:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <svg className="w-8 h-8 animate-spin mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <p className="text-white/70">Loading news...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">News Management</h2>
          <p className="text-white/70">Manage your news articles and posts</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add News
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              {editingItem ? 'Edit News Item' : 'Add New News Item'}
            </h3>
            <button
              onClick={resetForm}
              className="text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="Enter news title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                URL Slug
                <span className="text-xs text-white/60 ml-2">(will be used in the URL: /news/{formData.slug || 'your-slug'})</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '') })}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="url-friendly-slug"
                pattern="^[a-z0-9-]+$"
              />
              <p className="text-xs text-white/50 mt-1">
                Only lowercase letters, numbers, and hyphens allowed. Auto-generated from title if left empty.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="Enter author name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Excerpt (Optional)</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
                placeholder="Brief excerpt or summary..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Content</label>
              <div className="prose-content">
                <MDEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value || '' })}
                  preview="edit"
                  hideToolbar={false}
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Enter your content using Markdown...',
                    style: {
                      fontSize: 14,
                      lineHeight: 1.5,
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  }}
                  height={300}
                  data-color-mode="dark"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
                />
                <label htmlFor="published" className="ml-2 text-sm text-white/90">
                  Publish immediately
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="priority"
                  checked={formData.isPriority}
                  onChange={(e) => setFormData({ ...formData, isPriority: e.target.checked })}
                  className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
                />
                <label htmlFor="priority" className="ml-2 text-sm text-white/90 flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  Priority article (appears first)
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    {editingItem ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingItem ? 'Update News' : 'Add News'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* News List */}
      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-white mb-2">No news articles yet</h3>
            <p className="text-white/70 mb-4">Start by adding your first news article</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              Add First Article
            </button>
          </div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {item.isPriority && <span className="text-yellow-400 text-lg">⭐</span>}
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.published 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {item.published ? 'Published' : 'Draft'}
                    </span>
                    {item.isPriority && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-white/70 text-sm mb-2">By {item.author}</p>
                  {item.excerpt && (
                    <p className="text-white/80 text-sm mb-2 italic">{item.excerpt}</p>
                  )}
                  <div className="text-white/80 line-clamp-3 prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.content.length > 200 ? item.content.substring(0, 200) + '...' : item.content}
                    </ReactMarkdown>
                  </div>
                  <p className="text-white/50 text-xs mt-2">
                    Created: {item.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => togglePublished(item)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      item.published
                        ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30'
                        : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                    }`}
                  >
                    {item.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
