import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // onAuthStateChange fires an INITIAL_SESSION event AFTER the client has
    // parsed any magic-link hash (#access_token=...) from the URL. Relying on it
    // (rather than an eager getSession) avoids the race where RequireAdmin bounces
    // the user before the session from the URL is stored.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      setLoading(false);
    });

    // Fallback: if for some reason no event fires (e.g. SDK already initialized),
    // resolve the current session directly so we never hang on the spinner.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession((prev) => prev ?? data.session);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    email: session?.user?.email ?? null,
    loading,
    signOut: () => supabase.auth.signOut(),
  };
}
