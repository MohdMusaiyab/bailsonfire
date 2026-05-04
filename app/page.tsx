import Hero from "@/components/general/Hero";
import { RecentMatches } from "@/components/general/RecentMatches";
import { WallOfShame } from "@/components/general/WallOfShame";
import { WhySection } from "@/components/general/WhySection";
import { RoadmapSection } from "@/components/general/RoadmapSection";
import { LandingCTA } from "@/components/general/LandingCTA";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <RecentMatches />
      <WallOfShame />
      <WhySection />
      <RoadmapSection />
      <LandingCTA />
    </main>
  );
}
