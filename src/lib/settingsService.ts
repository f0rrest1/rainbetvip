import { doc, getDoc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import { isFirebaseConfigured } from './firebase-config';

export interface SiteSettings {
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
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    // Check if we're in a browser environment and Firebase is configured
    if (typeof window === 'undefined') {
      return defaultSettings;
    }

    if (!isFirebaseConfigured()) {
      console.warn('Firebase configuration not available, using default settings');
      return defaultSettings;
    }

    const settingsDoc = await getDoc(doc(getDbInstance(), 'settings', 'site'));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data() as SiteSettings;
      return { ...defaultSettings, ...data };
    }
    return defaultSettings;
  } catch (error) {
    console.warn('Could not fetch settings from Firebase, using defaults:', error instanceof Error ? error.message : String(error));
    return defaultSettings;
  }
}
