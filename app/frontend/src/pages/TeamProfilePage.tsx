import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useContent } from '@/content/SiteContentContext';
import NotFound from '@/pages/NotFound';

/**
 * Generic team-member profile page for /team/:slug.
 * Content comes from the CMS `profiles` section (managed in Admin > Site > Profiles);
 * the two founders keep i18n fallbacks so their pages survive an empty CMS.
 * Unknown slugs render the 404 page.
 */
const FALLBACKS: Record<
  string,
  { name: string; roleKey: string; image: string; objectPosition: string; bioKeys: string[] }
> = {
  'domenico-morelli': {
    name: 'Domenico Morelli',
    roleKey: 'domenico.role',
    image: '/assets/domenico-morelli.jpg',
    objectPosition: 'center 20%',
    bioKeys: ['domenico.p1', 'domenico.p2', 'domenico.p3', 'domenico.p4', 'domenico.p5', 'domenico.p6'],
  },
  'oscar-motta': {
    name: 'Oscar Motta',
    roleKey: 'oscar.role',
    image: '/assets/oscar-motta.jpg',
    objectPosition: 'center 15%',
    bioKeys: ['oscar.p1', 'oscar.p2', 'oscar.p3', 'oscar.p4'],
  },
};

export default function TeamProfilePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();
  const { section } = useContent();

  const profile = section('profiles')?.[slug];
  const fallback = FALLBACKS[slug];

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

  if (!profile && !fallback) return <NotFound />;

  const name = profile?.name || fallback?.name || '';
  const role = profile?.role || (fallback ? t(fallback.roleKey) : '');
  const image = profile?.image || fallback?.image || '';
  const imageAlt = profile?.imageAlt || name;
  const objectPosition = profile?.objectPosition || fallback?.objectPosition || 'center';
  const bio =
    profile?.bio && profile.bio.length > 0
      ? profile.bio
      : fallback
        ? fallback.bioKeys.map((k) => t(k))
        : [];

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
                {image && (
                  <img
                    src={image}
                    alt={imageAlt}
                    className="w-full h-full object-cover"
                    style={{ objectPosition }}
                  />
                )}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-deepblack/40 via-transparent to-transparent" />
              </div>
            </div>

            <div className="flex-1">
              <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze/75 block mb-4">
                {t('profile.label')}
              </span>

              <h1 className="font-display text-3xl md:text-4xl font-light text-white/90 leading-relaxed">
                {name}
              </h1>

              <p className="mt-3 font-body text-[12px] tracking-[0.25em] uppercase text-bronze/75">
                {role}
              </p>

              <div className="mt-10 mx-auto h-px w-10 bg-gradient-to-r from-bronze/30 to-transparent" />

              <div className="mt-10 space-y-6">
                {bio.map((paragraph, i) => (
                  <p
                    key={i}
                    className={`font-body text-[13px] leading-[2.2] text-white/70${
                      i === bio.length - 1 ? ' italic' : ''
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
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
