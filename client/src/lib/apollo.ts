import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { graphqlUrl, sessionFetch, subscribeSession, getSessionSnapshot } from '@/lib/session';

const httpLink = createHttpLink({
  uri: graphqlUrl,
  fetch: sessionFetch,
});

export const client = new ApolloClient({
  link: httpLink,
  // Elephentity exposes globally unique Node IDs; Apollo normalizes them directly.
  cache: new InMemoryCache(),
});

subscribeSession(() => {
  if (['changed', 'signed-out'].includes(getSessionSnapshot().status)) void client.clearStore();
});
