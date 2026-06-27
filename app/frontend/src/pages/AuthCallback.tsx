import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function AuthCallback() {
  useEffect(() => {
    // Auth is no longer handled client-side; bounce to home.
    window.location.replace('/');
  }, []);

  return <Navigate to="/" replace />;
}
