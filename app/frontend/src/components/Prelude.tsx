import { useReveal } from '@/hooks/useReveal';
import { useContent } from '@/content/SiteContentContext';

function PreludeText() {
  const { ref, visible } = useReveal<HTMLElement>({ threshold: 0.15 });
  const { text } = useContent();

  return (
    <section
      id="prelude"
      ref={ref}
      className="bg-parchment paper-noise py-24 md:py-32 flex items-center min-h-[70vh]"
    >
      <div className="mx-auto max-w-3xl px-8 text-center">
        <div
          className={`mx-auto mb-14 h-px w-12 bg-gradient-to-r from-transparent via-bronze/50 to-transparent transition-all duration-1000 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Opening, the WHY */}
        <p
          className={`font-display text-lg font-light leading-[1.8] text-charcoal/85 sm:text-2xl md:text-[1.75rem] lg:text-3xl transition-all duration-1000 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {(() => {
            const p1 = text('prelude.p1', 'prelude.p1');
            const first = p1.charAt(0);
            const rest = p1.slice(1);
            return (
              <>
                <span className="float-left font-display text-[3.5rem] sm:text-[5rem] md:text-[6rem] leading-[0.72] mr-3 sm:mr-4 mt-1 text-bronze-warm/70 font-normal select-none">
                  {first}
                </span>
                {rest}
              </>
            );
          })()}
        </p>

        {/* Values, the DNA */}
        <p
          className={`mt-10 font-display text-base font-light leading-[1.8] text-charcoal/80 italic sm:text-xl md:text-2xl transition-all duration-1000 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {text('prelude.p2', 'prelude.p2')}
        </p>

        <div
          className={`mx-auto mt-16 h-px w-24 bg-gradient-to-r from-transparent via-bronze/40 to-transparent transition-all duration-1000 delay-700 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* The collective identity, visually elevated */}
        <p
          className={`mt-16 font-display text-lg font-normal leading-[1.85] text-charcoal sm:text-xl md:text-2xl tracking-wide transition-all duration-1000 delay-[900ms] ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {text('prelude.p3', 'prelude.p3')}
        </p>
      </div>
    </section>
  );
}

function PrivateWorld() {
  const { ref, visible } = useReveal<HTMLElement>({ threshold: 0.1 });
  const { text, img } = useContent();

  return (
    <section ref={ref} className="relative">
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={img('prelude.image', '/santorini.jpg')}
          alt={text('prelude.imageAlt', 'Whitewashed Cycladic village at twilight')}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-deepblack/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-deepblack/40 via-transparent to-deepblack/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
          <p
            className={`font-body text-[11px] tracking-[0.5em] uppercase text-bronze mb-8 transition-all duration-1000 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {text('prelude.private', 'prelude.private')}
          </p>
          <blockquote
            className={`font-display text-xl font-normal leading-[1.5] text-white text-center max-w-3xl italic sm:text-3xl md:text-4xl lg:text-[2.5rem] transition-all duration-1000 delay-300 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            {text('prelude.quote', 'prelude.quote')}
          </blockquote>
          <p
            className={`mt-10 font-display text-lg font-normal tracking-[0.15em] text-bronze italic transition-all duration-1000 delay-500 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {text('prelude.closing', 'prelude.closing')}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Prelude() {
  return (
    <>
      <PreludeText />
      <PrivateWorld />
    </>
  );
}