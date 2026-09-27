import type { RouteEntryPoint } from "@tsquid/routes/entrypoint";
import { RouteResource } from "../../routes/RouteResource";
import type { RouteState } from "../../routes/RouteState";
import type { InventoryRouteQueries } from "./InventoryRoute";
import PAGE_QUERY from "../inventory/__generated__/InventoryPageQuery.graphql";
import LOCATIONS_QUERY from "../inventory/__generated__/InventoryLocationsQuery.graphql";
import RECORD_QUERY from "../inventory/__generated__/InventoryRecordQuery.graphql";
import ITEM_QUERY from "../item/__generated__/ItemRecordQuery.graphql";
import LOCATION_QUERY from "../location/__generated__/LocationRecordQuery.graphql";
import STOCK_QUERY from "../stock/__generated__/StockSelectionQuery.graphql";

export const INVENTORY_ENTRY_POINT: RouteEntryPoint<
  RouteState,
  InventoryRouteQueries,
  Empty,
  Empty,
  RouteState
> = {
  root: RouteResource("InventoryRoute", () =>
    import("./InventoryRoute").then((module) => module.InventoryRoute),
  ),
  getPreloadProps: (route) => ({
    extraProps: route,
    queries: {
      page: {
        parameters: PAGE_QUERY,
        variables: { term: route.term ?? "", location: route.location ?? null },
      },
      locations: {
        parameters: LOCATIONS_QUERY,
        variables: { id: route.location ?? "", selected: !!route.location },
      },
      record:
        route.view === "detail" || route.view === "edit"
          ? { parameters: RECORD_QUERY, variables: { id: route.id } }
          : undefined,
      item:
        route.view === "item" || route.view === "item-edit"
          ? { parameters: ITEM_QUERY, variables: { id: route.id } }
          : undefined,
      location:
        route.view === "location" || route.view === "location-edit"
          ? { parameters: LOCATION_QUERY, variables: { id: route.id } }
          : undefined,
      stock:
        route.view === "stock"
          ? {
              parameters: STOCK_QUERY,
              variables: {
                item: route.itemId,
                location: route.locationId ?? null,
              },
            }
          : undefined,
    },
  }),
};

type Empty = Record<string, never>;
