import { useId, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useReveal } from '@/hooks/useReveal';

export default function Newsletter() {
  const { ref, visible } = useReveal({ threshold: 0.15 });
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  const emailId = useId();
  const emailErrorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const endpoint = import.meta.env.VITE_NEWSLETTER_ENDPOINT;
      if (!endpoint) {
        // Dev fallback when no backend is configured yet.
        setSubmitted(true);
        setEmail('');
        return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'website' }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      setSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('[Newsletter] Submission error:', err);
      setError(t('consult.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="newsletter" className="relative bg-deepblack overflow-hidden min-h-[calc(100dvh-68px)] flex flex-col justify-center">
      <div className="mx-auto max-w-6xl px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      <div ref={ref} className="py-24 md:py-32">
        <div
          className={`mx-auto max-w-xl px-8 text-center transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          <div className="mx-auto mb-10 h-px w-10 bg-gradient-to-r from-transparent via-bronze/40 to-transparent" />

          <span aria-hidden="true" className="font-body text-[11px] tracking-[0.5em] uppercase text-bronze/75 block mb-6">
            {t('newsletter.label')}
          </span>

          <h2 className="font-display text-3xl font-normal text-white/95 sm:text-4xl md:text-5xl leading-tight tracking-[-0.01em] px-2">
            {t('newsletter.title')}
          </h2>

          <p className="mt-6 font-body text-[15px] sm:text-base leading-[1.85] text-white/75 max-w-md mx-auto">
            {t('newsletter.subtitle')}
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} noValidate className="mt-12 flex flex-col sm:flex-row items-center gap-4 max-w-md mx-auto">
              <label htmlFor={emailId} className="sr-only">
                {t('newsletter.placeholder')}
              </label>
              <input
                id={emailId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('newsletter.placeholder')}
                required
                aria-invalid={!!error}
                aria-describedby={error ? emailErrorId : undefined}
                className="w-full flex-1 bg-transparent border-b border-white/20 focus-visible:border-bronze-warm focus-visible:[box-shadow:0_1px_0_0_#C99879] px-2 py-4 font-body text-sm tracking-[0.05em] text-white/90 placeholder:text-white/45 outline-none transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
              <button
                type="submit"
                disabled={submitting}
                className="shrink-0 group font-body text-xs tracking-[0.35em] uppercase text-white/85 border border-bronze/50 px-10 py-4 hover:text-white hover:border-bronze hover:bg-bronze/5 transition-colors duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="inline-block">{t('newsletter.subscribe')}</span>
              </button>
            </form>
          ) : (
            <div className="mt-12" role="status" aria-live="polite">
              <p className="font-display text-lg font-light text-bronze/70 italic">
                {t('newsletter.thanks')}
              </p>
            </div>
          )}

          {error && (
            <p
              id={emailErrorId}
              role="alert"
              className="mt-4 font-body text-[12px] text-red-400/80"
            >
              {error}
            </p>
          )}

          <p className="mt-8 font-body text-[11px] tracking-[0.1em] text-white/70">
            {t('newsletter.privacy')}
          </p>
        </div>
      </div>
    </section>
  );
}
