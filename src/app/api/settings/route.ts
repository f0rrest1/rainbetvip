import { doc, getDoc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';
import { defaultSiteSettings } from '@/lib/defaultSettings';

export const GET = async () => {
  try {
    const settingsDoc = await getDoc(doc(getDbInstance(), 'settings', 'site'));

    if (!settingsDoc.exists()) {
      return Response.json({ success: true, data: defaultSiteSettings });
    }

    const data = settingsDoc.data();
    const mergedData = {
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

    return Response.json({ success: true, data: mergedData });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 });
  }
};
