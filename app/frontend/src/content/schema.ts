/**
 * SiteContent, shape of the single editable site-content blob.
 *
 * ARCHITECTURE: one Supabase `site_content` jsonb row (id=1) holds all editable
 * site content. It is fetched once at boot and merged OVER the i18n dictionary,
 * which remains the permanent fallback. The content getter resolves in order:
 *   blob path → t(i18nKey) → raw key.
 *
 * EVERY field and section is optional. The blob is always treated as a
 * `Partial<SiteContent>`: any section may be absent, any field within a section
 * may be absent, and the i18n dictionary fills the gaps. This is why every
 * property below carries `?`, a partial blob (even `{}`) must typecheck.
 */

export interface HeroContent {
  brand?: string;
  motto?: string;
  descriptor1?: string;
  descriptor2?: string;
  enter?: string;
  ctaTo?: string;
  image?: string;
  imageAlt?: string;
}

export interface PreludeContent {
  p1?: string;
  p2?: string;
  p3?: string;
  private?: string;
  quote?: string;
  closing?: string;
  image?: string;
  imageAlt?: string;
}

export interface HouseService {
  title?: string;
  desc?: string;
  image?: string;
  imageAlt?: string;
}

export interface HouseContent {
  label?: string;
  title?: string;
  subtitle?: string;
  services?: Array<HouseService>;
}

export interface TeamMember {
  name?: string;
  role?: string;
  slug?: string;
  image?: string;
  imageAlt?: string;
  objectPosition?: string;
}

export interface TeamPillar {
  label?: string;
  desc?: string;
}

export interface TeamContent {
  label?: string;
  title?: string;
  subtitle?: string;
  viewprofile?: string;
  quote?: string;
  founded?: string;
  members?: Array<TeamMember>;
  pillars?: Array<TeamPillar>;
}

export interface StatItem {
  value?: number;
  suffix?: string;
  label?: string;
}

export interface StatsContent {
  items?: Array<StatItem>;
}

export interface MarqueeContent {
  destinations?: string[];
  ariaLabel?: string;
}

export interface NewsletterContent {
  label?: string;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  subscribe?: string;
  thanks?: string;
  privacy?: string;
}

export interface EnquiryContent {
  label?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  email?: string;
}

export interface ConsultInterest {
  value?: string;
  label?: string;
}

export interface ConsultThanks {
  title?: string;
  dear?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  p4?: string;
  yours?: string;
}

export interface ConsultContent {
  label?: string;
  title?: string;
  subtitle?: string;
  fields?: Record<string, string>;
  interests?: Array<ConsultInterest>;
  thanks?: ConsultThanks;
  captchaQ?: string;
}

export interface FooterContent {
  cities?: string[];
  instagramUrl?: string;
  instagramHandle?: string;
  curatedby?: string;
  partnerUrl?: string;
  partnerText?: string;
  domain?: string;
  rights?: string;
}

export interface NavItem {
  key?: string;
  label?: string;
  to?: string;
}

export interface NavContent {
  items?: Array<NavItem>;
}

export interface LegalSection {
  title?: string;
  eyebrow?: string;
  body?: string[];
  email?: string;
}

export interface LegalContent {
  lastReviewed?: string;
  intro?: string;
  privacy?: LegalSection;
  terms?: LegalSection;
}

export interface ProfileContent {
  name?: string;
  role?: string;
  bio?: string[];
  image?: string;
  imageAlt?: string;
  objectPosition?: string;
}

export interface SeoPageOverride {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface SeoContent {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  jsonLdLogo?: string;
  perPage?: Record<string, SeoPageOverride>;
}

export interface GlobalsContent {
  siteUrl?: string;
  ga4Id?: string;
  gscVerification?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  enquireEmail?: string;
  privacyEmail?: string;
  legalEmail?: string;
  siteTitle?: string;
  tagline?: string;
}

export interface SiteContent {
  hero?: HeroContent;
  prelude?: PreludeContent;
  house?: HouseContent;
  team?: TeamContent;
  stats?: StatsContent;
  marquee?: MarqueeContent;
  newsletter?: NewsletterContent;
  enquiry?: EnquiryContent;
  consult?: ConsultContent;
  footer?: FooterContent;
  nav?: NavContent;
  legal?: LegalContent;
  profiles?: Record<string, ProfileContent>;
  seo?: SeoContent;
  globals?: GlobalsContent;
}
