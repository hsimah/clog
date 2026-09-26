import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { navItems } from '@/lib/route-map';
import clogLogo from '/clog.png';
import { logout } from '@/lib/session';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [error, setError] = useState('');

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={clogLogo} className="h-8 w-8" alt="Clog logo" />
            <Link to="/" className="text-xl font-bold">
              clog
            </Link></div>
          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path))
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
            <button className="text-sm underline" onClick={() => {
              if (window.confirm('Sign out? Unsaved changes in Clog tabs will be discarded.')) {
                void logout().catch(() => setError('Could not sign out. Please try again.'));
              }
            }}>Sign out</button>
          </nav>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
    </header>
  );
}
