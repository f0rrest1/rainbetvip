export interface FloatingBox {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  visible: boolean;
}

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
  heroContent: {
    mainHeading: string;
    subHeading: string;
    statusBadge: string;
    description: string;
    bonusMessage: string;
  };
  floatingBoxes?: FloatingBox[];
}

export const defaultSiteSettings: SiteSettings = {
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
