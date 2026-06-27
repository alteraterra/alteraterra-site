// One-shot seed: writes the FULL site-content blob into Supabase `site_content`
// (id=1). Values transcribed from today's hardcoded sources:
//   - src/i18n/translations.ts          (all t-key English defaults)
//   - src/components/TheHouse.tsx       (serviceImages)
//   - src/components/MeetTheTeam.tsx    (teamMembers, pillarKeys)
//   - src/components/StatStrip.tsx      (STATS)
//   - src/components/DestinationsMarquee.tsx (DESTINATIONS)
//   - src/components/Footer.tsx / Navigation.tsx
//   - src/pages/LegalPage.tsx           (legal copy)
//   - src/pages/*ProfilePage.tsx        (bios)
//   - index.html                        (seo + globals)
//
// Strings are transcribed as literals here on purpose — we do NOT import the .ts
// (it is TSX/Vite-only). Idempotent: upserts id=1 with merge-duplicates.
//
// Env loading + service-role client pattern copied from migrate-articles.mjs.

import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRONTEND_DIR = resolve(__dirname, '..');

const require = createRequire(import.meta.url);

// ---------- env ----------
function loadEnv() {
  const candidates = ['.env.local', '.env'];
  for (const f of candidates) {
    const p = resolve(FRONTEND_DIR, f);
    if (!existsSync(p)) continue;
    const txt = readFileSync(p, 'utf8');
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}
loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env. Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// ---------- supabase (service-role: bypasses RLS) ----------
const { createClient } = require('@supabase/supabase-js');
const supa = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------- the blob ----------
const content = {
  hero: {
    brand: 'Altera Terra',
    motto: 'Unum Per Iter',
    descriptor1: 'A Collective of Experts in the Art of Living',
    descriptor2: 'For Those Drawn Elsewhere',
    enter: 'Enter',
    ctaTo: '/prelude',
    image: '/hero.jpg',
    imageAlt: 'Altera Terra',
  },

  prelude: {
    p1: 'There are those for whom a journey is not merely a departure, but a quiet act of devotion — to beauty, to meaning, to the unhurried rhythms of a life lived with intention. For them, every experience is a conversation with the world, and every destination a chapter yet unwritten. It is for these souls that Altera Terra was born.',
    p2: 'Why do we do what we do? Because we believe that the most extraordinary journeys are not bought — they are earned through trust, composed through intimacy, and revealed only to those who are invited. We exist to open doors that remain invisible to most: private collections viewed after hours, ancestral estates that welcome no strangers, tables set in places that appear on no map. This is the world of privileged access — and it is our native language.',
    p3: 'We are a collective — not a company, but a constellation of sensibilities united by a shared reverence for the art of living. We compose journeys and craft experiences guided by the values we hold most dear: transparency, trust, honour, honesty, and the creative spirit that transforms the ordinary into the unforgettable. Each experience, each encounter, each opened door is an expression not merely of what we do, but of why we do it — because we believe that how one travels through the world is a reflection of who one truly is.',
    private: 'A Private World',
    quote: 'When the connoisseur or the visionary encounters Altera Terra, they discover not a service, but a key — to journeys that cannot be replicated, experiences that cannot be purchased, and a world of privileged access that reveals itself only through genuine human connection.',
    closing: 'Every journey begins with trust. Every experience becomes a memory that endures.',
    image: '',
    imageAlt: '',
  },

  house: {
    label: 'La Maison',
    title: 'Five pillars of an extraordinary life',
    subtitle: 'Each service is conceived not as a transaction, but as a gesture — a considered act of curation, access, and quiet excellence.',
    services: [
      {
        title: 'Travel Design',
        desc: 'Bespoke itineraries conceived as living art — each journey a considered composition of place, pace, and private access.',
        image: '/cotedazur.jpg',
        imageAlt: 'Travel Design',
      },
      {
        title: 'Experiences',
        desc: 'Encounters that cannot be purchased from a catalogue — private viewings, culinary ceremonies, cultural immersions arranged through trust alone.',
        image: '/capri.jpg',
        imageAlt: 'Experiences',
      },
      {
        title: 'Private Charters',
        desc: 'Sovereign passages by sea and air — where the vessel becomes the destination and the horizon belongs entirely to you.',
        image: 'https://mgx-backend-cdn.metadl.com/generate/images/1023421/2026-03-13/5511e5d7-e648-4fee-abb3-b3211a84a439.png',
        imageAlt: 'Private Charters',
      },
      {
        title: 'Lifestyle & Concierge',
        desc: 'The quiet architecture of an extraordinary life — from residences and private events to the discreet gestures that define cultivated living.',
        image: 'https://mgx-backend-cdn.metadl.com/generate/images/1023421/2026-03-13/df931b13-250b-40f3-8030-1ea103aeeff8.png',
        imageAlt: 'Lifestyle & Concierge',
      },
      {
        title: 'Fine Art Sourcing',
        desc: 'Aesthetic intelligence applied to acquisition — rare works, emerging voices, and private collections navigated with scholarly care.',
        image: 'https://mgx-backend-cdn.metadl.com/generate/images/1023421/2026-03-13/a5d2918e-07d4-497c-b482-d04b492be731.png',
        imageAlt: 'Fine Art Sourcing',
      },
    ],
  },

  team: {
    label: 'The Team',
    title: 'A Collective Devoted to the Art of Living',
    subtitle: 'We are not a company in the conventional sense. We are a constellation of individuals — each shaped by a life of cultural curiosity, aesthetic conviction, and an unwavering commitment to the extraordinary.',
    viewprofile: 'View Profile →',
    quote: '"We do not sell experiences. We compose them — with the same care a maestro brings to a score, or a vintner to a vintage."',
    founded: 'Altera Terra — Founded on Conviction',
    members: [
      {
        name: 'Domenico Morelli',
        role: "Visionary & Chef d'Orchestre of Altera Terra",
        slug: 'domenico-morelli',
        image: '/assets/domenico-morelli.jpg',
        imageAlt: 'Domenico Morelli',
        objectPosition: 'center 20%',
      },
      {
        name: 'Oscar Motta',
        role: 'Strategic Architect & Governance Lead of Altera Terra',
        slug: 'oscar-motta',
        image: '/assets/oscar-motta.jpg',
        imageAlt: 'Oscar Motta',
        objectPosition: 'center 15%',
      },
    ],
    pillars: [
      {
        label: 'Curators',
        desc: 'Those who listen before they speak. Our curators distill decades of cultural immersion into journeys that feel instinctive — never prescribed.',
      },
      {
        label: 'Architects of Experience',
        desc: 'Specialists in the unseen detail — the angle of light at dinner, the scent of a room upon arrival, the silence between moments.',
      },
      {
        label: 'Cultural Liaisons',
        desc: 'Bridges between worlds. They hold the keys to private collections, closed estates, and conversations that never appear in guidebooks.',
      },
      {
        label: 'Guardians of Discretion',
        desc: 'Every interaction is held in confidence. Our team operates with the quiet professionalism of a private household — present when needed, invisible when not.',
      },
    ],
  },

  stats: {
    items: [
      { value: 18, suffix: '+', label: 'Years of practice' },
      { value: 42, suffix: '', label: 'Destinations curated' },
      { value: 6, suffix: '', label: 'Continents covered' },
      { value: 1, suffix: '', label: 'Standard of care' },
    ],
  },

  marquee: {
    destinations: [
      'Capri',
      'Lake Como',
      'Cap Ferrat',
      'Provence',
      'Santorini',
      'Mykonos',
      'Comporta',
      'Marrakesh',
      'Mayfair',
      'Aspen',
      'Kyoto',
    ],
    ariaLabel: 'Destinations',
  },

  newsletter: {
    label: 'Stay Close',
    title: 'The Altera Terra Letter',
    subtitle: 'A discreet correspondence — rare destinations, private events, and invitations reserved for those who appreciate the art of the extraordinary.',
    placeholder: 'Your email address',
    subscribe: 'Subscribe',
    thanks: 'Thank you. You are now part of our world.',
    privacy: 'We respect your privacy. Unsubscribe at any time.',
  },

  enquiry: {
    label: 'Enquire',
    title: 'Designed for the Senses, Guided by Emotion',
    subtitle: 'We prefer to listen before we speak. Share what moves you — a place, a feeling, a memory you wish to create — and we shall take it from there.',
    cta: 'Request a Consultation',
    email: 'enquire@alteraterra.vip',
  },

  consult: {
    label: 'Private Consultation',
    title: 'Begin the Conversation',
    subtitle: 'Share what moves you — a place, a feeling, a memory you wish to create — and we shall take it from there. Every enquiry is held in the strictest confidence.',
    fields: {
      name: 'Full Name',
      'name.ph': 'Your name',
      email: 'Email Address',
      'email.ph': 'your@email.com',
      phone: 'Phone',
      'phone.opt': '(optional)',
      'phone.ph': '+44 ...',
      interest: 'Area of Interest',
      'interest.select': 'Select an area',
      message: 'Your Message',
      'message.ph': 'Tell us what moves you...',
      submit: 'Submit Enquiry',
      sending: 'Sending...',
      captcha: 'Please verify you are human',
      'captcha.wrong': 'Incorrect answer. Please try again.',
      directmail: 'Or write to us directly at',
      error: 'Something went wrong. Please try again or email us directly.',
      error2: 'Something went wrong. Please try again or email us directly at enquire@alteraterra.vip.',
    },
    interests: [
      { value: 'curated-journeys', label: 'Curated Journeys' },
      { value: 'private-access', label: 'Private Access & Experiences' },
      { value: 'cultural-immersion', label: 'Cultural Immersion' },
      { value: 'lifestyle-curation', label: 'Lifestyle Curation' },
      { value: 'other', label: 'Other' },
    ],
    thanks: {
      title: 'Thank You',
      dear: 'Dear Visionary,',
      p1: 'Your message has been received, and with it, the first note of a possible journey.',
      p2: 'At Altera Terra, we do not see enquiries as transactions, but as the early expression of something more singular: a desire, a perspective, a world waiting to be shaped with nuance and intention.',
      p3: 'Please allow us a little time to return to you with the consideration your message deserves.',
      p4: 'We will be in touch shortly.',
      yours: 'Yours faithfully,',
    },
    captchaQ: 'What is {a} + {b}?',
  },

  footer: {
    cities: ['Paris', 'Madrid', 'Athens'],
    instagramUrl: 'https://www.instagram.com/terraaltera/',
    instagramHandle: '@terraaltera',
    curatedby: 'Curated by Altera Terra. Enabled through',
    partnerUrl: 'https://foratravel.com',
    partnerText: 'Fora Travel',
    domain: 'alteraterra.vip',
    rights: '© {year} Altera Terra. All rights reserved.',
  },

  nav: {
    items: [
      { key: 'nav.home', label: 'Home', to: '/' },
      { key: 'nav.prelude', label: 'Prelude', to: '/prelude' },
      { key: 'nav.lamaison', label: 'La Maison', to: '/the-house' },
      { key: 'nav.team', label: 'The Team', to: '/meet-the-team' },
      { key: 'nav.journal', label: 'Journal', to: '/journal' },
      { key: 'nav.enquire', label: 'Enquire', to: '/enquire' },
    ],
  },

  legal: {
    lastReviewed: 'May 2026',
    intro: 'Altera Terra operates as a private collective. Membership is by invitation or introduction, and the relationships we hold are governed by discretion as much as by service. This page exists as the formal record of how we treat information shared with us and the terms under which we engage.',
    privacy: {
      title: 'Privacy Notice',
      eyebrow: 'Confidentiality',
      body: [
        'Personal information you share — whether through enquiry, consultation, or membership — is held confidentially and used only for the purpose of responding to and serving you. We do not sell data, and we do not share it with third parties except where strictly required to deliver an experience you have requested.',
        'We retain only what is necessary, for only as long as our relationship requires it. To request access, correction, or deletion of your records, please write to privacy@alteraterra.vip.',
      ],
      email: 'privacy@alteraterra.vip',
    },
    terms: {
      title: 'Terms of Engagement',
      eyebrow: 'Conditions',
      body: [
        'Engagement with Altera Terra is by mutual agreement. Bookings, plans, and bespoke arrangements are subject to the specific terms communicated at the time of confirmation. Cancellation, refund, and force-majeure conditions vary by partner and destination.',
        'These pages, and any content within, are © Altera Terra. Distribution without permission is not permitted. For any matter requiring formal attention, write to legal@alteraterra.vip.',
      ],
      email: 'legal@alteraterra.vip',
    },
  },

  profiles: {
    'oscar-motta': {
      name: 'Oscar Motta',
      role: 'Strategic Architect & Governance Lead of Altera Terra',
      bio: [
        'Oscar Motta Quintana brings over seventeen years of experience across brand strategy, marketing leadership, and creative consultancy, shaped by an international trajectory spanning the Middle East, Latin America, and Europe. His expertise lies in building brands of substance and distinction — brands that connect deeply, evolve with intelligence, and retain lasting relevance.',
        'His path has unfolded at the intersection of strategy, culture, and creative direction, advising organisations ranging from global groups to entrepreneurial ventures in search of sharper positioning and more meaningful resonance. Through this, he has cultivated a rare ability to give vision both structure and momentum, aligning creative expression with strategic and commercial depth.',
        'His connection to Altera Terra is also deeply personal. He first met Domenico in 2013, across the counter of a hostel, while travelling the world with friends from university. What began as a chance encounter evolved into a lasting friendship, shaped by shared values of honesty, honour, and creativity — values that would later come to inform the spirit of Altera Terra itself.',
        "At Altera Terra, Oscar serves as Strategic Architect & Steward of Governance, bringing the clarity, developmental vision, and structural intelligence that allow the collective's world to expand with coherence and integrity. If Domenico composes the emotional language of Altera Terra, Oscar ensures that its foundations remain equally enduring, exacting, and built to last.",
      ],
      image: '/assets/oscar-motta.jpg',
      imageAlt: 'Oscar Motta',
      objectPosition: 'center 15%',
    },
    'domenico-morelli': {
      name: 'Domenico Morelli',
      role: "Visionary & Chef d'Orchestre of Altera Terra",
      bio: [
        "Domenico Morelli's understanding of excellence was forged long before Altera Terra — in the exacting world of culinary arts, where mastery is measured not in grand gestures but in the silent discipline of timing, the architecture of flavour, and the emotional resonance of a perfectly composed plate. It was within this crucible of precision and sensorial awareness that his philosophy of luxury first took shape: not as spectacle, but as nuance; not as display, but as the indelible imprint of details mastered with devotion.",
        'That early foundation became the springboard for a distinguished trajectory across the highest echelons of luxury hospitality. Through executive roles within internationally acclaimed houses, Domenico cultivated a rare expertise in service orchestration, operational excellence, and the subtle art of transforming exacting standards into experiences that feel entirely effortless. He learned that true luxury is never performed — it is inhabited; never announced — it is simply felt upon arrival.',
        'Over time, his path expanded into the world of refined travel and experience-led environments, where he discovered the power of uniting operational rigour with aesthetic sensibility and deep cultural fluency. It was here that his singular approach to curation crystallised — an approach rooted in the belief that every journey, every table, every encounter should be composed with the same care a maestro brings to a score: each note deliberate, each silence intentional, each crescendo earned.',
        'Alongside Oscar Motta — a friendship born of shared conviction and forged through years of mutual trust — Domenico shaped Altera Terra as a collective expression of this philosophy. Together, they envisioned a world not of transactions but of transformations: a private realm of travel, lifestyle, and sensorial curation conceived for those who seek beauty, meaning, and the kind of rare emotional resonance that lingers long after the journey has ended.',
        'Within Altera Terra, Domenico serves as its creative heartbeat — the Chef d\'Orchestre who composes journeys and experiences that are not simply arranged but deeply felt. His gift lies in reading the unspoken: the desire behind the request, the memory a client wishes to create, the emotion that will transform a moment into something enduring. Every itinerary he touches bears his signature — an invisible thread of intention, warmth, and quiet perfectionism.',
        'For those drawn to the exceptional, Domenico extends not a service, but an invitation — to step into a world where every detail has been considered, every experience has been composed with care, and every memory is worth keeping.',
      ],
      image: '/assets/domenico-morelli.jpg',
      imageAlt: 'Domenico Morelli',
      objectPosition: 'center 20%',
    },
    'margarita-arango': {
      name: 'Margarita Arango',
      role: 'Corporate Travel Curator',
      bio: ['Full profile coming soon.'],
      image: '/assets/margarita-arango.jpg',
      imageAlt: 'Margarita Arango',
      objectPosition: 'center 15%',
    },
  },

  seo: {
    title: 'Altera Terra | Unum Per Iter — Private Collective in the Art of Living',
    description: 'Altera Terra | Unum Per Iter — A private collective in the art of living through travel, culture, concierge and rare access.',
    canonical: 'https://alteraterra.vip/',
    ogImage: '',
    jsonLdLogo: '/assets/logo.png',
    perPage: {},
  },

  globals: {
    siteUrl: 'https://alteraterra.vip',
    ga4Id: 'G-W44N7VWV90',
    gscVerification: 'loevU2Yf801JFVz_vWPTrlJ9OWsot8drxAUlJfdV_xQ',
    instagramUrl: 'https://www.instagram.com/terraaltera/',
    linkedinUrl: 'https://www.linkedin.com/company/altera-terra/',
    enquireEmail: 'enquire@alteraterra.vip',
    privacyEmail: 'privacy@alteraterra.vip',
    legalEmail: 'legal@alteraterra.vip',
    siteTitle: 'Altera Terra',
    tagline: 'Unum Per Iter',
  },
};

// ---------- upsert ----------
(async () => {
  console.log(`→ Seeding site_content (id=1) into ${SUPABASE_URL}\n`);

  const { data, error } = await supa
    .from('site_content')
    .upsert(
      { id: 1, data: content },
      { onConflict: 'id', ignoreDuplicates: false },
    )
    .select('id, updated_at')
    .single();

  if (error) {
    console.error('x upsert failed:', error.message);
    process.exit(1);
  }

  const sections = Object.keys(content);
  console.log(`✓ wrote site_content id=${data.id} (updated_at ${data.updated_at})`);
  console.log(`  sections: ${sections.length} — ${sections.join(', ')}`);
})().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
