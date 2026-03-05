import Header from '@/components/Header';
import ScheduleBar from '@/components/ScheduleBar';
import HeroSection from '@/components/HeroSection';
import PartnersSection from '@/components/PartnersSection';
import NewsSection from '@/components/NewsSection';
import HeadlinesSection from '@/components/HeadlinesSection';
import EventsSection from '@/components/EventsSection';
import FindPlayersSection from '@/components/FindPlayersSection';
import TournamentSection from '@/components/TournamentSection';
import TournamentBracketSection from '@/components/TournamentBracketSection';
import FindCourtsSection from '@/components/FindCourtsSection';
import SponsorsSection from '@/components/SponsorsSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <ScheduleBar />
      <main className="flex-1">
        <HeroSection />
        <PartnersSection />
        <NewsSection />
        <HeadlinesSection />
        <EventsSection />
        <FindPlayersSection />
        <TournamentSection />
        <TournamentBracketSection />
        <FindCourtsSection />
        <SponsorsSection />
      </main>
    </div>
  );
};

export default Index;
