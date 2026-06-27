// JsonLd.tsx
// -----------------------------------------------------------------------------
// Generic <JsonLd data={...} /> emitter + convenience schema builders.
//
// Drop one or more <JsonLd /> components on any page. They render as
// <script type="application/ld+json"> tags inside <Helmet>, which means
// Google, Bing, ChatGPT, Perplexity, and AI Overviews all see them after
// hydration.
// -----------------------------------------------------------------------------

import { Helmet } from "react-helmet-async";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "./SEO";

// ---------- Generic emitter --------------------------------------------------

export interface JsonLdProps {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

export default function JsonLd({ data }: JsonLdProps) {
  // JSON.stringify with no whitespace to keep payload small.
  const json = JSON.stringify(data);
  return (
    <Helmet>
      <script type="application/ld+json">{json}</script>
    </Helmet>
  );
}

// ---------- Shared author / publisher types ---------------------------------

export interface AuthorLike {
  name: string;
  slug?: string;
  url?: string;
  image?: string;
  job_title?: string;
  bio?: string;
  same_as?: string[];
}

export interface PostLike {
  slug: string;
  lang?: string;
  title: string;
  description?: string;
  summary_for_llm?: string;
  hero_image?: string;
  cover_image?: string;
  image?: string;
  published_at?: string;
  updated_at?: string;
  date_published?: string;
  date_modified?: string;
  schema_org_type?: string; // e.g. "Article" | "NewsArticle" | "BlogPosting"
  key_takeaways?: string[];
  body?: string;
}

// ---------- Builders ---------------------------------------------------------

function abs(u?: string): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
}

export function organizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: "Unum Per Iter",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/assets/logo.png`,
    },
    sameAs: [
      "https://www.instagram.com/terraaltera/",
      "https://www.linkedin.com/company/altera-terra/",
    ],
  };
}

export function personSchema(author: AuthorLike): Record<string, unknown> {
  const url =
    abs(author.url) || (author.slug ? `${SITE_URL}/team/${author.slug}` : undefined);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": url ? `${url}#person` : undefined,
    name: author.name,
    url,
    image: abs(author.image),
    jobTitle: author.job_title,
    description: author.bio,
    sameAs: author.same_as,
    worksFor: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

export function articleSchema(
  post: PostLike,
  authorRef?: AuthorLike,
): Record<string, unknown> {
  const articleUrl = `${SITE_URL}/journal/${post.slug}`;
  const image =
    abs(post.hero_image) ||
    abs(post.cover_image) ||
    abs(post.image) ||
    DEFAULT_OG_IMAGE;

  const datePublished = post.date_published || post.published_at;
  const dateModified = post.date_modified || post.updated_at || datePublished;

  return {
    "@context": "https://schema.org",
    "@type": post.schema_org_type || "Article",
    headline: post.title,
    description: post.description || post.summary_for_llm,
    image,
    inLanguage: post.lang || "en",
    author: authorRef
      ? {
          "@type": "Person",
          name: authorRef.name,
          url:
            abs(authorRef.url) ||
            (authorRef.slug ? `${SITE_URL}/team/${authorRef.slug}` : undefined),
        }
      : {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/logo.png`,
      },
    },
    datePublished,
    dateModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.url),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPageSchema(items: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
