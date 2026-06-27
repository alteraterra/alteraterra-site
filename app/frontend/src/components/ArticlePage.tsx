import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTranslatedArticles, type TranslatedArticle } from '@/data/useTranslatedArticles';
import type { ArticleSection } from '@/data/journalArticles';

/* ─── Reading progress bar — writes to a CSS variable via rAF, zero React state ─── */
function ReadingProgress() {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      document.documentElement.style.setProperty('--read-progress', `${pct}%`);
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty('--read-progress');
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-bronze-warm/70 to-bronze-warm"
        style={{ width: 'var(--read-progress, 0%)', transition: 'width 80ms linear' }}
      />
    </div>
  );
}

/* ─── Fade-in hook → unified useReveal ─── */
import { useReveal } from '@/hooks/useReveal';
const useFadeIn = (threshold = 0.15) => useReveal({ threshold });

/* ─── Hero — full viewport, cinematic ─── */
function HeroSection({ article }: { article: TranslatedArticle }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Hide scroll-hint once user has scrolled past ~10% of document height (rAF-throttled).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let frame = 0;
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? window.scrollY / h : 0;
      if (pct > 0.1) setHintHidden(true);
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Parallax: write transform via rAF, never via React state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      const img = imgRef.current;
      if (img) img.style.transform = `translate3d(0, ${window.scrollY * 0.18}px, 0) scale(1.03)`;
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="relative min-h-[70vh] md:min-h-[72vh] lg:min-h-[78vh] overflow-hidden">
      {/* Parallax image */}
      <img
        ref={imgRef}
        src={article.heroImage}
        alt={article.title}
        className="absolute inset-0 h-[112%] w-full object-cover transition-opacity duration-1000 will-change-transform"
        style={{ opacity: loaded ? 1 : 0 }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-deepblack/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-deepblack via-deepblack/20 to-transparent" />

      {/* Content — positioned at bottom */}
      <div className="absolute inset-0 flex flex-col justify-end px-5 sm:px-8 pb-16 sm:pb-20 md:pb-28 lg:pb-32">
        <div className="mx-auto w-full max-w-4xl">
          <span
            className={`inline-block font-body text-xs tracking-[0.5em] sm:tracking-[0.6em] uppercase text-bronze/90 mb-4 sm:mb-5 transition-all duration-1000 delay-300 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {article.category}
          </span>
          <h1
            className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-light text-white leading-[1.15] sm:leading-[1.15] max-w-3xl transition-all duration-1000 delay-500 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {article.title}
          </h1>
          <p
            className={`font-display text-sm sm:text-base md:text-lg font-light text-white/70 italic mt-4 sm:mt-6 max-w-xl leading-relaxed transition-all duration-1000 delay-700 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {article.excerpt}
          </p>

          {/* Meta row */}
          <div
            className={`flex items-center gap-4 sm:gap-5 mt-6 sm:mt-8 transition-all duration-1000 delay-[900ms] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="font-body text-xs tracking-[0.25em] text-white/70 uppercase">
              {article.date}
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="font-body text-xs tracking-[0.25em] text-white/70 uppercase">
              {article.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll hint — hidden on small mobile, fades out once user scrolls past 10% of doc */}
      <div
        className={`absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-[1200ms] hidden sm:block ${
          loaded && !hintHidden ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/20 to-white/40" />
      </div>
    </section>
  );
}

/* ─── Section renderers ─── */

function TextSection({ content, isFirst }: { content: string; isFirst: boolean }) {
  const { ref, visible } = useFadeIn();
  const first = content.charAt(0);
  const rest = content.slice(1);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {isFirst ? (
        <p className="font-body text-[15px] sm:text-[16px] md:text-[17px] leading-[1.9] sm:leading-[2] text-charcoal/80 mb-8 sm:mb-10 max-w-2xl mx-auto break-words overflow-wrap-anywhere">
          <span className="float-left font-display text-[3rem] sm:text-[4.5rem] md:text-[5rem] leading-[0.72] mr-2 sm:mr-4 mt-1 text-bronze/70 font-light select-none">
            {first}
          </span>
          {rest}
        </p>
      ) : (
        <p className="font-body text-[14px] sm:text-[15px] md:text-[16px] leading-[1.9] sm:leading-[2] text-charcoal/70 mb-6 sm:mb-8 max-w-2xl mx-auto break-words">
          {content}
        </p>
      )}
    </div>
  );
}

function SubheadingSection({ content }: { content: string }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`max-w-2xl mx-auto transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <div className="my-10 sm:my-14">
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-bronze/20" />
          <div className="h-1 w-1 rounded-full bg-bronze/30 shrink-0" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-bronze/20" />
        </div>
        <h3 className="font-display text-base sm:text-lg md:text-xl font-light text-charcoal/80 tracking-[0.1em] sm:tracking-[0.15em] uppercase text-center break-words">
          {content}
        </h3>
      </div>
    </div>
  );
}

function ImageSection({ content, caption }: { content: string; caption?: string }) {
  const { ref, visible } = useFadeIn(0.05);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Image — sits within the reading column on mobile, gently extends past it on desktop (never full-bleed) */}
      <figure className="my-14 sm:my-20 md:my-28 relative">
        {/* breathing space — bronze hairline rests the eye before & after */}
        <div className="mx-auto mb-10 sm:mb-14 h-px w-16 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />
        <div className="relative mx-0 sm:-mx-4 md:-mx-12 lg:-mx-20 overflow-hidden rounded-sm">
          <div className="relative aspect-[16/10] max-h-[68vh] mx-auto">
            <img
              src={content}
              alt={caption || ''}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
                imgLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105'
              }`}
            />
            {/* Subtle vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.15)]" />
          </div>
        </div>
        {caption && (
          <figcaption className="mt-5 sm:mt-7 px-1 font-body text-[13px] leading-[1.7] text-charcoal/65 italic text-center max-w-lg mx-auto">
            {caption}
          </figcaption>
        )}
        {/* trailing hairline to settle the eye before continuing prose */}
        <div className="mx-auto mt-10 sm:mt-14 h-px w-16 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />
      </figure>
    </div>
  );
}

function QuoteSection({ content }: { content: string }) {
  const { ref, visible } = useFadeIn();

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {/* Dark mood break — extends a touch past the column on desktop, never full-bleed */}
      <div className="my-12 sm:my-16 md:my-24 mx-0 sm:-mx-4 md:-mx-12 lg:-mx-20 bg-deepblack py-14 sm:py-20 md:py-24 px-5 sm:px-8 rounded-sm relative overflow-hidden">
        {/* Off-center bronze hairline above quote */}
        <div className="mx-auto mb-8 sm:mb-10 h-px w-12 bg-gradient-to-r from-transparent via-bronze-warm/80 to-transparent" />
        <blockquote className="max-w-3xl mx-auto text-center">
          <p className="font-display text-xl sm:text-2xl md:text-[1.7rem] lg:text-[1.85rem] font-normal leading-[1.5] sm:leading-[1.55] text-white/90 italic">
            {content}
          </p>
          <footer className="mx-auto mt-8 sm:mt-10 flex items-center justify-center gap-3">
            <span className="block h-px w-8 bg-bronze-warm/70" />
            <span className="font-body text-[11px] tracking-[0.4em] uppercase text-bronze-warm/85">Altera Terra</span>
            <span className="block h-px w-8 bg-bronze-warm/70" />
          </footer>
        </blockquote>
      </div>
    </div>
  );
}

/* ─── Callout — bronze-warm left rule on parchment, optional italic title ─── */
function CalloutSection({ content, title }: { content: string; title?: string }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <aside
        role="note"
        className="my-10 sm:my-14 max-w-2xl mx-auto border-l-2 border-bronze-warm bg-parchment/60 px-5 sm:px-7 py-5 sm:py-6 rounded-sm"
      >
        {title && (
          <p className="font-display italic text-[15px] sm:text-[16px] text-charcoal/85 mb-2 leading-snug">
            {title}
          </p>
        )}
        <p className="font-body text-[14px] sm:text-[15px] leading-[1.7] text-charcoal/80 break-words">
          {content}
        </p>
      </aside>
    </div>
  );
}

/* ─── FAQ — <dl> with bronze-warm dividers between items ─── */
function FaqSection({ items }: { items: { question: string; answer: string }[] }) {
  const { ref, visible } = useFadeIn();
  if (!items || items.length === 0) return null;
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      <dl className="my-12 sm:my-16 max-w-2xl mx-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className={`py-5 sm:py-6 ${i > 0 ? 'border-t border-bronze-warm/25' : ''}`}
          >
            <dt className="font-display text-lg sm:text-xl font-light text-charcoal/90 leading-snug mb-2 break-words">
              {item.question}
            </dt>
            <dd className="font-body text-[14px] sm:text-[15px] leading-[1.8] text-charcoal/70 break-words">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SectionRenderer({ section, isFirst }: { section: ArticleSection; isFirst: boolean }) {
  switch (section.type) {
    case 'text':
      return <TextSection content={section.content} isFirst={isFirst} />;
    case 'subheading':
      return <SubheadingSection content={section.content} />;
    case 'image':
      return <ImageSection content={section.content} caption={section.caption} />;
    case 'quote':
      return <QuoteSection content={section.content} />;
    case 'callout':
      return <CalloutSection content={section.content} title={section.title} />;
    case 'faq':
      return <FaqSection items={section.items} />;
    default:
      return null;
  }
}

/* ─── Continue Reading ─── */
function ContinueReading({
  prevArticle,
  nextArticle,
}: {
  prevArticle: TranslatedArticle | null;
  nextArticle: TranslatedArticle | null;
}) {
  const { ref, visible } = useFadeIn(0.1);
  const { t } = useLanguage();

  if (!prevArticle && !nextArticle) return null;

  const ArticleCard = ({
    article,
    label,
    align = 'left',
  }: {
    article: TranslatedArticle;
    label: string;
    align?: 'left' | 'right';
  }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <Link
        to={`/journal/${article.slug}`}
        className="group block relative overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative h-56 sm:h-64 md:h-80 overflow-hidden">
          <img
            src={article.heroImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
          <div className="absolute inset-0 bg-deepblack/55 group-hover:bg-deepblack/40 transition-colors duration-700" />
          <div
            className={`absolute inset-0 flex flex-col justify-end p-5 sm:p-8 ${
              align === 'right' ? 'items-end text-right' : ''
            }`}
          >
            <span className="font-body text-xs tracking-[0.4em] uppercase text-bronze mb-2">
              {label}
            </span>
            <span className="font-body text-[11px] tracking-[0.3em] uppercase text-white/70 mb-3">
              {article.category}
            </span>
            <span className="font-display text-xl sm:text-2xl md:text-[1.65rem] font-normal text-white/95 group-hover:text-white transition-colors duration-700 leading-snug max-w-sm">
              {article.title}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="bg-deepblack py-14 sm:py-20 md:py-28">
      <div
        ref={ref}
        className={`mx-auto max-w-6xl px-5 sm:px-8 transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <p className="text-center font-body text-xs tracking-[0.5em] uppercase text-bronze mb-10 sm:mb-14">
          {t('journal.continue')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {prevArticle && (
            <ArticleCard article={prevArticle} label={t('journal.prev')} />
          )}
          {nextArticle && (
            <ArticleCard
              article={nextArticle}
              label={t('journal.next')}
              align="right"
            />
          )}
        </div>
        <div className="text-center mt-12 sm:mt-16">
          <Link
            to="/journal"
            className="inline-block font-body text-xs tracking-[0.4em] uppercase text-white/85 hover:text-bronze transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border-b border-bronze/30 hover:border-bronze pb-1.5"
          >
            {t('journal.viewall')}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Article Page ─── */
export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const articles = useTranslatedArticles();
  const article = articles.find((a) => a.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const goBack = useCallback(() => navigate('/journal'), [navigate]);

  if (!article) {
    goBack();
    return null;
  }

  const idx = articles.findIndex((a) => a.slug === slug);
  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx < articles.length - 1 ? articles[idx + 1] : null;

  let firstTextSeen = false;

  return (
    <Layout>
      <ReadingProgress />
      <HeroSection article={article} />

      {/* Article body — overflow-x-hidden prevents horizontal scroll from full-bleed elements */}
      <article className="bg-parchment paper-noise py-14 sm:py-20 md:py-28 overflow-x-hidden">
        <div className="mx-auto max-w-3xl px-4 sm:px-8">
          {/* Opening ornament */}
          <div className="mx-auto mb-12 sm:mb-16 flex flex-col items-center gap-3">
            <div className="h-8 w-px bg-gradient-to-b from-transparent to-bronze/30" />
            <div className="h-1.5 w-1.5 rounded-full bg-bronze/30" />
          </div>

          {/* Sections */}
          {article.sections.map((section, i) => {
            const isFirst = section.type === 'text' && !firstTextSeen;
            if (section.type === 'text') firstTextSeen = true;
            return <SectionRenderer key={i} section={section} isFirst={isFirst} />;
          })}

          {/* Closing ornament */}
          <div className="mx-auto mt-14 sm:mt-20 flex flex-col items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-bronze/30" />
            <div className="h-8 w-px bg-gradient-to-t from-transparent to-bronze/30" />
            <span className="font-display text-sm text-bronze/60 tracking-[0.5em] mt-2">
              ✦
            </span>
          </div>
        </div>
      </article>

      <ContinueReading prevArticle={prev} nextArticle={next} />
    </Layout>
  );
}