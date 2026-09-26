// Shared fetch transport; usable by Apollo now and Relay after #36.
interface Session {
  userId: string;
  nonce: string | null;
  canWrite: boolean;
}
interface Snapshot {
  status: 'checking' | 'active' | 'expired' | 'changed' | 'unavailable' | 'signed-out';
  userId: string | null;
  canWrite: boolean;
}
const configElement = document.getElementById('clog-config');
const config: { ajaxUrl: string; graphqlUrl: string; loginUrl: string } = configElement?.textContent
  ? JSON.parse(configElement.textContent)
  : { ajaxUrl: '/wp-admin/admin-ajax.php', graphqlUrl: '/graphql', loginUrl: '/wp-login.php?redirect_to=/clog' };
export const graphqlUrl = config.graphqlUrl;
export const loginUrl = config.loginUrl;
let snapshot: Snapshot = { status: 'checking', userId: null, canWrite: false };
let identity: string | null = null;
let generation = 0;
let pending: Promise<Session> | null = null;
const listeners = new Set<() => void>();
export const getSessionSnapshot = () => snapshot;
export function suspendSession() {
  if (snapshot.status === 'active') publish('checking');
}
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
function publish(status: Snapshot['status'], canWrite = false) {
  if (snapshot.status === status && snapshot.canWrite === canWrite) return;
  snapshot = { status, userId: identity, canWrite };
  listeners.forEach((listener) => listener());
}
function endpoint(action: string) {
  const url = new URL(config.ajaxUrl, location.origin);
  url.searchParams.set('action', action);
  return url;
}
export async function refreshSession(): Promise<Session> {
  if (snapshot.status === 'changed' || snapshot.status === 'signed-out') {
    throw new Error('Reload to start a new session.');
  }
  if (pending) return pending;
  const started = generation;
  pending = (async () => {
    try {
      const response = await fetch(endpoint('clog_graphql_session'), { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Could not check your session.');
      const session: Session = await response.json();
      if (started !== generation) throw new Error('Session changed.');
      if (typeof session.userId !== 'string' || typeof session.canWrite !== 'boolean') {
        throw new Error('Invalid session response.');
      }
      if (session.userId === '0' || typeof session.nonce !== 'string') {
        publish('expired');
        throw new Error('Sign in to continue. Your unsaved input is still in this tab.');
      }
      if (identity !== null && identity !== session.userId) {
        generation++;
        publish('changed');
        throw new Error('The signed-in account changed. Reload to continue.');
      }
      identity = session.userId;
      publish('active', session.canWrite);
      return session;
    } catch (error) {
      if (started === generation && !['expired', 'changed', 'signed-out'].includes(snapshot.status)) publish('unavailable');
      throw error;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

export async function sessionFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const session = await refreshSession();
  const started = generation;
  const headers = new Headers(init?.headers);
  headers.set('X-WP-Nonce', session.nonce!);
  const response = await fetch(input, { ...init, headers, credentials: 'same-origin', cache: 'no-store' });
  // Discard responses belonging to an account that signed out/switched in flight.
  await refreshSession();
  if (started !== generation) throw new Error('Session changed while loading inventory.');
  // Never replay a mutation: a lost response might follow a successful write.
  return response;
}

export async function logout(): Promise<void> {
  const session = await refreshSession();
  const response = await fetch(endpoint('clog_logout'), {
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
    body: new URLSearchParams({ _ajax_nonce: session.nonce! }),
  });
  if (!response.ok) throw new Error('Could not sign out. Please try again.');
  generation++;
  publish('signed-out');
  channel.postMessage('signed-out');
}

const channel = new BroadcastChannel('clog-session');
channel.onmessage = () => { generation++; publish('signed-out'); };
// Remove credentials left by the old client. No session data is persisted here.
localStorage.removeItem('clog_jwt_token');
