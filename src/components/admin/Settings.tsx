"use client";

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getAuthInstance } from '@/lib/firebase';
import { authenticatedFetchJson, handleApiError } from '@/lib/authenticatedFetch';

interface FloatingBox {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  visible: boolean;
}

interface SiteSettings {
  socialLinks: {
    discord: { url: string; visible: boolean };
    instagram: { url: string; visible: boolean };
    youtube: { url: string; visible: boolean };
    twitter: { url: string; visible: boolean };
  };
  trackingPixel: {
    url: string;
    enabled: boolean;
  };
  heroContent: {
    mainHeading: string;
    subHeading: string;
    statusBadge: string;
    description: string;
    bonusMessage: string;
  };
  floatingBoxes?: FloatingBox[];
}

const defaultSettings: SiteSettings = {
  socialLinks: {
    discord: { url: 'https://discord.gg/', visible: true },
    instagram: { url: 'https://instagram.com/', visible: true },
    youtube: { url: 'https://youtube.com/', visible: true },
    twitter: { url: 'https://x.com/', visible: true },
  },
  trackingPixel: {
    url: '',
    enabled: false,
  },
  heroContent: {
    mainHeading: 'Elevate Your Play',
    subHeading: 'with VIP Bonuses',
    statusBadge: 'VIP Exclusive Offers Available Now',
    description: 'Join thousands of VIP players and unlock premium rewards, exclusive bonuses, and personalized gaming experiences.',
    bonusMessage: '🎁 Exclusive bonus codes available below - Limited time offers!'
  },
  floatingBoxes: [
    {
      id: 'bonus-100',
      title: '100% Bonus',
      description: 'Perfect for new VIP members',
      badge: 'STARTER',
      color: 'from-cyan-400 to-blue-500',
      visible: true
    },
    {
      id: 'bonus-250',
      title: '250% Bonus + 60 Free Spins',
      description: 'Exclusive high-roller special',
      badge: 'HIGH-ROLLER',
      color: 'from-purple-400 to-pink-500',
      visible: true
    }
  ],
};

export function Settings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      if (!user) return;
      
      const response = await authenticatedFetchJson<{ success: boolean; data: SiteSettings }>(
        '/api/admin/settings',
        { method: 'GET' },
        user
      );
      
      if (response.success) {
        setSettings({ ...defaultSettings, ...response.data });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSaveMessage(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Monitor authentication state
    const unsubscribe = onAuthStateChanged(getAuthInstance(), (currentUser) => {
      console.log('Auth state changed:', currentUser ? 'User logged in' : 'User not logged in');
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, fetchSettings]);

  // Validate settings before saving
  const validateSettings = () => {
    // Validate tracking pixel URL if enabled
    if (settings.trackingPixel.enabled && settings.trackingPixel.url) {
      try {
        new URL(settings.trackingPixel.url);
      } catch {
        throw new Error('Invalid tracking pixel URL. Please enter a valid URL starting with http:// or https://');
      }
    }

    // Validate social link URLs
    for (const [platform, config] of Object.entries(settings.socialLinks)) {
      if (config.visible && config.url) {
        try {
          new URL(config.url);
        } catch {
          throw new Error(`Invalid ${platform} URL. Please enter a valid URL starting with http:// or https://`);
        }
      }
    }
  };

  // Save settings via API
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Check authentication
      if (!user) {
        throw new Error('You must be logged in to save settings. Please go to the admin login page.');
      }
      
      // Validate settings first
      validateSettings();
      
      const response = await authenticatedFetchJson<{ success: boolean; message?: string }>(
        '/api/admin/settings',
        {
          method: 'POST',
          body: JSON.stringify(settings)
        },
        user
      );
      
      if (response.success) {
        console.log('Settings saved successfully');
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage(handleApiError(error));
      setTimeout(() => setSaveMessage(''), 8000);
    } finally {
      setIsSaving(false);
    }
  };

  // Update social link
  const updateSocialLink = (platform: keyof SiteSettings['socialLinks'], field: 'url' | 'visible', value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: {
          ...prev.socialLinks[platform],
          [field]: value
        }
      }
    }));
  };

  // Update tracking pixel
  const updateTrackingPixel = (field: 'url' | 'enabled', value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      trackingPixel: {
        ...prev.trackingPixel,
        [field]: value
      }
    }));
  };

  // Update hero content
  const updateHeroContent = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      heroContent: {
        ...prev.heroContent,
        [field]: value
      }
    }));
  };

  // Update floating box
  const updateFloatingBox = (boxIndex: number, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      floatingBoxes: prev.floatingBoxes?.map((box, index) => 
        index === boxIndex 
          ? { ...box, [field]: value }
          : box
      ) || []
    }));
  };

  if (isLoading || authLoading) {
    return (
      <div className="text-center py-8">
        <svg className="w-8 h-8 animate-spin mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <p className="text-white/70">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
          <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-300 mb-2">Authentication Required</h3>
          <p className="text-red-200/80 text-sm">
            You must be logged in to access the settings. Please go to the admin login page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Site Settings</h2>
            <p className="text-white/70">Manage your site configuration and social links</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white/70">Authenticated as {user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          saveMessage.includes('Error') 
            ? 'bg-red-500/20 border border-red-500/50 text-red-300' 
            : 'bg-green-500/20 border border-green-500/50 text-green-300'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Hero Content Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Hero Section Content</h3>
        <p className="text-white/70 text-sm mb-6">Customize all the content displayed in the hero section</p>

        <div className="space-y-6">
          {/* Main Heading */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Main Heading</label>
            <input
              type="text"
              value={settings.heroContent.mainHeading}
              onChange={(e) => updateHeroContent('mainHeading', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="Elevate Your Play"
            />
          </div>

          {/* Sub Heading */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Sub Heading (Gradient Text)</label>
            <input
              type="text"
              value={settings.heroContent.subHeading}
              onChange={(e) => updateHeroContent('subHeading', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="with VIP Bonuses"
            />
          </div>

          {/* Status Badge */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Status Badge</label>
            <input
              type="text"
              value={settings.heroContent.statusBadge}
              onChange={(e) => updateHeroContent('statusBadge', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="VIP Exclusive Offers Available Now"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
            <textarea
              value={settings.heroContent.description}
              onChange={(e) => updateHeroContent('description', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="Join thousands of VIP players and unlock premium rewards, exclusive bonuses, and personalized gaming experiences."
              rows={3}
            />
          </div>

          {/* Bonus Message Section */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-lg font-medium text-white mb-4">Bonus Message</h4>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Bonus Message</label>
              <input
                type="text"
                value={settings.heroContent.bonusMessage}
                onChange={(e) => updateHeroContent('bonusMessage', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                placeholder="🎁 Exclusive bonus codes available below - Limited time offers!"
              />
              <p className="text-white/60 text-sm mt-2">
                This message appears prominently in the hero section to direct users to bonus codes.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs font-medium text-white/70 mb-4">Hero Section Preview:</p>

            {/* Status Badge Preview */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/90 mb-4">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              {settings.heroContent.statusBadge}
            </div>

            {/* Headings Preview */}
            <h1 className="text-2xl font-bold text-white mb-4">
              <span className="block">{settings.heroContent.mainHeading}</span>
              <span className="block text-gradient-primary">{settings.heroContent.subHeading}</span>
            </h1>

            {/* Bonus Message Preview */}
            <p className="text-lg text-white/90 mb-3">
              <span className="text-gradient-primary font-bold">{settings.heroContent.bonusMessage}</span>
            </p>

            {/* Description Preview */}
            <p className="text-white/70 text-sm">
              {settings.heroContent.description}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Bonus Boxes Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Floating Bonus Boxes</h3>
        <p className="text-white/70 text-sm mb-6">Customize the floating bonus boxes that appear on the hero section</p>
        
        <div className="space-y-6">
          {settings.floatingBoxes?.map((box, index) => (
            <div key={box.id} className="border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">{box.title}</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`box-visible-${index}`}
                    checked={box.visible}
                    onChange={(e) => updateFloatingBox(index, 'visible', e.target.checked)}
                    className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <label htmlFor={`box-visible-${index}`} className="text-sm text-white/90">
                    Visible
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Title (e.g., &quot;100% Bonus&quot;)</label>
                  <input
                    type="text"
                    value={box.title}
                    onChange={(e) => updateFloatingBox(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="100% Bonus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Description (e.g., &quot;Perfect for new VIP members&quot;)</label>
                  <input
                    type="text"
                    value={box.description}
                    onChange={(e) => updateFloatingBox(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Perfect for new VIP members"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Badge</label>
                  <input
                    type="text"
                    value={box.badge}
                    onChange={(e) => updateFloatingBox(index, 'badge', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="STARTER"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Color Gradient</label>
                  <select
                    value={box.color}
                    onChange={(e) => updateFloatingBox(index, 'color', e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="from-cyan-400 to-blue-500">Cyan to Blue</option>
                    <option value="from-purple-400 to-pink-500">Purple to Pink</option>
                    <option value="from-green-400 to-emerald-500">Green to Emerald</option>
                    <option value="from-orange-400 to-red-500">Orange to Red</option>
                    <option value="from-yellow-400 to-orange-500">Yellow to Orange</option>
                    <option value="from-pink-400 to-rose-500">Pink to Rose</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 bg-gradient-to-r ${box.color} rounded-full`} />
                  <span className="text-xs font-medium text-white/70 bg-white/10 px-2 py-1 rounded">{box.badge}</span>
                </div>
                <p className="text-sm font-bold text-white">{box.title}</p>
                <p className="text-xs text-white/70">{box.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Pixel Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Tracking Pixel</h3>
        <p className="text-white/70 text-sm mb-6">Add a tracking pixel (1x1 iframe) to your site for analytics</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="tracking-enabled"
              checked={settings.trackingPixel.enabled}
              onChange={(e) => updateTrackingPixel('enabled', e.target.checked)}
              className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
            />
            <label htmlFor="tracking-enabled" className="text-sm text-white/90 font-medium">
              Enable tracking pixel
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Tracking URL</label>
            <input
              type="url"
              value={settings.trackingPixel.url}
              onChange={(e) => updateTrackingPixel('url', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="https://example.com/tracking-pixel"
              disabled={!settings.trackingPixel.enabled}
            />
            <p className="text-xs text-white/50 mt-1">
              This URL will be loaded in a 1x1 pixel invisible iframe on every page
            </p>
          </div>
          
          {settings.trackingPixel.enabled && settings.trackingPixel.url && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                ⚠️ <strong>Privacy Notice:</strong> Make sure you comply with privacy laws (GDPR, CCPA) when using tracking pixels. 
                Consider adding this to your privacy policy.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Social Links Section */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Social Links</h3>
        <p className="text-white/70 text-sm mb-6">Manage which social links appear in the footer and their URLs</p>
        
        <div className="space-y-4">
          {Object.entries(settings.socialLinks).map(([platform, config]) => (
            <div key={platform} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {platform === 'discord' && '💬'}
                  {platform === 'instagram' && '📷'}
                  {platform === 'youtube' && '📺'}
                  {platform === 'twitter' && '🐦'}
                </span>
                <span className="font-medium text-white capitalize">{platform}</span>
              </div>
              
              <input
                type="url"
                value={config.url}
                onChange={(e) => updateSocialLink(platform as keyof SiteSettings['socialLinks'], 'url', e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all text-sm"
                placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
              />
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`visible-${platform}`}
                  checked={config.visible}
                  onChange={(e) => updateSocialLink(platform as keyof SiteSettings['socialLinks'], 'visible', e.target.checked)}
                  className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
                />
                <label htmlFor={`visible-${platform}`} className="text-sm text-white/90">
                  Show in footer
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
