import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';

interface RequireAdminProps {
  children: React.ReactNode;
}

type Status = 'idle' | 'checking' | 'allowed' | 'denied';

const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const { user, email, loading, signOut } = useAuth();
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    if (!user || !email) {
      setStatus('idle');
      return;
    }
    setStatus('checking');
    supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setStatus('denied');
        } else {
          setStatus('allowed');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user, email, loading]);

  if (loading) return <LoadingSpinner message="Authenticating" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (status === 'checking' || status === 'idle')
    return <LoadingSpinner message="Verifying access" />;

  if (status === 'denied') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-deepblack text-parchment font-body px-6">
        <div className="max-w-md text-center">
          <p className="text-[11px] tracking-[0.35em] uppercase text-bronze-warm mb-6">
            Altera Terra · Atelier
          </p>
          <h1 className="font-display text-3xl md:text-4xl mb-4">
            Access not granted
          </h1>
          <p className="text-parchment/70 text-sm leading-relaxed mb-8">
            The address <span className="text-bronze-warm">{email}</span> is
            not registered as an editor for this atelier. If you believe this
            is in error, contact the studio.
          </p>
          <button
            onClick={() => signOut()}
            className="ease-luxe transition-colors duration-500 inline-flex items-center justify-center px-6 py-3 text-[11px] tracking-[0.35em] uppercase border border-bronze/40 text-parchment hover:bg-bronze-warm hover:text-deepblack hover:border-bronze-warm"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;
