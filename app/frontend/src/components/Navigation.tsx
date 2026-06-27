import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const navKeys = [
  { key: 'nav.home', path: '/' },
  { key: 'nav.prelude', path: '/prelude' },
  { key: 'nav.lamaison', path: '/the-house' },
  { key: 'nav.team', path: '/meet-the-team' },
  { key: 'nav.journal', path: '/journal' },
  { key: 'nav.enquire', path: '/enquire' },
];

// Routes whose page background is light (parchment/chalk). Navigation
// inverts to a light variant on these so the bar doesn't sit on the page
// as a dark sliver.
const LIGHT_ROUTES = new Set<string>(['/prelude', '/the-house', '/privacy', '/terms']);

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const isLight = LIGHT_ROUTES.has(location.pathname);

  // Sliding underline — one shared DOM element that glides between active links
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0, width: 0, visible: false,
  });
  const [hoverPill, setHoverPill] = useState<{ left: number; width: number } | null>(null);

  // Refs for a11y focus management on the mobile overlay
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  const desktopItems = navKeys.slice(1);

  // Position the underline under the active link whenever the route changes
  useLayoutEffect(() => {
    const measure = () => {
      const container = navRef.current;
      const activeEl = linkRefs.current[location.pathname];
      if (!container || !activeEl) {
        setPill((p) => ({ ...p, visible: false }));
        return;
      }
      const cb = container.getBoundingClientRect();
      const lb = activeEl.getBoundingClientRect();
      setPill({ left: lb.left - cb.left, width: lb.width, visible: true });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [location.pathname]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Escape-to-close + focus management for the mobile overlay
  useEffect(() => {
    if (!menuOpen) {
      // Return focus to the hamburger when the menu closes
      hamburgerRef.current?.focus();
      return;
    }

    // Move focus into the overlay (first link)
    firstMobileLinkRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  // Light/dark color tokens for the bar
  const navBarClass = isLight
    ? 'fixed top-0 left-0 right-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-bronze-warm/40 py-5'
    : 'fixed top-0 left-0 right-0 z-50 bg-deepblack/95 backdrop-blur-sm border-b border-bronze-warm/70 py-5';

  const brandClass = isLight
    ? 'font-display text-sm tracking-[0.3em] sm:text-base sm:tracking-[0.4em] uppercase text-charcoal hover:text-deepblack transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]'
    : 'font-display text-sm tracking-[0.3em] sm:text-base sm:tracking-[0.4em] uppercase text-white/90 hover:text-white transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]';

  const hamburgerBarColor = isLight ? 'bg-charcoal' : 'bg-white/85';

  return (
    <>
      {/* Navigation bar */}
      <nav className={navBarClass}>
        <div className="mx-auto max-w-6xl px-8 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className={brandClass}>
            Altera Terra
          </Link>

          {/* Desktop links — shared sliding underline */}
          <div ref={navRef} className="relative hidden md:flex items-center gap-10">
            {desktopItems.map((item) => {
              const active = location.pathname === item.path;
              const inactiveColor = isLight ? 'text-charcoal/80 hover:text-deepblack' : 'text-white/85 hover:text-white';
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  ref={(el) => { linkRefs.current[item.path] = el; }}
                  aria-current={active ? 'page' : undefined}
                  onMouseEnter={() => {
                    const el = linkRefs.current[item.path];
                    const cb = navRef.current?.getBoundingClientRect();
                    if (el && cb) {
                      const lb = el.getBoundingClientRect();
                      setHoverPill({ left: lb.left - cb.left, width: lb.width });
                    }
                  }}
                  onMouseLeave={() => setHoverPill(null)}
                  className={`relative font-body text-[13px] tracking-[0.3em] uppercase transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    active ? 'text-bronze-warm' : inactiveColor
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}

            {/* Active underline — glides between links */}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-2 h-px bg-bronze-warm/90 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                left: (hoverPill ?? pill).left,
                width: (hoverPill ?? pill).width,
                opacity: pill.visible || hoverPill ? 1 : 0,
              }}
            />
          </div>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col items-end gap-[6px] p-2"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={`block h-[1.5px] ${hamburgerBarColor} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? 'w-6 rotate-45 translate-y-[3.75px]' : 'w-6'
              }`}
            />
            <span
              className={`block h-[1.5px] ${hamburgerBarColor} transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? 'w-6 -rotate-45 -translate-y-[3.75px]' : 'w-4'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile fullscreen overlay — stays dark for full-screen contrast */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed inset-0 z-[60] bg-deepblack flex flex-col transition-all duration-700 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top bar with brand + close */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/[0.04]">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="font-display text-base tracking-[0.4em] uppercase text-white/90"
          >
            Altera Terra
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2"
            aria-label="Close menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/70 hover:text-white transition-colors duration-500"
            >
              <line x1="1" y1="1" x2="17" y2="17" />
              <line x1="17" y1="1" x2="1" y2="17" />
            </svg>
          </button>
        </div>

        {/* Menu links — centered */}
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          {navKeys.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              ref={i === 0 ? firstMobileLinkRef : undefined}
              onClick={() => setMenuOpen(false)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              className={`font-display text-2xl font-normal tracking-[0.35em] uppercase transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              } ${
                location.pathname === item.path
                  ? 'text-bronze-warm'
                  : 'text-white/90 hover:text-bronze-warm'
              }`}
              style={{ transitionDelay: menuOpen ? `${i * 90}ms` : '0ms' }}
            >
              {t(item.key)}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
