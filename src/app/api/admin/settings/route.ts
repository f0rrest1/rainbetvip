import { NextRequest } from "next/server";
import { getAdminDb } from '@/lib/firebase-admin';
import { withAdminAuth, AuthenticatedUser } from "@/lib/auth";
import { validateAndSanitize, sanitizeError, SiteSettingsSchema } from "@/lib/validation";

export const GET = withAdminAuth(async (_req: NextRequest, _user: AuthenticatedUser) => {
  void _req;
  void _user;
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection('settings').doc('site').get();

    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return Response.json({ success: true, data });
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
          bonusMessage: 'Exclusive bonus codes available below - Limited time offers!'
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
      error: sanitizeError(error)
    }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (req: NextRequest, _user: AuthenticatedUser) => {
  void _user;
  try {
    const rawSettings = await req.json();

    // Validate and sanitize settings data
    const validatedSettings = validateAndSanitize(SiteSettingsSchema, rawSettings);

    // Save validated settings to Firestore
    const db = getAdminDb();
    await db.collection('settings').doc('site').set(validatedSettings);

    return Response.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Settings save error:', error);
    return Response.json({
      success: false,
      error: sanitizeError(error)
    }, { status: 500 });
  }
});
