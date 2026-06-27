import React from 'react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

// No-op passthrough. Kept for compile compatibility only; not wired to any route.
const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedAdminRoute;
