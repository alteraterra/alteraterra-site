import { Navigate } from 'react-router-dom';

/**
 * Magic-link landing route. supabase-js (detectSessionInUrl) consumes the session
 * from the URL hash at app boot; all this page has to do is hand the admin to the CMS.
 * RequireAdmin guards /admin, so a bad/expired link just shows the login screen.
 */
export default function AuthCallback() {
  return <Navigate to="/admin" replace />;
}
