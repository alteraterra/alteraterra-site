import type {
  Block,
  ParagraphBlock,
  HeadingBlock,
  QuoteBlock,
  ImageBlock,
  CalloutBlock,
  FaqBlock,
} from '@/types/blog';

/**
 * Public read-only renderer for blog Block[].
 *
 * Server-renderable, does not touch window/document, does not instantiate a
 * TipTap editor.  Mirrors the typographic system used in ArticlePage.tsx
 * (Cormorant headings, Inter body, bronze hairlines, parchment surface).
 *
 * The first paragraph in the stream receives the bronze drop-cap treatment,
 * matching the public article layout.
 */

type Props = {
  blocks: Block[] | null | undefined;
  /** When true, dim the drop-cap on the first paragraph (used in previews). */
  disableDropCap?: boolean;
};

export default function ReadOnlyRenderer({ blocks, disableDropCap }: Props) {
  if (!blocks || blocks.length === 0) return null;

  let firstParaSeen = false;

  return (
    <div className="alterra-article">
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'paragraph': {
            const isFirst = !firstParaSeen && !disableDropCap;
            firstParaSeen = true;
            return (
              <ParagraphView key={i} block={block} isFirst={isFirst} />
            );
          }
          case 'heading':
            return <HeadingView key={i} block={block} />;
          case 'quote':
            return <QuoteView key={i} block={block} />;
          case 'image':
            return <ImageView key={i} block={block} />;
          case 'callout':
            return <CalloutView key={i} block={block} />;
          case 'faq':
            return <FaqView key={i} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Block views, typography matches the public ArticlePage.
 * ────────────────────────────────────────────────────────────────────────── */

function ParagraphView({
  block,
  isFirst,
}: {
  block: ParagraphBlock;
  isFirst: boolean;
}) {
  // Drop-cap: only meaningful if the paragraph starts with a plain letter.
  // We let dangerouslySetInnerHTML carry inline formatting; the drop-cap is
  // applied via a CSS pseudo on the parent paragraph.
  if (isFirst) {
    return (
      <p
        className={[
          'font-body text-[15px] sm:text-[16px] md:text-[17px]',
          'leading-[1.9] sm:leading-[2] text-charcoal/80',
          'mb-8 sm:mb-10 max-w-2xl mx-auto break-words',
          // Drop-cap via :first-letter, bronze, display face.
          'first-letter:float-left first-letter:mr-2 sm:first-letter:mr-4',
          'first-letter:mt-1 first-letter:font-display first-letter:font-light',
          'first-letter:text-[3rem] sm:first-letter:text-[4.5rem] md:first-letter:text-[5rem]',
          'first-letter:leading-[0.72] first-letter:text-bronze/70',
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  }

  return (
    <p
      className={[
        'font-body text-[14px] sm:text-[15px] md:text-[16px]',
        'leading-[1.9] sm:leading-[2] text-charcoal/75',
        'mb-6 sm:mb-8 max-w-2xl mx-auto break-words',
      ].join(' ')}
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

function HeadingView({ block }: { block: HeadingBlock }) {
  if (block.level === 2) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="my-10 sm:my-14">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-bronze/20" />
            <div className="h-1 w-1 rounded-full bg-bronze/30 shrink-0" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-bronze/20" />
          </div>
          <h2 className="font-display text-base sm:text-lg md:text-xl font-light text-charcoal/80 tracking-[0.1em] sm:tracking-[0.15em] uppercase text-center break-words">
            {block.text}
          </h2>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      <h3 className="font-display text-lg sm:text-xl font-light text-charcoal/85 tracking-[0.08em] mt-10 mb-4 break-words">
        {block.text}
      </h3>
    </div>
  );
}

function QuoteView({ block }: { block: QuoteBlock }) {
  return (
    <div className="my-12 sm:my-16 md:my-24 mx-0 sm:-mx-4 md:-mx-12 lg:-mx-20 bg-deepblack py-14 sm:py-20 md:py-24 px-5 sm:px-8 rounded-sm relative overflow-hidden">
      <div className="mx-auto mb-8 sm:mb-10 h-px w-12 bg-gradient-to-r from-transparent via-bronze-warm/80 to-transparent" />
      <blockquote className="max-w-3xl mx-auto text-center">
        <p className="font-display text-xl sm:text-2xl md:text-[1.7rem] lg:text-[1.85rem] font-normal leading-[1.5] sm:leading-[1.55] text-white/90 italic">
          {block.text}
        </p>
        <footer className="mx-auto mt-8 sm:mt-10 flex items-center justify-center gap-3">
          <span className="block h-px w-8 bg-bronze-warm/70" />
          <span className="font-body text-[11px] tracking-[0.4em] uppercase text-bronze-warm/85">
            {block.attribution ?? 'Altera Terra'}
          </span>
          <span className="block h-px w-8 bg-bronze-warm/70" />
        </footer>
      </blockquote>
    </div>
  );
}

function ImageView({ block }: { block: ImageBlock }) {
  return (
    <figure className="my-14 sm:my-20 md:my-28 relative">
      <div className="mx-auto mb-10 sm:mb-14 h-px w-16 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />
      <div className="relative mx-0 sm:-mx-4 md:-mx-12 lg:-mx-20 overflow-hidden rounded-sm">
        <div className="relative aspect-[16/10] max-h-[68vh] mx-auto">
          <img
            src={block.src}
            alt={block.alt ?? block.caption ?? ''}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.15)]" />
        </div>
      </div>
      {block.caption && (
        <figcaption className="mt-5 sm:mt-7 px-1 font-body text-[13px] leading-[1.7] text-charcoal/65 italic text-center max-w-lg mx-auto">
          {block.caption}
        </figcaption>
      )}
      <div className="mx-auto mt-10 sm:mt-14 h-px w-16 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />
    </figure>
  );
}

function CalloutView({ block }: { block: CalloutBlock }) {
  return (
    <aside
      className={[
        'my-10 sm:my-12 mx-auto max-w-2xl',
        'border-l-2 border-bronze-warm bg-parchment/80',
        'px-5 sm:px-6 py-5 sm:py-6 rounded-sm',
      ].join(' ')}
      data-type="callout"
    >
      {block.title && (
        <p className="font-display italic text-bronze text-sm tracking-wide mb-2">
          {block.title}
        </p>
      )}
      <div
        className="font-body text-[14px] sm:text-[15px] leading-[1.85] text-charcoal/85 [&_p]:my-2 [&_a]:text-bronze [&_a]:underline [&_a]:underline-offset-4"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    </aside>
  );
}

function FaqView({ block }: { block: FaqBlock }) {
  if (!block.items || block.items.length === 0) return null;
  return (
    <section
      className="my-14 sm:my-20 max-w-2xl mx-auto"
      // schema.org/FAQPage microdata, wired through here so the SEO phase
      // can layer JSON-LD on top without changing the DOM.
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <header className="mb-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-bronze-warm/30" />
        <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze-warm">
          Frequently Asked
        </span>
        <span className="h-px flex-1 bg-bronze-warm/30" />
      </header>

      <div className="divide-y divide-bronze-warm/15">
        {block.items.map((item, i) => (
          <details
            key={i}
            className="group py-4"
            itemScope
            itemProp="mainEntity"
            itemType="https://schema.org/Question"
          >
            <summary
              className={[
                'cursor-pointer list-none flex items-center justify-between gap-4',
                'font-display text-base sm:text-lg text-charcoal/90',
                'marker:hidden',
              ].join(' ')}
              itemProp="name"
            >
              <span>{item.question}</span>
              <span
                className="font-body text-bronze-warm text-lg leading-none transition-transform duration-300 group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <div
              className="mt-3 font-body text-[14px] sm:text-[15px] leading-[1.85] text-charcoal/75"
              itemScope
              itemProp="acceptedAnswer"
              itemType="https://schema.org/Answer"
            >
              <div itemProp="text">{item.answer}</div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
