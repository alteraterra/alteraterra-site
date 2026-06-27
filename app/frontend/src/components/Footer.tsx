import { useLanguage } from '@/i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-deepblack border-t border-white/[0.04] py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-8">
        {/* Locations */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          {['Paris', 'Madrid', 'Athens'].map((city) => (
            <span
              key={city}
              className="font-body text-xs tracking-[0.3em] uppercase text-white/70"
            >
              {city}
            </span>
          ))}
        </div>

        {/* Instagram */}
        <div className="flex justify-center mb-10">
          <a
            href="https://www.instagram.com/terraaltera/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 text-white/75 hover:text-bronze transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            aria-label="Follow us on Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:rotate-[6deg]"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span className="font-body text-xs tracking-[0.3em] uppercase">
              @terraaltera
            </span>
          </a>
        </div>

        {/* Curated by */}
        <div className="text-center mb-8">
          <p className="font-body text-[11px] tracking-[0.25em] uppercase text-white/70">
            {t('footer.curatedby')}{' '}
            <a
              href="https://foratravel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bronze/70 hover:text-bronze transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              Fora Travel
            </a>
            .
          </p>
        </div>

        {/* Domain */}
        <p className="text-center font-body text-[11px] tracking-[0.2em] text-white/70 mb-4">
          alteraterra.vip
        </p>

        <div className="mx-auto h-px w-10 bg-bronze/30 mb-5" />

        <p className="text-center font-body text-[11px] tracking-[0.15em] text-white/70 mb-3">
          {t('footer.rights').replace('{year}', String(new Date().getFullYear()))}
        </p>

        <nav aria-label="Legal" className="flex items-center justify-center gap-5 text-[11px] tracking-[0.2em] uppercase">
          <a href="/privacy" className="text-white/75 hover:text-bronze-warm transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            Privacy
          </a>
          <span aria-hidden className="h-2 w-px bg-white/15" />
          <a href="/terms" className="text-white/75 hover:text-bronze-warm transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            Terms
          </a>
        </nav>
      </div>
    </footer>
  );
}