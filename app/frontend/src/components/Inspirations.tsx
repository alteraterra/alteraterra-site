import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslatedArticles, type TranslatedArticle } from '@/data/useTranslatedArticles';
import { useReveal } from '@/hooks/useReveal';
import Hairline from '@/components/Hairline';

type Size = 'feature' | 'large' | 'standard' | 'tall';

function ArticleCard({
  article,
  size = 'standard',
  index,
}: {
  article: TranslatedArticle;
  size?: Size;
  index: number;
}) {
  const { ref, visible } = useReveal({ threshold: 0.12 });
  const { t } = useLanguage();

  // Each size gets its own image aspect + title scale — drives editorial rhythm.
  const aspect =
    size === 'feature' ? 'aspect-[16/9]' :
    size === 'large'   ? 'aspect-[4/3]' :
    size === 'tall'    ? 'aspect-[3/4]' :
                         'aspect-[4/3]';
  const titleScale =
    size === 'feature' ? 'font-display text-2xl sm:text-3xl md:text-4xl' :
    size === 'large'   ? 'font-display text-xl sm:text-2xl md:text-[1.6rem]' :
    size === 'tall'    ? 'font-display text-xl sm:text-[1.4rem]' :
                         'font-display text-xl sm:text-[1.4rem]';
  const excerptLines =
    size === 'feature' ? 'line-clamp-3 sm:line-clamp-4' :
    size === 'large'   ? 'line-clamp-3' :
                         'line-clamp-3';

  return (
    <Link to={`/journal/${article.slug}`} className="block">
      <article
        ref={ref}
        className={`reveal-up ${visible ? 'revealed' : ''} group h-full flex flex-col`}
        style={{ transitionDelay: `${(index % 4) * 90}ms` }}
      >
        <div className={`relative overflow-hidden mb-5 sm:mb-6 ${aspect} ${size === 'feature' ? 'border-beam rounded-sm' : ''}`}>
          <img
            src={article.heroImage}
            alt={article.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-deepblack/15 group-hover:bg-deepblack/5 transition-colors duration-700" />
          {/* Bronze hairline that grows from left on hover — signature motif */}
          <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-bronze-warm/80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        </div>

        <span className="font-body text-[11px] tracking-[0.4em] uppercase text-bronze-warm block mb-2 sm:mb-3">
          {article.category}
        </span>

        <h4 className={`${titleScale} font-normal text-white/95 leading-snug mb-3 group-hover:text-white transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
          {article.title}
        </h4>

        <p className={`font-body text-[13px] sm:text-sm leading-[1.85] text-white/65 group-hover:text-white/80 transition-colors duration-700 ${excerptLines}`}>
          {article.excerpt}
        </p>

        <span className="inline-block mt-5 font-body text-[11px] tracking-[0.35em] uppercase text-bronze/85 group-hover:text-bronze-warm group-hover:tracking-[0.45em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {t('journal.readmore')}
        </span>
      </article>
    </Link>
  );
}

export default function Inspirations() {
  const { ref: headerRef, visible: headerVisible } = useReveal({ threshold: 0.2 });
  const { t } = useLanguage();
  const articles = useTranslatedArticles();

  const [featured, ...rest] = articles;
  const subFeatured = rest.slice(0, 2);          // 2 cards next to the feature on desktop
  const middleBand = rest.slice(2, 5);           // 3-up
  const mosaicBand = rest.slice(5, 8);           // tall + 2 stacked = magazine feel
  const tailBand   = rest.slice(8);              // remaining standard cards

  return (
    <section id="journal" className="bg-deepblack py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── Header ── */}
        <header
          ref={headerRef}
          className={`text-center mb-16 md:mb-24 reveal-up ${headerVisible ? 'revealed' : ''}`}
        >
          <div className="mx-auto mb-10 h-px w-10 bg-gradient-to-r from-transparent via-bronze/50 to-transparent" />
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze-warm block mb-6">
            {t('journal.label')}
          </span>
          <h2 className="font-display text-3xl font-normal text-white/95 sm:text-4xl md:text-5xl leading-tight tracking-[-0.01em] px-2">
            {t('journal.title')}
          </h2>
          <p className="mt-7 font-body text-[15px] sm:text-base leading-[1.85] text-white/75 max-w-xl mx-auto">
            {t('journal.subtitle')}
          </p>
        </header>

        {/* ── Editorial mosaic ── */}
        {/* Featured + 2 small (desktop): 7 / 5 split */}
        {featured && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-16 md:mb-20">
            <div className="lg:col-span-7">
              <ArticleCard article={featured} size="feature" index={0} />
            </div>
            {subFeatured.length > 0 && (
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 md:gap-10">
                {subFeatured.map((a, i) => (
                  <ArticleCard key={a.slug} article={a} size="standard" index={i + 1} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hairline divider between bands */}
        {middleBand.length > 0 && (
          <Hairline width="w-24" className="mb-16 md:mb-20" />
        )}

        {/* Three-up band */}
        {middleBand.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16 md:mb-20">
            {middleBand.map((a, i) => (
              <ArticleCard key={a.slug} article={a} size="standard" index={i + 3} />
            ))}
          </div>
        )}

        {/* Magazine asymmetric band: tall on left, two stacked on right */}
        {mosaicBand.length > 0 && (
          <>
            <Hairline width="w-24" className="mb-16 md:mb-20" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-16 md:mb-20">
              <div className="lg:col-span-5">
                <ArticleCard article={mosaicBand[0]} size="tall" index={6} />
              </div>
              {mosaicBand.slice(1).length > 0 && (
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8 md:gap-10">
                  {mosaicBand.slice(1).map((a, i) => (
                    <ArticleCard key={a.slug} article={a} size="large" index={i + 7} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Tail band — remaining articles in standard 3-up */}
        {tailBand.length > 0 && (
          <>
            <Hairline width="w-24" className="mb-16 md:mb-20" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {tailBand.map((a, i) => (
                <ArticleCard key={a.slug} article={a} size="standard" index={i + 9} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
