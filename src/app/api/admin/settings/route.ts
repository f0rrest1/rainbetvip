import { NextRequest } from "next/server";
import { getAdminDb } from '@/lib/firebase-admin';
import { withAdminAuth, AuthenticatedUser } from "@/lib/auth";
import { validateAndSanitize, sanitizeError, SiteSettingsSchema } from "@/lib/validation";
import { defaultSiteSettings } from '@/lib/defaultSettings';

export const GET = withAdminAuth(async (_req: NextRequest, _user: AuthenticatedUser) => {
  void _req;
  void _user;
  try {
    const db = getAdminDb();
    const settingsDoc = await db.collection('settings').doc('site').get();

    if (!settingsDoc.exists) {
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
