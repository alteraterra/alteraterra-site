import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="luxe-cursor min-h-[100dvh] bg-deepblack flex flex-col items-center justify-center px-8 text-center">
      {/* Compass rose — single SVG, slow rotation */}
      <div className="relative mb-12" aria-hidden>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          className="text-bronze-warm/70 animate-[spin_60s_linear_infinite]"
        >
          <circle cx="60" cy="60" r="48" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="60" cy="60" r="32" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          {/* Cardinal points */}
          <path d="M60 12 L62 60 L60 60 L58 60 Z" fill="currentColor" />
          <path d="M60 108 L62 60 L60 60 L58 60 Z" fill="currentColor" opacity="0.4" />
          <path d="M12 60 L60 58 L60 60 L60 62 Z" fill="currentColor" opacity="0.4" />
          <path d="M108 60 L60 58 L60 60 L60 62 Z" fill="currentColor" opacity="0.4" />
          {/* Diagonals */}
          <path d="M25 25 L60 60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <path d="M95 25 L60 60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <path d="M25 95 L60 60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          <path d="M95 95 L60 60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
          {/* Center dot */}
          <circle cx="60" cy="60" r="2" fill="currentColor" />
        </svg>
      </div>

      <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal tracking-[0.15em] text-white/95 mb-6">
        You have wandered.
      </h1>

      <p className="font-display italic text-lg sm:text-xl text-bronze-warm/90 max-w-md mb-2">
        Non omnia possumus omnes.
      </p>
      <p className="font-body text-[13px] tracking-wide text-white/65 max-w-md mb-12">
        We cannot all do everything — and this page, it seems, is not yet among the things we do.
      </p>

      <Link
        to="/"
        className="font-body text-xs tracking-[0.4em] uppercase text-white/90 border border-bronze-warm/60 px-12 py-4 hover:text-white hover:border-bronze-warm hover:tracking-[0.5em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        Return to the path
      </Link>
    </div>
  );
}
