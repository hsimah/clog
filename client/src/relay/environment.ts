import { Environment, Network, Observable, RecordSource, Store, type GraphQLResponse } from 'relay-runtime';
import { graphqlUrl, sessionFetch, subscribeSession, getSessionSnapshot } from '@/lib/session';

const source = new RecordSource();
const requests = new Set<AbortController>();
export const environment = new Environment({
  network: Network.create((operation, variables) => Observable.create<GraphQLResponse>((sink) => {
    const controller = new AbortController();
    requests.add(controller);
    void (async () => {
      try {
        const response = await sessionFetch(graphqlUrl, {
          method: 'POST', signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: operation.text, operationName: operation.name, variables }),
        });
        if (!response.ok) throw new Error(`Could not load inventory (${response.status}).`);
        const payload = await response.json();
        if (payload.errors?.length) {
          throw new Error(payload.errors.map((error: { message: string }) => error.message).join(' '));
        }
        if (!payload.data) throw new Error('The server returned no inventory data.');
        sink.next(payload);
        sink.complete();
      } catch (error) {
        if (!controller.signal.aborted) sink.error(error instanceof Error ? error : new Error('Request failed.'));
      } finally {
        requests.delete(controller);
      }
    })();
    return () => { controller.abort(); requests.delete(controller); };
  })),
  store: new Store(source),
});

// The session boundary requires a full reload after either terminal transition.
// Abort in-flight operations and remove every normalized record immediately.
subscribeSession(() => {
  if (['changed', 'signed-out'].includes(getSessionSnapshot().status)) {
    requests.forEach((request) => request.abort());
    requests.clear();
    source.clear();
    environment.getStore().notify();
  }
});
