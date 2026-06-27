import { Link } from 'react-router-dom';
import { useReveal } from '@/hooks/useReveal';
import { useContent } from '@/content/SiteContentContext';
import Magnetic from '@/components/Magnetic';

export default function Enquiry() {
  const { ref, visible } = useReveal({ threshold: 0.15 });
  const { text } = useContent();

  return (
    <div ref={ref} className="bg-deepblack min-h-[calc(100dvh-68px)] flex items-center py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-8 text-center">
        <div
          className={`transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div className="mx-auto mb-12 h-px w-10 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />

          <span className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze/75 block mb-6">
            {text('enquiry.label', 'enquiry.label')}
          </span>

          <h3 className="font-display text-3xl font-normal text-white/95 sm:text-4xl md:text-5xl leading-tight tracking-[-0.01em] px-2">
            {text('enquiry.title', 'enquiry.title')}
          </h3>

          <p className="mt-7 font-body text-[15px] sm:text-base leading-[1.85] text-white/75 max-w-lg mx-auto">
            {text('enquiry.subtitle', 'enquiry.subtitle')}
          </p>

          <div className="mt-12 flex items-center justify-center">
            <Magnetic strength={0.22}>
              <Link
                to="/consultation"
                className="group inline-flex items-center gap-4 font-body text-xs tracking-[0.35em] uppercase text-white/90 border border-bronze-warm/60 pl-10 pr-3 sm:pl-14 py-2.5 sm:py-3 hover:text-white hover:border-bronze-warm hover:tracking-[0.45em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                <span>{text('enquiry.cta', 'enquiry.cta')}</span>
                <span
                  aria-hidden
                  className="grid place-items-center h-10 w-10 rounded-full border border-bronze-warm/40 text-bronze-warm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-bronze-warm/15 group-hover:border-bronze-warm group-hover:translate-x-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="7" x2="11" y2="7" />
                    <polyline points="7,3 11,7 7,11" />
                  </svg>
                </span>
              </Link>
            </Magnetic>
          </div>

          <p className="mt-10 font-body text-[13px] tracking-[0.2em] text-white/70">
            {text('enquiry.email', 'enquire@alteraterra.vip')}
          </p>
        </div>
      </div>
    </div>
  );
}