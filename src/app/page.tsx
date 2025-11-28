import Hero from "@/components/Hero";
import BonusCodeDrops from "@/components/BonusCodeDrops";
import NewsPreview from "@/components/NewsPreview";

export default function Home() {
  return (
    <div className="font-sans relative">
      {/* Continuous background gradient overlay */}
      <div className="absolute inset-0 rbv-gradient-mesh opacity-20" />

      <div className="relative z-10">
        <Hero />
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <BonusCodeDrops />
        </section>
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <NewsPreview />
        </section>
      </div>
    </div>
  );
}
