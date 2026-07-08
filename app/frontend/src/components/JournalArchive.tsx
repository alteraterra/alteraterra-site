import { Link, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslatedArticles, type TranslatedArticle } from '@/data/useTranslatedArticles';
import Hairline from '@/components/Hairline';

/**
 * Journal archive page, SSENSE-editorial-inspired structure (masthead, category
 * rail, disciplined uniform grid) adapted to the Altera Terra canvas
 * (deepblack + bronze + display serif). Calm by design: the only hover motion
 * is the signature bronze hairline.
 */

function ArchiveCard({
  article,
  featured = false,
}: {
  article: TranslatedArticle;
  featured?: boolean;
}) {
  return (
    <Link to={`/journal/${article.slug}`} className="group block h-full">
      <article className="flex h-full flex-col">
        <div className={`relative overflow-hidden mb-5 ${featured ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}>
          <img
            src={article.heroImage}
            alt={article.title}
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-deepblack/15 transition-colors duration-700 group-hover:bg-deepblack/0" />
          {/* Signature motif, bronze hairline grows from left on hover */}
          <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-bronze-warm/80 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        </div>

        {/* Meta line, Category · Date (SSENSE card anatomy) */}
        <p className="mb-2.5 font-body text-[11px] tracking-[0.25em] uppercase">
          <span className="text-bronze-warm whitespace-nowrap">{article.category}</span>
          {article.date && (
            <>
              <span className="mx-2 text-white/30">·</span>
              <span className="text-white/50 whitespace-nowrap">{article.date}</span>
            </>
          )}
        </p>

        <h3
          className={`font-display font-normal text-white/95 leading-snug transition-colors duration-500 group-hover:text-white ${
            featured
              ? 'text-2xl sm:text-3xl md:text-4xl max-w-2xl mb-4'
              : 'text-xl sm:text-[1.35rem] mb-3'
          }`}
        >
          {article.title}
        </h3>

        <p
          className={`font-body text-[13px] sm:text-sm leading-[1.85] text-white/60 ${
            featured ? 'line-clamp-3 max-w-2xl' : 'line-clamp-2'
          }`}
        >
          {article.excerpt}
        </p>
      </article>
    </Link>
  );
}

function CategoryLink({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? 'page' : undefined}
      className={`block whitespace-nowrap text-left font-body text-[12px] tracking-[0.25em] uppercase pb-1 border-b transition-colors duration-500 ${
        active
          ? 'text-bronze-warm border-bronze-warm/70'
          : 'text-white/55 border-transparent hover:text-white/85'
      }`}
    >
      {label}
    </button>
  );
}

export default function JournalArchive() {
  const { t } = useLanguage();
  const articles = useTranslatedArticles();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const categories = useMemo(
    () => [...new Set(articles.map((a) => a.category).filter(Boolean))],
    [articles],
  );

  const filtered = activeCategory
    ? articles.filter((a) => a.category === activeCategory)
    : articles;

  // Featured treatment only on the unfiltered view, filtered views are a pure archive grid.
  const [featured, ...rest] = activeCategory ? [null, ...filtered] : filtered;
  const gridArticles = rest;

  const selectCategory = (category: string | null) => {
    setSearchParams(category ? { category } : {}, { replace: true });
  };

  return (
    <section className="bg-deepblack py-16 sm:py-20 md:py-24 min-h-screen">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* ── Masthead, left-aligned, oversized, archive identity ── */}
        <header className="mb-12 md:mb-16">
          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze-warm block mb-5">
            {t('journal.label')}
          </span>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light text-white/95 leading-[1.05] tracking-[-0.015em]">
            {t('journal.title')}
          </h1>
          <p className="mt-6 font-body text-[15px] sm:text-base leading-[1.85] text-white/70 max-w-xl">
            {t('journal.subtitle')}
          </p>
          <Hairline width="w-24" align="left" className="mt-10" />
        </header>

        {/* ── Mobile category row, horizontal scroll ── */}
        <nav
          aria-label="Journal categories"
          className="lg:hidden mb-10 -mx-5 px-5 sm:-mx-8 sm:px-8 flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <CategoryLink
            label={t('journal.all')}
            active={!activeCategory}
            onSelect={() => selectCategory(null)}
          />
          {categories.map((c) => (
            <CategoryLink
              key={c}
              label={c}
              active={activeCategory === c}
              onSelect={() => selectCategory(c)}
            />
          ))}
        </nav>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* ── Desktop category rail, sticky left sidebar ── */}
          <nav
            aria-label="Journal categories"
            className="hidden lg:block lg:col-span-2"
          >
            <div className="sticky top-28 space-y-4">
              <CategoryLink
                label={t('journal.all')}
                active={!activeCategory}
                onSelect={() => selectCategory(null)}
              />
              {categories.map((c) => (
                <CategoryLink
                  key={c}
                  label={c}
                  active={activeCategory === c}
                  onSelect={() => selectCategory(c)}
                />
              ))}
            </div>
          </nav>

          {/* ── Archive grid ── */}
          <div className="lg:col-span-10">
            {featured && (
              <div className="mb-14 md:mb-16">
                <ArchiveCard article={featured} featured />
              </div>
            )}

            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 md:gap-y-14">
                {gridArticles.map((a) => (
                  <ArchiveCard key={a.slug} article={a} />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <p className="font-body text-sm text-white/50 py-16">
                {t('journal.empty')}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
