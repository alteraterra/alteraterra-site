import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';

export default function DomenicoProfilePage() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Layout>
      <section ref={ref} className="bg-deepblack relative py-28 md:py-36">
        <div className="mx-auto max-w-4xl px-8 mb-16">
          <Link
            to="/meet-the-team"
            className="group inline-flex items-center gap-3 font-body text-[11px] tracking-[0.3em] uppercase text-white/70 hover:text-bronze-warm transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            <span aria-hidden className="inline-block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-1">←</span>
            <span>{t('profile.back')}</span>
          </Link>
        </div>

        <div
          className={`mx-auto max-w-4xl px-8 transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden">
                <div className="absolute inset-0 rounded-full border border-white/[0.06] z-10" />
                <img
                  src="/assets/domenico-morelli.jpg"
                  alt="Domenico Morelli"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 20%' }}
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-deepblack/40 via-transparent to-transparent" />
              </div>
            </div>

            <div className="flex-1">
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze/75 block mb-4">
                {t('profile.label')}
              </span>

              <h1 className="font-display text-3xl md:text-4xl font-light text-white/90 leading-relaxed">
                Domenico Morelli
              </h1>

              <p className="mt-3 font-body text-[12px] tracking-[0.25em] uppercase text-bronze/75">
                {t('domenico.role')}
              </p>

              <div className="mt-10 mx-auto h-px w-10 bg-gradient-to-r from-bronze/30 to-transparent" />

              <div className="mt-10 space-y-6">
                <p className="font-body text-[13px] leading-[2.2] text-white/70">
                  {t('domenico.p1')}
                </p>
                <p className="font-body text-[13px] leading-[2.2] text-white/70">
                  {t('domenico.p2')}
                </p>
                <p className="font-body text-[13px] leading-[2.2] text-white/70">
                  {t('domenico.p3')}
                </p>
                <p className="font-body text-[13px] leading-[2.2] text-white/70">
                  {t('domenico.p4')}
                </p>
                <p className="font-body text-[13px] leading-[2.2] text-white/70">
                  {t('domenico.p5')}
                </p>
                <p className="font-body text-[13px] leading-[2.2] text-white/70 italic">
                  {t('domenico.p6')}
                </p>
              </div>

              <div className="mt-14">
                <Link
                  to="/consultation"
                  className="group inline-flex items-center gap-3 font-body text-xs tracking-[0.35em] uppercase text-white/85 border border-bronze/50 px-10 py-4 hover:text-white hover:border-bronze-warm transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                  <span>{t('enquiry.cta')}</span>
                  <span aria-hidden className="inline-block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 text-bronze-warm">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-28 h-px w-16 bg-gradient-to-r from-transparent via-bronze/20 to-transparent" />
      </section>
    </Layout>
  );
}