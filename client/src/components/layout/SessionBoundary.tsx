import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { getSessionSnapshot, subscribeSession, refreshSession, suspendSession, loginUrl } from '@/lib/session';

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
    {!active && <main className="mx-auto max-w-lg space-y-4 p-8" aria-label="Session">
      <h1 className="text-xl font-bold">{session.status === 'checking' ? 'Checking your session…' : ended ? 'Session ended' : session.status === 'unavailable' ? 'Could not check your session' : 'Sign in to continue'}</h1>
      {session.status !== 'checking' && <>
        <p>{ended ? 'Reload to continue with the current account. Previous account data has been cleared.' : 'Your unsaved input stays in this tab. Sign in in another tab, then check your session here.'}</p>
        <a className="underline" href={loginUrl} target="_blank" rel="noopener noreferrer">Open WordPress sign-in</a>
        <button className="block underline" onClick={() => ended ? location.reload() : void refreshSession().catch(() => {})}>
          {ended ? 'Reload Clog' : 'Check session'}
        </button>
      </>}
    </main>}
    <div hidden={!active} inert={!active}>{session.userId !== null && !ended ? children : null}</div>
  </>;
}
