import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@astryxdesign/core/Button';
import { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav';
import * as stylex from '@stylexjs/stylex';
import { navItems } from '@/lib/route-map';
import { logout } from '@/lib/session';
import clogLogo from '@/assets/clog.png';

const styles = stylex.create({
  logo: { width: 32, height: 32, objectFit: 'contain', flexShrink: 0 },
});

export function Header() {
  const { pathname } = useLocation();
  const [error, setError] = useState('');

  return (
    <>
      <TopNav
        label="Main navigation"
        heading={<TopNavHeading heading="clog" headingHref="/"
          logo={<img src={clogLogo} {...stylex.props(styles.logo)} alt="" />} />}
        startContent={navItems.map((item) => (
          <TopNavItem key={item.path} href={item.path} label={item.label}
            isSelected={pathname === item.path || pathname.startsWith(`${item.path}/`) ||
              (item.path === '/inventory' && pathname === '/')} />
        ))}
        endContent={<Button label="Sign out" variant="ghost" onClick={() => {
          if (window.confirm('Sign out? Unsaved changes in Clog tabs will be discarded.')) {
            void logout().catch(() => setError('Could not sign out. Please try again.'));
          }
        }} />}
      />
      {error && <p role="alert">{error}</p>}
    </>
  );
}
