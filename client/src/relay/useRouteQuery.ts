import { useEffect, useState } from 'react';
import { loadQuery, useRelayEnvironment, type PreloadedQuery } from 'react-relay';
import type { GraphQLTaggedNode, OperationType } from 'relay-runtime';

/** Own both retention and network lifetime. Memoize variables at the route. */
export function useRouteQuery<T extends OperationType>(query: GraphQLTaggedNode, variables: T['variables'], revision = 0) {
  const environment = useRelayEnvironment();
  const [reference, setReference] = useState<PreloadedQuery<T> | null>(null);
  useEffect(() => {
    const next = loadQuery<T>(environment, query, variables, { fetchPolicy: 'network-only' });
    // This state holds an external request resource created by the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReference(next);
    // Relay 21 useQueryLoader only releases ordinary queries on unmount; it
    // leaves the network running. Explicit disposal cancels that work too.
    return () => next.dispose();
  }, [environment, query, variables, revision]);
  return reference;
}
