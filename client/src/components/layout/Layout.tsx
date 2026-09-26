import type { ReactNode } from 'react';
import { AppShell } from '@astryxdesign/core/AppShell';
import { LinkProvider } from '@astryxdesign/core/Link';
import * as stylex from '@stylexjs/stylex';
import { Header } from '@/components/layout/Header';
import { RouterLink } from '@/components/layout/RouterLink';

const styles = stylex.create({
  content: { width: '100%', maxWidth: 1440, marginInline: 'auto', minWidth: 0 },
});

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <LinkProvider component={RouterLink}>
      <AppShell height="auto" variant="section" contentPadding={4}
        topNav={<Header />} mobileNav={{ breakpoint: 'md' }}>
        <div {...stylex.props(styles.content)}>{children}</div>
      </AppShell>
    </LinkProvider>
  );
}
