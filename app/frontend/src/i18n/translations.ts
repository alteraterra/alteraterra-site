/**
 * English-only translation dictionary.
 * The site operates in English, no multi-language support.
 */

type Dict = Record<string, string>;

export const translations: Dict = {
  /* ── Navigation ── */
  'nav.home': 'Home',
  'nav.prelude': 'Prelude',
  'nav.lamaison': 'La Maison',
  'nav.journal': 'Journal',
  'nav.team': 'The Team',
  'nav.enquire': 'Enquire',

  /* ── Hero ── */
  'hero.brand': 'Altera Terra',
  'hero.motto': 'Unum Per Iter',
  'hero.descriptor1': 'A Collective of Experts in the Art of Living',
  'hero.descriptor2': 'For Those Drawn Elsewhere',
  'hero.enter': 'Enter',

  /* ── Prelude ── */
  'prelude.p1': 'There are those for whom a journey is not merely a departure, but a quiet act of devotion, to beauty, to meaning, to the unhurried rhythms of a life lived with intention. For them, every experience is a conversation with the world, and every destination a chapter yet unwritten. It is for these souls that Altera Terra was born.',
  'prelude.p2': 'Why do we do what we do? Because we believe that the most extraordinary journeys are not bought; they are earned through trust, composed through intimacy, and revealed only to those who are invited. We exist to open doors that remain invisible to most: private collections viewed after hours, ancestral estates that welcome no strangers, tables set in places that appear on no map. This is the world of privileged access, and it is our native language.',
  'prelude.p3': 'We are a collective: not a company, but a constellation of sensibilities united by a shared reverence for the art of living. We compose journeys and craft experiences guided by the values we hold most dear: transparency, trust, honour, honesty, and the creative spirit that transforms the ordinary into the unforgettable. Each experience, each encounter, each opened door is an expression not merely of what we do, but of why we do it, because we believe that how one travels through the world is a reflection of who one truly is.',
  'prelude.private': 'A Private World',
  'prelude.quote': 'When the connoisseur or the visionary encounters Altera Terra, they discover not a service, but a key: to journeys that cannot be replicated, experiences that cannot be purchased, and a world of privileged access that reveals itself only through genuine human connection.',
  'prelude.closing': 'Every journey begins with trust. Every experience becomes a memory that endures.',

  /* ── La Maison ── */
  'house.label': 'La Maison',
  'house.title': 'Five pillars of an extraordinary life',
  'house.subtitle': 'Each service is conceived not as a transaction, but as a gesture: a considered act of curation, access, and quiet excellence.',
  'house.s1.title': 'Travel Design',
  'house.s1.desc': 'Bespoke itineraries conceived as living art, each journey a considered composition of place, pace, and private access.',
  'house.s2.title': 'Experiences',
  'house.s2.desc': 'Encounters that cannot be purchased from a catalogue, private viewings, culinary ceremonies, cultural immersions arranged through trust alone.',
  'house.s3.title': 'Private Charters',
  'house.s3.desc': 'Sovereign passages by sea and air, where the vessel becomes the destination and the horizon belongs entirely to you.',
  'house.s4.title': 'Lifestyle & Concierge',
  'house.s4.desc': 'The quiet architecture of an extraordinary life, from residences and private events to the discreet gestures that define cultivated living.',
  'house.s5.title': 'Fine Art Sourcing',
  'house.s5.desc': 'Aesthetic intelligence applied to acquisition, rare works, emerging voices, and private collections navigated with scholarly care.',

  /* ── Journal / Inspirations ── */
  'journal.label': 'Journal',
  'journal.title': 'Dispatches from Another Land',
  'journal.subtitle': 'Stories of place, taste, and the art of living deliberately.',
  'journal.readmore': 'Read more →',
  'journal.continue': 'Continue Reading',
  'journal.prev': '← Previous',
  'journal.next': 'Next →',
  'journal.viewall': 'View All Articles',
  'journal.all': 'All Stories',
  'journal.empty': 'No stories in this category yet.',

  /* ── Newsletter ── */
  'newsletter.label': 'Stay Close',
  'newsletter.title': 'The Altera Terra Letter',
  'newsletter.subtitle': 'A discreet correspondence: rare destinations, private events, and invitations reserved for those who appreciate the art of the extraordinary.',
  'newsletter.placeholder': 'Your email address',
  'newsletter.subscribe': 'Subscribe',
  'newsletter.thanks': 'Thank you. You are now part of our world.',
  'newsletter.privacy': 'We respect your privacy. Unsubscribe at any time.',

  /* ── Enquiry ── */
  'enquiry.label': 'Enquire',
  'enquiry.title': 'Designed for the Senses, Guided by Emotion',
  'enquiry.subtitle': 'We prefer to listen before we speak. Share what moves you: a place, a feeling, a memory you wish to create. We shall take it from there.',
  'enquiry.cta': 'Request a Consultation',

  /* ── Consultation form ── */
  'consult.label': 'Private Consultation',
  'consult.title': 'Begin the Conversation',
  'consult.subtitle': 'Share what moves you: a place, a feeling, a memory you wish to create. We shall take it from there. Every enquiry is held in the strictest confidence.',
  'consult.name': 'Full Name',
  'consult.name.ph': 'Your name',
  'consult.email': 'Email Address',
  'consult.email.ph': 'your@email.com',
  'consult.phone': 'Phone',
  'consult.phone.opt': '(optional)',
  'consult.phone.ph': '+44 ...',
  'consult.interest': 'Area of Interest',
  'consult.interest.select': 'Select an area',
  'consult.interest.journeys': 'Curated Journeys',
  'consult.interest.access': 'Private Access & Experiences',
  'consult.interest.cultural': 'Cultural Immersion',
  'consult.interest.lifestyle': 'Lifestyle Curation',
  'consult.interest.other': 'Other',
  'consult.message': 'Your Message',
  'consult.message.ph': 'Tell us what moves you...',
  'consult.submit': 'Submit Enquiry',
  'consult.sending': 'Sending...',
  'consult.error': 'Something went wrong. Please try again or email us directly.',
  'consult.error2': 'Something went wrong. Please try again or email us directly at enquire@alteraterra.vip.',
  'consult.directmail': 'Or write to us directly at',
  'consult.captcha': 'Please verify you are human',
  'consult.captcha.q': 'What is {a} + {b}?',
  'consult.captcha.wrong': 'Incorrect answer. Please try again.',
  /* Thank you */
  'consult.thanks.title': 'Thank You',
  'consult.thanks.dear': 'Dear Visionary,',
  'consult.thanks.p1': 'Your message has been received, and with it, the first note of a possible journey.',
  'consult.thanks.p2': 'At Altera Terra, we do not see enquiries as transactions, but as the early expression of something more singular: a desire, a perspective, a world waiting to be shaped with nuance and intention.',
  'consult.thanks.p3': 'Please allow us a little time to return to you with the consideration your message deserves.',
  'consult.thanks.p4': 'We will be in touch shortly.',
  'consult.thanks.yours': 'Yours faithfully,',

  /* ── Meet the Team ── */
  'team.label': 'The Team',
  'team.title': 'A Collective Devoted to the Art of Living',
  'team.subtitle': 'We are not a company in the conventional sense. We are a constellation of individuals, each shaped by a life of cultural curiosity, aesthetic conviction, and an unwavering commitment to the extraordinary.',
  'team.viewprofile': 'View Profile →',
  'team.quote': '"We do not sell experiences. We compose them, with the same care a maestro brings to a score, or a vintner to a vintage."',
  'team.founded': 'Altera Terra: Founded on Conviction',
  'team.pillar1.label': 'Curators',
  'team.pillar1.desc': 'Those who listen before they speak. Our curators distill decades of cultural immersion into journeys that feel instinctive, never prescribed.',
  'team.pillar2.label': 'Architects of Experience',
  'team.pillar2.desc': 'Specialists in the unseen detail: the angle of light at dinner, the scent of a room upon arrival, the silence between moments.',
  'team.pillar3.label': 'Cultural Liaisons',
  'team.pillar3.desc': 'Bridges between worlds. They hold the keys to private collections, closed estates, and conversations that never appear in guidebooks.',
  'team.pillar4.label': 'Guardians of Discretion',
  'team.pillar4.desc': 'Every interaction is held in confidence. Our team operates with the quiet professionalism of a private household, present when needed, invisible when not.',

  /* ── Profile pages ── */
  'profile.label': 'Profile',
  'profile.back': 'Back to The Team',

  /* Domenico */
  'domenico.role': 'Visionary & Chef d\'Orchestre of Altera Terra',
  'domenico.p1': 'Domenico Morelli\'s understanding of excellence was forged long before Altera Terra, in the exacting world of culinary arts, where mastery is measured not in grand gestures but in the silent discipline of timing, the architecture of flavour, and the emotional resonance of a perfectly composed plate. It was within this crucible of precision and sensorial awareness that his philosophy of luxury first took shape: not as spectacle, but as nuance; not as display, but as the indelible imprint of details mastered with devotion.',
  'domenico.p2': 'That early foundation became the springboard for a distinguished trajectory across the highest echelons of luxury hospitality. Through executive roles within internationally acclaimed houses, Domenico cultivated a rare expertise in service orchestration, operational excellence, and the subtle art of transforming exacting standards into experiences that feel entirely effortless. He learned that true luxury is never performed but inhabited; never announced but simply felt upon arrival.',
  'domenico.p3': 'Over time, his path expanded into the world of refined travel and experience-led environments, where he discovered the power of uniting operational rigour with aesthetic sensibility and deep cultural fluency. It was here that his singular approach to curation crystallised: an approach rooted in the belief that every journey, every table, every encounter should be composed with the same care a maestro brings to a score: each note deliberate, each silence intentional, each crescendo earned.',
  'domenico.p4': 'Alongside Oscar Motta, a friendship born of shared conviction and forged through years of mutual trust, Domenico shaped Altera Terra as a collective expression of this philosophy. Together, they envisioned a world not of transactions but of transformations: a private realm of travel, lifestyle, and sensorial curation conceived for those who seek beauty, meaning, and the kind of rare emotional resonance that lingers long after the journey has ended.',
  'domenico.p5': 'Within Altera Terra, Domenico serves as its creative heartbeat, the Chef d\'Orchestre who composes journeys and experiences that are not simply arranged but deeply felt. His gift lies in reading the unspoken: the desire behind the request, the memory a client wishes to create, the emotion that will transform a moment into something enduring. Every itinerary he touches bears his signature: an invisible thread of intention, warmth, and quiet perfectionism.',
  'domenico.p6': 'For those drawn to the exceptional, Domenico extends not a service, but an invitation: to step into a world where every detail has been considered, every experience has been composed with care, and every memory is worth keeping.',

  /* Margarita */
  'margarita.role': 'Corporate Travel Curator',
  'margarita.p1': 'Full profile coming soon.',

  /* Stat strip */
  'stat.years': 'Years of practice',
  'stat.destinations': 'Destinations curated',
  'stat.continents': 'Continents covered',
  'stat.standard': 'Standard of care',
  'stat.plus': '+',

  /* Oscar */
  'oscar.role': 'Strategic Architect & Governance Lead of Altera Terra',
  'oscar.p1': 'Oscar Motta Quintana brings over seventeen years of experience across brand strategy, marketing leadership, and creative consultancy, shaped by an international trajectory spanning the Middle East, Latin America, and Europe. His expertise lies in building brands of substance and distinction: brands that connect deeply, evolve with intelligence, and retain lasting relevance.',
  'oscar.p2': 'His path has unfolded at the intersection of strategy, culture, and creative direction, advising organisations ranging from global groups to entrepreneurial ventures in search of sharper positioning and more meaningful resonance. Through this, he has cultivated a rare ability to give vision both structure and momentum, aligning creative expression with strategic and commercial depth.',
  'oscar.p3': 'His connection to Altera Terra is also deeply personal. He first met Domenico in 2013, across the counter of a hostel, while travelling the world with friends from university. What began as a chance encounter evolved into a lasting friendship, shaped by shared values of honesty, honour, and creativity, values that would later come to inform the spirit of Altera Terra itself.',
  'oscar.p4': 'At Altera Terra, Oscar serves as Strategic Architect & Steward of Governance, bringing the clarity, developmental vision, and structural intelligence that allow the collective\'s world to expand with coherence and integrity. If Domenico composes the emotional language of Altera Terra, Oscar ensures that its foundations remain equally enduring, exacting, and built to last.',



  /* ── Footer ── */
  'footer.curatedby': 'Curated by Altera Terra. Enabled through',
  'footer.rights': '© {year} Altera Terra. All rights reserved.',
};