"use client";

import { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/lib/settingsService';
import { defaultSiteSettings } from '@/lib/defaultSettings';

export function TrackingPixel() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const siteSettings = await getSiteSettings();
        setSettings(siteSettings);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  if (!settings.trackingPixel.enabled || !settings.trackingPixel.url) {
    return null;
  }

  return (
    <iframe
      src={settings.trackingPixel.url}
      width="1"
      height="1"
      style={{
        border: 'none',
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        visibility: 'hidden',
        display: 'block'
      }}
      aria-hidden="true"
      title="Analytics tracking pixel"
    />
  );
}
