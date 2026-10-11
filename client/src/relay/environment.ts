import {
  Environment,
  Network,
  Observable,
  RecordSource,
  Store,
  type GraphQLResponse,
} from "relay-runtime";
import { SESSION } from "../lib/session";
import { readInitialData, withInitialData } from "@tsquid/routes/initialData";

const SOURCE = new RecordSource();
const REQUESTS = new Set<AbortController>();
export const ENVIRONMENT = new Environment({
  network: Network.create(
    withInitialData(
      (operation, variables) =>
        Observable.create<GraphQLResponse>((sink) => {
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
              if (payload.errors?.length) {
                throw new Error(
                  payload.errors
                    .map((error: { message: string }) => error.message)
                    .join(" "),
                );
              }
              if (!payload.data)
                throw new Error("The server returned no inventory data.");
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
        }),
      readInitialData(),
      { warn: import.meta.env.DEV },
    ),
  ),
  store: new Store(SOURCE),
});

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
