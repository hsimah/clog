import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@astryxdesign/core/Button';
import { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav';
import * as stylex from '@stylexjs/stylex';
import { navItems } from '@/lib/route-map';
import { logout } from '@/lib/session';
import clogLogo from '@/assets/clog-white.png';

const styles = stylex.create({
  nav: {
    backgroundColor: '#181310',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#ff5722',
  },
  tab: {
    color: 'var(--clog-orange-text)',
    borderRadius: 8,
    backgroundColor: { default: 'transparent', ':hover': 'var(--clog-orange-soft)' },
    transition: 'background-color 150ms ease, color 150ms ease',
  },
  selectedTab: {
    color: '#121212',
    backgroundColor: { default: '#ff5722', ':hover': '#ff7043' },
    boxShadow: '0 3px 14px #ff572233',
    fontWeight: 700,
  },
  logo: { width: 32, height: 32, objectFit: 'contain', flexShrink: 0 },
});

export function Header() {
  const { pathname } = useLocation();
  const [error, setError] = useState('');

  return (
    <>
      <TopNav xstyle={styles.nav}
        label="Main navigation"
        heading={<TopNavHeading heading="clog" headingHref="/"
          logo={<img src={clogLogo} {...stylex.props(styles.logo)} alt="" />} />}
        startContent={navItems.map((item) => (
          <TopNavItem key={item.path} href={item.path} label={item.label}
            xstyle={[styles.tab, (pathname === item.path || pathname.startsWith(`${item.path}/`)) && styles.selectedTab]}
            isSelected={pathname === item.path || pathname.startsWith(`${item.path}/`)} />
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
