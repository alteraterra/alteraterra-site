import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/articles', label: 'Articles' },
  { to: '/admin/media', label: 'Media' },
  { to: '/admin/site', label: 'Site Content' },
  { to: '/admin/settings', label: 'Settings' },
];

const navLinkClass = (isActive: boolean) =>
  [
    'ease-luxe transition-colors duration-500 block px-4 py-3 text-[11px] tracking-[0.3em] uppercase',
    isActive
      ? 'text-bronze-warm border-l-2 border-bronze-warm bg-charcoal/30'
      : 'text-parchment/60 border-l-2 border-transparent hover:text-parchment hover:border-bronze/40',
  ].join(' ');

const Wordmark: React.FC = () => (
  <div className="px-6 py-8 border-b border-bronze/10">
    <p className="text-[10px] tracking-[0.4em] uppercase text-bronze-warm mb-2">
      Altera Terra
    </p>
    <p className="font-display text-2xl text-parchment leading-none">
      Atelier
    </p>
  </div>
);

const AdminLayout: React.FC = () => {
  const { email, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-[100dvh] bg-deepblack text-parchment font-body">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-[240px] flex-col border-r border-bronze/10 bg-deepblack z-30">
        <Wordmark />
        <nav className="flex-1 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-5 h-14 border-b border-bronze/10 bg-deepblack">
        <p className="font-display text-lg text-parchment">Atelier</p>
        <button
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="ease-luxe transition-colors duration-500 text-parchment/70 hover:text-bronze-warm p-2 -mr-2"
        >
          <span className="block w-5 h-px bg-current mb-1.5" />
          <span className="block w-5 h-px bg-current mb-1.5" />
          <span className="block w-5 h-px bg-current" />
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-deepblack/95 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-[260px] bg-deepblack border-r border-bronze/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pr-4">
              <Wordmark />
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="text-parchment/60 hover:text-bronze-warm text-2xl"
              >
                ×
              </button>
            </div>
            <nav className="py-6">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="md:pl-[240px]">
        {/* Top bar */}
        <div className="hidden md:flex items-center justify-end gap-6 h-14 px-8 border-b border-bronze/10">
          {email && (
            <span className="text-[11px] tracking-[0.25em] uppercase text-parchment/50">
              {email}
            </span>
          )}
          <button
            onClick={() => signOut()}
            className="ease-luxe transition-colors duration-500 text-[11px] tracking-[0.3em] uppercase text-parchment/60 hover:text-bronze-warm"
          >
            Sign out
          </button>
        </div>

        {/* Mobile email + signout row */}
        <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-bronze/10 text-[11px] tracking-[0.25em] uppercase">
          <span className="text-parchment/50 truncate max-w-[60%]">{email}</span>
          <button
            onClick={() => signOut()}
            className="ease-luxe transition-colors duration-500 text-parchment/60 hover:text-bronze-warm"
          >
            Sign out
          </button>
        </div>

        <main className="px-6 md:px-10 lg:px-14 py-10 md:py-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
