import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useReveal } from '@/hooks/useReveal';

const serviceImages = [
  '/cotedazur.jpg',
  '/capri.jpg',
  'https://mgx-backend-cdn.metadl.com/generate/images/1023421/2026-03-13/5511e5d7-e648-4fee-abb3-b3211a84a439.png',
  'https://mgx-backend-cdn.metadl.com/generate/images/1023421/2026-03-13/df931b13-250b-40f3-8030-1ea103aeeff8.png',
  'https://mgx-backend-cdn.metadl.com/generate/images/1023421/2026-03-13/a5d2918e-07d4-497c-b482-d04b492be731.png',
];

const serviceKeys = [
  { title: 'house.s1.title', desc: 'house.s1.desc' },
  { title: 'house.s2.title', desc: 'house.s2.desc' },
  { title: 'house.s3.title', desc: 'house.s3.desc' },
  { title: 'house.s4.title', desc: 'house.s4.desc' },
  { title: 'house.s5.title', desc: 'house.s5.desc' },
];

function ServiceCard({
  id, titleKey, descKey, image, index,
}: {
  id: string; titleKey: string; descKey: string; image: string; index: number;
}) {
  const { ref, visible } = useReveal({ threshold: 0.15 });
  const { t } = useLanguage();

  const isEven = index % 2 === 0;

  return (
    <div
      id={id}
      ref={ref}
      className={`group scroll-mt-32 grid gap-8 md:gap-16 items-center md:grid-cols-2 reveal-${isEven ? 'left' : 'right'} ${visible ? 'revealed' : ''}`}
      style={{ transitionDelay: '180ms' }}
    >
      <div className={`relative overflow-hidden ${isEven ? 'md:order-1' : 'md:order-2'}`}>
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={image}
            alt={t(titleKey)}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
        </div>
      </div>

      <div className={`flex flex-col justify-center ${isEven ? 'md:order-2' : 'md:order-1'}`}>
        <span className="font-body text-[11px] tracking-[0.4em] uppercase text-bronze-warm mb-4 nums-tabular">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="relative inline-block">
          <h3 className="font-display text-2xl font-normal text-charcoal sm:text-3xl md:text-4xl leading-tight">
            {t(titleKey)}
          </h3>
          {/* Hover hairline — bronze line grows from the left under the title */}
          <span
            aria-hidden
            className="absolute left-0 -bottom-1 block h-px w-full bg-bronze-warm origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        </div>
        <div className="mt-5 h-px w-10 bg-gradient-to-r from-bronze-warm/70 to-transparent" />
        <p className="mt-6 font-body text-[15px] leading-[1.85] text-charcoal/75 max-w-md">
          {t(descKey)}
        </p>
      </div>
    </div>
  );
}

/**
 * Right-rail sticky table of contents — desktop only.
 * Sticks to the viewport as the service blocks scroll past on the left.
 * Active index is driven by IntersectionObserver on the service blocks.
 */
function ServiceRail({ activeIndex }: { activeIndex: number }) {
  const { t } = useLanguage();
  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-28 self-start flex flex-col gap-1">
        <span className="font-body text-[10px] tracking-[0.5em] uppercase text-bronze-warm mb-6">
          {t('house.label')}
        </span>
        {serviceKeys.map((sk, i) => {
          const active = i === activeIndex;
          return (
            <a
              key={sk.title}
              href={`#house-${i}`}
              className={`group relative py-3 pl-7 font-body text-[12px] tracking-[0.25em] uppercase transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                active ? 'text-charcoal' : 'text-charcoal/55 hover:text-charcoal/85'
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-px transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  active ? 'w-5 bg-bronze-warm' : 'w-2 bg-charcoal/30 group-hover:w-3 group-hover:bg-bronze-warm/70'
                }`}
              />
              <span className="mr-2 text-charcoal/40 nums-tabular">{String(i + 1).padStart(2, '0')}</span>
              {t(sk.title)}
            </a>
          );
        })}
      </div>
    </aside>
  );
}

export default function TheHouse() {
  const { ref: headerRef, visible: headerVisible } = useReveal({ threshold: 0.3 });
  const { t } = useLanguage();

  // Active service detection
  const [activeIndex, setActiveIndex] = useState(0);
  const blocksRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) {
          const idx = blocksRef.current.findIndex((el) => el === top.target);
          if (idx >= 0) setActiveIndex(idx);
        }
      },
      { rootMargin: '-30% 0px -50% 0px', threshold: 0 }
    );
    blocksRef.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="the-house" className="bg-chalk paper-noise py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-8">
        <header
          ref={headerRef}
          className={`mb-20 md:mb-28 text-center reveal-up ${headerVisible ? 'revealed' : ''}`}
        >
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze-warm block mb-5">
            {t('house.label')}
          </span>
          <h2 className="font-display text-3xl font-normal text-charcoal sm:text-4xl md:text-5xl lg:text-[3rem] leading-tight tracking-[-0.01em] px-2">
            {t('house.title')}
          </h2>
          <p className="mt-6 font-body text-[15px] sm:text-base leading-[1.85] text-charcoal/75 max-w-lg mx-auto">
            {t('house.subtitle')}
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Content scrolls on the left; the rail sticks on the right (desktop) */}
          <div className="lg:col-span-9 space-y-24 md:space-y-32">
            {serviceKeys.map((sk, index) => (
              <div key={sk.title} ref={(el) => { blocksRef.current[index] = el; }}>
                <ServiceCard
                  id={`house-${index}`}
                  titleKey={sk.title}
                  descKey={sk.desc}
                  image={serviceImages[index]}
                  index={index}
                />
              </div>
            ))}
          </div>

          <ServiceRail activeIndex={activeIndex} />
        </div>
      </div>
    </section>
  );
}
