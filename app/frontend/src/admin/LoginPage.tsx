import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-deepblack text-parchment font-body px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[0.35em] uppercase text-bronze-warm mb-4">
            Altera Terra
          </p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight">
            Atelier
          </h1>
          <div className="mx-auto mt-6 h-px w-12 bg-bronze/50" />
          <p className="text-parchment/60 text-sm mt-6 leading-relaxed">
            Editor access by invitation.
          </p>
        </div>

        {sent ? (
          <div className="border border-bronze/30 bg-charcoal/40 px-6 py-8 text-center">
            <p className="font-display text-2xl text-parchment mb-3">
              Check your inbox
            </p>
            <p className="text-parchment/70 text-sm leading-relaxed">
              We sent a magic link to{' '}
              <span className="text-bronze-warm">{email}</span>. The link
              expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label
              htmlFor="email"
              className="block text-[11px] tracking-[0.3em] uppercase text-parchment/60 mb-3"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              disabled={submitting}
              className="ease-luxe transition-all duration-500 w-full bg-transparent border-b border-bronze/40 px-1 py-3 text-parchment placeholder:text-parchment/30 focus:outline-none focus:border-bronze-warm"
            />

            {error && (
              <p
                role="alert"
                className="mt-4 text-sm text-bronze-warm/90 leading-relaxed"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="ease-luxe transition-colors duration-500 mt-10 w-full inline-flex items-center justify-center px-6 py-4 text-[11px] tracking-[0.35em] uppercase border border-bronze/40 text-parchment hover:bg-bronze-warm hover:text-deepblack hover:border-bronze-warm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
