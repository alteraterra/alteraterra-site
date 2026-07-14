import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useContent } from '@/content/SiteContentContext';
import Spotlight from '@/components/Spotlight';

const HERO_IMAGE = '/hero.jpg';

/**
 * Phased entry handled by CSS animation-delay (not chained setTimeouts).
 * Each element fades + lifts independently; tweaking the timing is a one-line change.
 * Respects prefers-reduced-motion via the global rule in index.css.
 */
export default function Hero() {
  const { t } = useLanguage();
  const { text, img, get } = useContent();

  return (
    <section className="luxe-cursor relative h-[calc(100dvh-68px)] w-full overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src={img('hero.image', HERO_IMAGE)}
          alt={text('hero.imageAlt', 'Amalfi Coast at dawn, terraced villas above a glassy Mediterranean sea')}
          fetchPriority="high"
          decoding="async"
          className="hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-deepblack/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-deepblack/30 via-transparent to-deepblack/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-deepblack/20 via-transparent to-deepblack/20" />
        {/* Readability scrim, soft dark vignette behind the centered copy so the
            bronze motto keeps WCAG contrast over any frame of the photo. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_58%_at_50%_44%,rgba(8,6,5,0.78)_0%,rgba(8,6,5,0.42)_40%,transparent_72%)]" />
        {/* Top-edge scrim, removes the light haze band directly under the fixed
            nav so the hero meets the bronze stroke cleanly. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/90 via-black/45 to-transparent" />
        {/* Cursor-follow bronze spotlight, sits above overlays but below text */}
        <Spotlight intensity={0.18} size={620} />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8">
        <h1 className="hero-entry hero-entry--brand font-display text-[2.25rem] font-normal tracking-[0.2em] uppercase text-parchment/90 sm:text-[3rem] sm:tracking-[0.35em] md:text-[3.75rem] md:tracking-[0.5em] lg:text-[4.5rem] text-center max-w-[95vw] pl-[0.2em] sm:pl-[0.35em] md:pl-[0.5em]">
          {text('hero.brand', 'hero.brand')}
        </h1>

        <p className="hero-entry hero-entry--motto mt-4 font-display text-2xl tracking-[0.18em] italic font-normal sm:tracking-[0.25em] md:text-[1.75rem] md:tracking-[0.35em] text-[#B86A2E] text-center max-w-[95vw] pl-[0.18em] sm:pl-[0.25em] md:pl-[0.35em] [text-shadow:0_1px_2px_rgba(0,0,0,0.55),0_2px_16px_rgba(0,0,0,0.6)]">
          {text('hero.motto', 'hero.motto')}
        </p>

        <div className="hero-entry hero-entry--rule mt-8 mb-8 h-px w-16 bg-gradient-to-r from-transparent via-bronze/60 to-transparent" />

        <p className="hero-entry hero-entry--desc1 mt-1 font-body text-sm tracking-[0.2em] sm:text-base sm:tracking-[0.25em] uppercase text-parchment/75 font-normal text-center max-w-[90vw] pl-[0.2em] sm:pl-[0.25em]">
          {text('hero.descriptor1', 'hero.descriptor1')}
        </p>
        <p className="hero-entry hero-entry--desc2 mt-3 font-body text-sm tracking-[0.2em] sm:text-base sm:tracking-[0.25em] uppercase text-parchment/60 font-normal text-center max-w-[90vw] pl-[0.2em] sm:pl-[0.25em]">
          {text('hero.descriptor2', 'hero.descriptor2')}
        </p>
      </div>

      <div className="hero-entry hero-entry--cta absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <Link to={get('hero.ctaTo') || '/prelude'} className="flex flex-col items-center gap-4 group">
          <span className="font-body text-sm tracking-[0.4em] uppercase text-parchment/70 pl-[0.4em] group-hover:text-bronze-warm group-hover:tracking-[0.5em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {text('hero.enter', 'hero.enter')}
          </span>
          <div className="hero-cta-line h-12 w-px bg-bronze-warm/80 group-hover:h-16 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
        </Link>
      </div>
    </section>
  );
}
