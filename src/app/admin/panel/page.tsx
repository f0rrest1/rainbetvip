"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { NewsManagement } from '@/components/admin/NewsManagement';
import { Settings } from '@/components/admin/Settings';
import { BonusCodeManagement } from '@/components/admin/BonusCodeManagement';

type TabType = 'news' | 'settings' | 'bonus-codes';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('news');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthInstance(), async (user) => {
      if (user) {
        try {
          // Check if user has admin claims
          const idTokenResult = await user.getIdTokenResult();
          const isAdmin = idTokenResult.claims.admin === true;
          
          if (isAdmin) {
            setIsAuthenticated(true);
          } else {
            console.log('User is not an admin, redirecting to login');
            setIsAuthenticated(false);
            router.push('/admin/login');
          }
        } catch (error) {
          console.error('Error checking admin claims:', error);
          setIsAuthenticated(false);
          router.push('/admin/login');
        }
      } else {
        setIsAuthenticated(false);
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(getAuthInstance());
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <svg className="w-8 h-8 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const tabs = [
    { id: 'news' as TabType, label: 'News Management', icon: '📰' },
    { id: 'bonus-codes' as TabType, label: 'Bonus Codes', icon: '🎁' },
    { id: 'settings' as TabType, label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-[--background] text-[--foreground]">
      {/* Simplified Navigation */}
      <nav className="border-b border-[color-mix(in_oklab,var(--color-primary)_15%,transparent)] bg-[color-mix(in_oklab,var(--color-background)_95%,transparent)]">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="flex items-center justify-between py-4">
            {/* Tab Navigation */}
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors group ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{tab.icon}</span>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600"></span>
                  )}
                  {activeTab !== tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {activeTab === 'news' && <NewsManagement />}
        {activeTab === 'bonus-codes' && <BonusCodeManagement />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}
