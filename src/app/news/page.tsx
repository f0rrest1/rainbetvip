"use client";

import dynamic from "next/dynamic";

const NewsList = dynamic(() => import("@/components/news/NewsList"), { ssr: false });

export default function NewsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-white">Latest Gambling Industry News</h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          Stay up to date with the latest gambling industry news, including updates from Rainbet and other industry leaders.
        </p>
      </div>
      <NewsList />
    </div>
  );
}



