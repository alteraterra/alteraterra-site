// SEO.tsx
// -----------------------------------------------------------------------------
// Per-page <SEO/> wrapper around react-helmet-async.
//
// Why this is enough for SEO + GEO in 2026:
//   - Google Bot renders client-side JS, so react-helmet-async's runtime
//     <head> mutations are picked up. JSON-LD injected this way is honored
//     by Google's structured-data parser (and surfaces in AI Overviews).
//   - Bing, DuckDuckGo, and Yandex render JS as well.
//   - ChatGPT browse / Perplexity / Claude fetch the rendered DOM via their
//     crawlers (OAI-SearchBot, PerplexityBot, ClaudeBot, GPTBot). They see
//     the hydrated <title>, <meta>, and JSON-LD just fine.
//
// SSR / prerendering would be a v2 nicety (faster first paint for crawlers,
// no CLS on the title), but is NOT required for indexing or AI citation.
// We rely on react-helmet-async + JSON-LD here. See /llms.txt and
// /llms-full.txt (generated at build time) for LLM-friendly summaries.
//
// HelmetProvider must wrap the app once (handled in App.tsx during the wire
// phase). This file only provides the per-page component.
// -----------------------------------------------------------------------------

import { Helmet } from "react-helmet-async";

const SITE_URL = "https://alteraterra.vip";
const SITE_NAME = "Altera Terra";
const DEFAULT_TITLE =
  "Altera Terra | Unum Per Iter — Private Collective in the Art of Living";
const DEFAULT_DESCRIPTION =
  "Altera Terra | Unum Per Iter — A private collective in the art of living through travel, culture, concierge and rare access.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/hero.jpg`;

export interface SEOProps {
  /** Page title. Will be used as-is (no site name appended). */
  title?: string;
  /** ~150-160 char description for SERP + social cards. */
  description?: string;
  /** Absolute or path-relative canonical URL. Will be resolved against SITE_URL. */
  canonical?: string;
  /** Absolute URL to the social-card image. Falls back to hero.jpg. */
  og_image?: string;
  /** Open Graph type. Defaults to "website". Use "article" for blog posts. */
  og_type?: "website" | "article";
  /** When true, emits <meta name="robots" content="noindex,nofollow"/>. */
  noindex?: boolean;
}

function resolveUrl(maybePath: string | undefined): string | undefined {
  if (!maybePath) return undefined;
  if (/^https?:\/\//i.test(maybePath)) return maybePath;
  return `${SITE_URL}${maybePath.startsWith("/") ? "" : "/"}${maybePath}`;
}

export default function SEO({
  title,
  description,
  canonical,
  og_image,
  og_type = "website",
  noindex = false,
}: SEOProps) {
  const finalTitle = title || DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalCanonical = resolveUrl(canonical) || SITE_URL;
  const finalImage = resolveUrl(og_image) || DEFAULT_OG_IMAGE;

  return (
    <Helmet prioritizeSeoTags>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalCanonical} />
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow" />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={og_type} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
}

export { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE };
