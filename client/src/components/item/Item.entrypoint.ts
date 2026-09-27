import type { RouteEntryPoint } from "@tsquid/routes/entrypoint";
import { RouteResource } from "../../routes/RouteResource";
import type { RouteState } from "../../routes/RouteState";
import type { ItemRouteQueries } from "./ItemRoute";
import PAGE_QUERY from "../item/__generated__/ItemPageQuery.graphql";
import RECORD_QUERY from "../item/__generated__/ItemRecordQuery.graphql";

export const ITEM_ENTRY_POINT: RouteEntryPoint<
  RouteState,
  ItemRouteQueries,
  Empty,
  Empty,
  RouteState
> = {
  root: RouteResource("ItemRoute", () =>
    import("./ItemRoute").then((module) => module.ItemRoute),
  ),
  getPreloadProps: (route) => ({
    extraProps: route,
    queries: {
      page: { parameters: PAGE_QUERY, variables: { term: route.term ?? "" } },
      record:
        route.view === "detail" || route.view === "edit"
          ? { parameters: RECORD_QUERY, variables: { id: route.id } }
          : undefined,
    },
  }),
};

type Empty = Record<string, never>;
