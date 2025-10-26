import RomanticBackground from '@/components/RomanticBackground';
import LandingHero from '@/components/LandingHero';
import MusicShowcase from '@/components/MusicShowcase';

export default function Home() {
  return (
    <main className="relative">
      <RomanticBackground />
      <div className="relative z-10">
        <LandingHero />
        <MusicShowcase />
      </div>
    </main>
  );
}
