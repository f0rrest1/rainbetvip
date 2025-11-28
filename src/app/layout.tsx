import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { NavigationClient } from "./NavigationClient";
import { DynamicSocialLinks } from "@/components/DynamicSocialLinks";
import { TrackingPixel } from "@/components/TrackingPixel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rainbetvip.com"),
  title: {
    default: "RainbetVIP — VIP Casino Bonuses, Codes, and News",
    template: "%s • RainbetVIP",
  },
  description:
    "Modern VIP casino bonuses, real-time bonus code drops, and aggregated gambling industry news.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "RainbetVIP — VIP Casino Bonuses, Codes, and News",
    description:
      "Modern VIP casino bonuses, real-time bonus code drops, and aggregated gambling industry news.",
    url: "https://www.rainbetvip.com",
    siteName: "RainbetVIP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RainbetVIP",
    description:
      "Modern VIP casino bonuses, real-time bonus code drops, and aggregated gambling industry news.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RainbetVIP",
    url: "https://www.rainbetvip.com",
    sameAs: [
      "https://twitter.com/",
      "https://instagram.com/",
      "https://youtube.com/",
      "https://discord.gg/",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RainbetVIP",
    url: "https://www.rainbetvip.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.rainbetvip.com/news?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://www.rainbetvip.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[--background] text-[--foreground]`}>
        <div className="min-h-dvh flex flex-col">
          {/* Enhanced navigation header */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-[color-mix(in_oklab,var(--color-background)_90%,transparent)] border-b border-[color-mix(in_oklab,var(--color-primary)_15%,transparent)] shadow-lg">
            <div className="mx-auto w-full max-w-6xl px-6 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="group">
                <Image
                  src="/rainbetPictureNoBackground.png"
                  alt="RainbetVIP Logo"
                  width={800}
                  height={200}
                  className="h-20 w-auto group-hover:scale-105 transition-transform"
                  priority
                />
              </Link>

              <NavigationClient />
            </div>
          </header>

          <main className="flex-1">{children}</main>

          {/* Enhanced footer */}
          <footer className="relative border-t border-[color-mix(in_oklab,var(--color-primary)_15%,transparent)] bg-[color-mix(in_oklab,var(--color-background)_85%,transparent)] backdrop-blur-sm">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,212,255,0.15) 1px, transparent 0)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-6 py-12">
              {/* Footer content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                {/* Brand section */}
                <div className="md:col-span-2">
                  <div className="mb-4">
                    <Image
                      src="/rainbetPictureNoBackground.png"
                      alt="RainbetVIP Logo"
                      width={800}
                      height={200}
                      className="h-20 w-auto"
                    />
                  </div>
                  <p className="text-white/70 max-w-md mb-6">
                    Do your own research as to the conditions of the offers prior to using them. Rainbet VIP is not liable for any misunderstood promotions.
                  </p>
                  <DynamicSocialLinks />
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-bold text-white mb-4">Quick Links</h4>
                  <div className="space-y-2">
                    <Link href="/news" className="block text-white/70 hover:text-white transition-colors">Latest News</Link>
                    <Link href="/faq" className="block text-white/70 hover:text-white transition-colors">FAQ</Link>
                  </div>
                </div>

                {/* External Links */}
                <div>
                  <h4 className="font-bold text-white mb-4">Gaming</h4>
                  <div className="space-y-2">
                    <a href="https://rainbet.com" target="_blank" rel="noreferrer" className="block text-white/70 hover:text-white transition-colors">Rainbet Casino</a>
                    <a href="https://rewardz.gg" target="_blank" rel="noreferrer" className="block text-white/70 hover:text-white transition-colors">Rewardz</a>
                    <a href="https://wits.gg" target="_blank" rel="noreferrer" className="block text-white/70 hover:text-white transition-colors">Wits</a>
                  </div>
                </div>
              </div>

              {/* Footer bottom */}
              <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-col md:flex-row gap-4 text-sm text-white/60">
                  <p>BeGambleAware.org • 18+ only. Play responsibly. Gambling can be addictive.</p>
                  <Link href="/admin/login" className="text-xs text-white/30 hover:text-white/50 transition-colors">Admin</Link>
                </div>
                <p className="text-sm text-white/40">© {new Date().getFullYear()} RainbetVIP. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
        <TrackingPixel />
        <Analytics />
      </body>
    </html>
  );
}
