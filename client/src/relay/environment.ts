import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  type GraphQLResponse,
  type RequestParameters,
  type Variables,
} from "relay-runtime";
import { SESSION } from "../lib/session";
import { readInitialData, withInitialData } from "@tsquid/routes/initialData";

const SOURCE = new RecordSource();
const REQUESTS = new Set<AbortController>();
const FETCH_GRAPHQL = withInitialData(fetchGraphQL, readInitialData(), {
  warn: import.meta.env.DEV,
});

export const ENVIRONMENT = new Environment({
  network: Network.create((operation, variables, cacheConfig, uploadables) =>
    Observable.from(FETCH_GRAPHQL(operation, variables, cacheConfig, uploadables))
      .map(validateGraphQLResponse),
  ),
  store: new Store(SOURCE),
});

function fetchGraphQL(operation: RequestParameters, variables: Variables) {
  return Observable.create<GraphQLResponse>((sink) => {
    const controller = new AbortController();
    REQUESTS.add(controller);
    void (async () => {
      try {
        const response = await SESSION.sessionFetch(SESSION.graphqlUrl, {
          method: "POST",
          signal: controller.signal,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: operation.text,
            operationName: operation.name,
            variables,
          }),
        });
        if (!response.ok)
          throw new Error(`Could not load inventory (${response.status}).`);
        const payload = await response.json();
        sink.next(payload);
        sink.complete();
      } catch (error) {
        if (!controller.signal.aborted)
          sink.error(
            error instanceof Error ? error : new Error("Request failed."),
          );
      } finally {
        REQUESTS.delete(controller);
      }
    })();
    return () => {
      controller.abort();
      REQUESTS.delete(controller);
    };
  });
}

function validateGraphQLResponse(payload: GraphQLResponse) {
  if ("errors" in payload && payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(" "));
  }
  if (!("data" in payload) || !payload.data)
    throw new Error("The server returned no inventory data.");
  return payload;
}

// The session boundary requires a full reload after either terminal transition.
// Abort in-flight operations and remove every normalized record immediately.
SESSION.subscribeSession(() => {
  if (["changed", "signed-out"].includes(SESSION.getSessionSnapshot().status)) {
    REQUESTS.forEach((request) => request.abort());
    REQUESTS.clear();
    SOURCE.clear();
    ENVIRONMENT.getStore().notify();
  }
});
