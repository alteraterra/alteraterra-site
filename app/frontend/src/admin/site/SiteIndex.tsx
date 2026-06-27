import { Link } from 'react-router-dom';

const SECTIONS = [
  { to: '/admin/site/home', title: 'Home', desc: 'Hero, prelude, enquiry & newsletter copy and images' },
  { to: '/admin/site/the-house', title: 'The House', desc: 'Service list — titles, descriptions, images' },
  { to: '/admin/site/team', title: 'Team', desc: 'Members, pillars, headings and quote' },
  { to: '/admin/site/profiles', title: 'Profiles', desc: 'Individual team member bio pages' },
  { to: '/admin/site/stats', title: 'Stats & Marquee', desc: 'Number band and the destinations strip' },
  { to: '/admin/site/consult', title: 'Consultation', desc: 'Form labels, interests and the thank-you note' },
  { to: '/admin/site/footer', title: 'Footer & Nav', desc: 'Cities, social, partner, nav labels' },
  { to: '/admin/site/legal', title: 'Legal', desc: 'Privacy & terms copy' },
  { to: '/admin/site/seo', title: 'SEO', desc: 'Titles, descriptions, social image' },
  { to: '/admin/site/globals', title: 'Globals', desc: 'Analytics, socials, contact emails, site title' },
];

export default function SiteIndex() {
  return (
    <div className="max-w-3xl">
      <header className="mb-10">
        <h1 className="font-display text-3xl text-charcoal">Site Content</h1>
        <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
          Edit every element of the public site. Changes overlay the built-in
          defaults — clear a field to fall back to the original copy.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="ease-luxe group rounded-md border border-bronze/25 bg-chalk/20 p-5 transition-colors duration-300 hover:border-bronze-warm"
          >
            <h2 className="font-display text-xl text-charcoal group-hover:text-bronze-warm">
              {s.title}
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-charcoal/60">
              {s.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
