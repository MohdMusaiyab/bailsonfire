import NewspaperHero from "@/components/landing/NewspaperHero";
import { getNewspaperHeroData } from "@/lib/actions/matches";
import { RecentMatches } from "@/components/general/RecentMatches";
import { WallOfShame } from "@/components/general/WallOfShame";
import { WhySection } from "@/components/general/WhySection";
import { RoadmapSection } from "@/components/general/RoadmapSection";
import { LandingCTA } from "@/components/general/LandingCTA";

// ISR: Re-check for new nightly matches every hour.
// Interaction-driven busts are handled via revalidateTag in actions.
export const revalidate = 3600;

export default async function HomePage() {
  const heroData = await getNewspaperHeroData();

  return (
    <main>
      <NewspaperHero data={heroData} />
      <RecentMatches />
      <WallOfShame />
      <WhySection />
      <RoadmapSection />
      <LandingCTA />
    </main>
  );
}
