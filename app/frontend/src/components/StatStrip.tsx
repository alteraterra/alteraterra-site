import { useEffect, useRef, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { useLanguage } from '@/i18n/LanguageContext';
import { useContent } from '@/content/SiteContentContext';

interface Stat {
  value: number;
  suffixKey?: string;
  labelKey: string;
}

const STATS: Stat[] = [
  { value: 18, suffixKey: 'stat.plus', labelKey: 'stat.years' },
  { value: 42, labelKey: 'stat.destinations' },
  { value: 6,  labelKey: 'stat.continents' },
  { value: 1,  labelKey: 'stat.standard' },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({
  to, suffix = '', duration = 1400, start,
}: { to: number; suffix?: string; duration?: number; start: boolean }) {
  const [n, setN] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(to);
      return;
    }
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setN(Math.round(easeOutCubic(p) * to));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [start, to, duration]);

  return (
    <span className="nums-tabular">
      {n}{suffix}
    </span>
  );
}

/**
 * Discreet stats band, count-in animation on scroll.
 * Inspired by 21st.dev number tickers; restrained typography and palette
 * so the numbers feel like editorial chapter heads, not dashboard KPIs.
 */
export default function StatStrip() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.4 });
  const { t } = useLanguage();
  const { section } = useContent();

  const cmsItems = section('stats')?.items;
  const items =
    cmsItems && cmsItems.length > 0
      ? cmsItems.map((it, i) => ({
          key: `cms-${i}`,
          value: it.value ?? 0,
          suffix: it.suffix ?? '',
          label: it.label ?? '',
        }))
      : STATS.map((s) => ({
          key: s.labelKey,
          value: s.value,
          suffix: s.suffixKey ? t(s.suffixKey) : '',
          label: t(s.labelKey),
        }));

  return (
    <section className="bg-deepblack py-20 md:py-24 border-t border-white/[0.04]">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-8 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 reveal-up ${visible ? 'revealed' : ''}`}
      >
        {items.map((s, i) => (
          <div key={s.key} className="text-center" style={{ transitionDelay: `${i * 90}ms` }}>
            <div className="font-display text-4xl sm:text-5xl md:text-6xl font-normal text-white/95 tracking-[-0.02em] leading-none">
              <AnimatedNumber to={s.value} suffix={s.suffix} start={visible} />
            </div>
            <div className="mx-auto mt-5 h-px w-6 bg-bronze-warm/60" />
            <p className="mt-5 font-body text-[11px] tracking-[0.35em] uppercase text-white/65">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
