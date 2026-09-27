import { useEffect, useRef } from "react";
import { useMutation } from "react-relay";
import type { GraphQLTaggedNode, MutationParameters } from "relay-runtime";

/** Mutations execute once. Callers retain input and surface uncertain outcomes. */
export function useSaveMutation<T extends MutationParameters>(
  mutation: GraphQLTaggedNode,
) {
  const [commit, pending] = useMutation<T>(mutation);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  function save(
    variables: T["variables"],
    completed: (response: T["response"]) => void,
    failed: (error: Error) => void,
  ) {
    commit({
      variables,
      updater: (store) => store.invalidateStore(),
      onCompleted: (response, errors) => {
        if (!mounted.current) return;
        if (errors?.length)
          failed(new Error(errors.map((error) => error.message).join(" ")));
        else completed(response);
      },
      onError: (error) => {
        if (mounted.current) failed(error);
      },
    });
  }
  return { save, pending };
}
