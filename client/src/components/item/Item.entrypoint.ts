import { lazyResource, type RouteEntryPoint } from "@tsquid/routes/entrypoint";
import {
  RouteName,
  ItemIndexRouteQuery,
  type ItemEntryPointParams,
} from "../../routes/__generated__/routes";
import type { ItemRouteQueries } from "./ItemRoute";
import PAGE_QUERY from "../item/__generated__/ItemPageQuery.graphql";
import RECORD_QUERY from "../item/__generated__/ItemRecordQuery.graphql";

export const ITEM_ENTRY_POINT: RouteEntryPoint<
  ItemEntryPointParams,
  ItemRouteQueries
> = {
  root: lazyResource("ItemRoute", () =>
    import("./ItemRoute").then((module) => module.ItemRoute),
  ),
  getPreloadProps: (route) => ({
    queries: {
      page: {
        parameters: PAGE_QUERY,
        variables: ItemIndexRouteQuery.getVariables(route.input),
      },
      record:
        route.currentRoute === RouteName.ItemDetail ||
        route.currentRoute === RouteName.ItemEdit
          ? { parameters: RECORD_QUERY, variables: { id: route.input.id } }
          : undefined,
    },
  }),
};
