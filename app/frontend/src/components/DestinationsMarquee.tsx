/**
 * Slow horizontal scroll of destination names, a quiet, editorial signal of breadth.
 * Pure CSS animation, no JS scroll listener. Pauses on hover.
 *
 * Items are duplicated so the loop is seamless. Speed scales by item count.
 */
import { useContent } from '@/content/SiteContentContext';

// Ordered by region: Italy → France → Greece → Iberia → Africa → UK → USA → Asia.
const DESTINATIONS = [
  // Italy
  'Capri',
  'Lake Como',
  // France
  'Cap Ferrat',
  'Provence',
  // Greece
  'Santorini',
  'Mykonos',
  // Iberia
  'Comporta',
  // Africa
  'Marrakesh',
  // UK
  'Mayfair',
  // USA
  'Aspen',
  // Asia
  'Kyoto',
];

export default function DestinationsMarquee() {
  const { section, text } = useContent();

  // CMS-managed destinations, falling back to the hardcoded list when absent/empty.
  const cmsDestinations = section('marquee')?.destinations;
  const destinations =
    cmsDestinations && cmsDestinations.length > 0 ? cmsDestinations : DESTINATIONS;

  // Repeat twice for a seamless loop (translate-X(-50%) lands at the start of the second copy)
  const items = [...destinations, ...destinations];

  return (
    <section
      aria-label={text('marquee.ariaLabel', 'Destinations')}
      className="marquee-pause relative bg-deepblack border-y border-white/[0.04] overflow-hidden py-8 md:py-10"
    >
      {/* Edge masks, fade the marquee at left/right edges so items appear & vanish softly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-deepblack to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-deepblack to-transparent z-10" />

      <div className="marquee" style={{ ['--marquee-duration' as never]: '80s' }}>
        {items.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="flex items-center whitespace-nowrap font-display italic text-2xl sm:text-3xl md:text-[2.25rem] text-white/30 hover:text-bronze-warm transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] px-10 md:px-14"
          >
            {d}
            <span aria-hidden className="ml-10 md:ml-14 inline-block h-1 w-1 rounded-full bg-bronze-warm/50" />
          </span>
        ))}
      </div>
    </section>
  );
}
