import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Link } from '@astryxdesign/core/Link';
import { Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';
import { getSessionSnapshot, subscribeSession, refreshSession, suspendSession, loginUrl } from '@/lib/session';

const styles = stylex.create({ session: { marginInline: 'auto', maxWidth: '32rem', padding: 'var(--spacing-8)' } });

export function SessionBoundary({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot);
  useEffect(() => {
    const check = () => { void refreshSession().catch(() => {}); };
    check();
    const timer = window.setInterval(check, 30_000);
    const visibility = () => document.hidden ? suspendSession() : check();
    window.addEventListener('focus', check);
    window.addEventListener('pageshow', check);
    window.addEventListener('pagehide', suspendSession);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', check);
      window.removeEventListener('pageshow', check);
      window.removeEventListener('pagehide', suspendSession);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  const active = session.status === 'active';
  const ended = ['changed', 'signed-out'].includes(session.status);
  return <>
    {!active && <main {...stylex.props(styles.session)} aria-label="Session"><Stack gap={4}>
      <Text as="h1" type="display-3">{session.status === 'checking' ? 'Checking your session…' : ended ? 'Session ended' : session.status === 'unavailable' ? 'Could not check your session' : 'Sign in to continue'}</Text>
      {session.status !== 'checking' && <>
        <p>{ended ? 'Reload to continue with the current account. Previous account data has been cleared.' : 'Your unsaved input stays in this tab. Sign in in another tab, then check your session here.'}</p>
        <Link href={loginUrl} target="_blank" rel="noopener noreferrer">Open WordPress sign-in</Link>
        <Button variant="secondary" label={ended ? 'Reload Clog' : 'Check session'} onClick={() => ended ? location.reload() : void refreshSession().catch(() => {})} />
      </>}
    </Stack></main>}
    <div hidden={!active} inert={!active}>{session.userId !== null && !ended ? children : null}</div>
  </>;
}
