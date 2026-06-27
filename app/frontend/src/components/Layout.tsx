import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { useLenis } from '@/hooks/useLenis';
import DestinationsMarquee from './DestinationsMarquee';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  useLenis();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-clip">
      {/* Skip link — visible only on keyboard focus */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:bg-deepblack focus-visible:text-bronze-warm focus-visible:px-4 focus-visible:py-2 focus-visible:font-body focus-visible:text-xs focus-visible:tracking-[0.3em] focus-visible:uppercase focus-visible:border focus-visible:border-bronze-warm/70"
      >
        Skip to content
      </a>
      <Navigation />
      <main id="main" key={pathname} className="flex-1 pt-[68px] route-fade">
        {children}
      </main>
      <DestinationsMarquee />
      <Footer />
    </div>
  );
}