import { useEffect, useState } from "react";
import {
  loadQuery,
  useRelayEnvironment,
  type PreloadedQuery,
} from "react-relay";
import type { GraphQLTaggedNode, OperationType } from "relay-runtime";

/** Entrypoints own initial loads. This hook owns explicit refreshes and on-demand picker/drilldown requests. */
export function useRouteQuery<T extends OperationType>(
  query: GraphQLTaggedNode,
  variables: T["variables"],
  revision = 0,
  initial?: PreloadedQuery<T>,
) {
  const environment = useRelayEnvironment();
  const [state, setState] = useState<{
    reference: PreloadedQuery<T>;
    initial?: PreloadedQuery<T>;
    variables: T["variables"];
  } | null>(null);
  useEffect(() => {
    if (initial && revision === 0) return;
    const reference = loadQuery<T>(environment, query, variables, {
      fetchPolicy: "network-only",
    });
    setState({ reference, initial, variables });
    return () => reference.dispose();
  }, [environment, query, variables, revision, initial]);
  return state?.initial === initial && state?.variables === variables
    ? state.reference
    : (initial ?? null);
}
