import { doc, getDoc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import { isFirebaseConfigured } from './firebase-config';
import { defaultSiteSettings, SiteSettings } from './defaultSettings';

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    // Check if we're in a browser environment and Firebase is configured
    if (typeof window === 'undefined') {
      return defaultSiteSettings;
    }

    if (!isFirebaseConfigured()) {
      console.warn('Firebase configuration not available, using default settings');
      return defaultSiteSettings;
    }

    const settingsDoc = await getDoc(doc(getDbInstance(), 'settings', 'site'));
    if (settingsDoc.exists()) {
      const data = settingsDoc.data() as SiteSettings;
      return {
        ...defaultSiteSettings,
        ...data,
        heroContent: {
          ...defaultSiteSettings.heroContent,
          ...data.heroContent,
        },
        socialLinks: {
          ...defaultSiteSettings.socialLinks,
          ...data.socialLinks,
        },
        trackingPixel: {
          ...defaultSiteSettings.trackingPixel,
          ...data.trackingPixel,
        },
        floatingBoxes: data.floatingBoxes || defaultSiteSettings.floatingBoxes,
      };
    }
    return defaultSiteSettings;
  } catch (error) {
    console.warn('Could not fetch settings from Firebase, using defaults:', error instanceof Error ? error.message : String(error));
    return defaultSiteSettings;
  }
}

export type { SiteSettings, FloatingBox } from './defaultSettings';
