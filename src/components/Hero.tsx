"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";

interface HeroContent {
  mainHeading: string;
  subHeading: string;
  statusBadge: string;
  description: string;
  bonusMessage: string;
}

interface FloatingBonusBox {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  visible: boolean;
}

export default function Hero() {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    mainHeading: 'Elevate Your Play',
    subHeading: 'with VIP Bonuses',
    statusBadge: 'VIP Exclusive Offers Available Now',
    description: 'Join thousands of VIP players and unlock premium rewards, exclusive bonuses, and personalized gaming experiences.',
    bonusMessage: 'Exclusive bonus codes available below - Limited time offers!'
  });

  const [floatingBoxes, setFloatingBoxes] = useState<FloatingBonusBox[]>([
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
  ]);

  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            if (data.data.heroContent) {
              setHeroContent(data.data.heroContent);
            }
            if (data.data.floatingBoxes) {
              setFloatingBoxes(data.data.floatingBoxes);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchHeroSettings();
  }, []);
  return (
    <section className="relative overflow-hidden min-h-[70vh] flex items-center">
      {/* Enhanced background with mesh gradient */}
      <div className="absolute inset-0 rbv-gradient-hero" />
      <div className="absolute inset-0 rbv-gradient-mesh opacity-40" />

      <div className="relative mx-auto w-full max-w-6xl px-6 py-16 z-10">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 rbv-badge mb-6 animate-pulse-glow">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
          {heroContent.statusBadge}
        </div>

        {/* Main heading with gradient text */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
          <span className="block">{heroContent.mainHeading}</span>
          <span className="block text-gradient-primary">{heroContent.subHeading}</span>
        </h1>

        {/* Enhanced subtitle */}
        <div className="mb-8 max-w-3xl">
          <p className="text-xl text-white/90 mb-3">
            <span className="text-gradient-primary font-bold text-2xl inline-flex items-center gap-2">
              <CardGiftcardIcon fontSize="inherit" className="!w-6 !h-6" />
              {heroContent.bonusMessage}
            </span>
          </p>
          <p className="text-white/70">
            {heroContent.description}
          </p>
        </div>

        {/* Premium bonus cards */}
        <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {floatingBoxes.map((box, index) => (
            box.visible && (
              <div
                key={box.id}
                className="rbv-card-premium p-6 animate-float"
                style={{animationDelay: `${index * 0.5}s`}}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 bg-gradient-to-r ${box.color} rounded-full`} />
                  <span className="rbv-badge text-xs font-medium">{box.badge}</span>
                </div>
                <p className="text-xl font-bold mb-2">{box.title}</p>
                <p className="text-white/70 text-sm">{box.description}</p>
              </div>
            )
          ))}
        </div>

        {/* Enhanced action buttons - MOVED BELOW BONUS CARDS */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">

          <Link
            href="/news"
            className="rbv-button-secondary inline-flex items-center justify-center gap-2 text-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
            </svg>
            Latest Gaming News
          </Link>

          <a
            href="https://rainbet.com"
            target="_blank"
            rel="noreferrer"
            className="rbv-button-secondary inline-flex items-center justify-center gap-2 text-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit Rainbet Casino
          </a>
        </div>

        {/* Trust indicators */}
        {/* <div className="mt-12 flex flex-wrap items-center gap-8 opacity-60">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Licensed & Regulated</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            <span>24/7 VIP Support</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-orange-400 rounded-full" />
            <span>Instant Payouts</span>
          </div>
        </div> */}
      </div>
    </section>
  );
}
