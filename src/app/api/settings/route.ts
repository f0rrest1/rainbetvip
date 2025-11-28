import { NextRequest } from "next/server";
import { doc, getDoc } from 'firebase/firestore';
import { getDbInstance } from '@/lib/firebase';

export const GET = async (_req: NextRequest) => {
  try {
    const settingsDoc = await getDoc(doc(getDbInstance(), 'settings', 'site'));

    if (settingsDoc.exists()) {
      const data = settingsDoc.data();
      // Merge with defaults to ensure all fields are present
      const defaultSettings = {
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
      
      // Deep merge the data with defaults
      const mergedData = {
        ...defaultSettings,
        ...data,
        heroContent: {
          ...defaultSettings.heroContent,
          ...data.heroContent
        },
        socialLinks: {
          ...defaultSettings.socialLinks,
          ...data.socialLinks
        },
        trackingPixel: {
          ...defaultSettings.trackingPixel,
          ...data.trackingPixel
        },
        floatingBoxes: data.floatingBoxes || defaultSettings.floatingBoxes
      };
      
      return Response.json({ success: true, data: mergedData });
    } else {
      // Return default settings if none exist
      const defaultSettings = {
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
      return Response.json({ success: true, data: defaultSettings });
    }
  } catch (error) {
    console.error('Settings fetch error:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 });
  }
};