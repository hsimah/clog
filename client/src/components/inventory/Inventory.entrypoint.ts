import { lazyResource, type RouteEntryPoint } from "@tsquid/routes/entrypoint";
import {
  RouteName,
  InventoryIndexRouteQuery,
  type InventoryEntryPointParams,
} from "../../routes/__generated__/routes";
import type { InventoryRouteQueries } from "./InventoryRoute";
import PAGE_QUERY from "../inventory/__generated__/InventoryPageQuery.graphql";
import LOCATIONS_QUERY from "../inventory/__generated__/InventoryLocationsQuery.graphql";
import RECORD_QUERY from "../inventory/__generated__/InventoryRecordQuery.graphql";
import ITEM_QUERY from "../item/__generated__/ItemRecordQuery.graphql";
import LOCATION_QUERY from "../location/__generated__/LocationRecordQuery.graphql";
import STOCK_QUERY from "../stock/__generated__/StockSelectionQuery.graphql";

export const INVENTORY_ENTRY_POINT: RouteEntryPoint<
  InventoryEntryPointParams,
  InventoryRouteQueries
> = {
  root: lazyResource("InventoryRoute", () =>
    import("./InventoryRoute").then((module) => module.InventoryRoute),
  ),
  getPreloadProps: (route) => ({
    queries: {
      page: {
        parameters: PAGE_QUERY,
        variables: InventoryIndexRouteQuery.getVariables(route.input),
      },
      locations: {
        parameters: LOCATIONS_QUERY,
        variables: {
          id: route.input.location ?? "",
          selected: !!route.input.location,
        },
      },
      record:
        route.currentRoute === RouteName.InventoryDetail ||
        route.currentRoute === RouteName.InventoryEdit
          ? { parameters: RECORD_QUERY, variables: { id: route.input.id } }
          : undefined,
      item:
        route.currentRoute === RouteName.InventoryItemDetail ||
        route.currentRoute === RouteName.InventoryItemEdit
          ? { parameters: ITEM_QUERY, variables: { id: route.input.id } }
          : undefined,
      location:
        route.currentRoute === RouteName.InventoryLocationDetail ||
        route.currentRoute === RouteName.InventoryLocationEdit
          ? { parameters: LOCATION_QUERY, variables: { id: route.input.id } }
          : undefined,
      stock:
        route.currentRoute === RouteName.InventoryStock ||
        route.currentRoute === RouteName.InventoryStockLocation
          ? {
              parameters: STOCK_QUERY,
              variables: {
                item: route.input.itemId,
                location: route.currentRoute === RouteName.InventoryStockLocation
                    ? route.input.locationId
                    : null,
              },
            }
          : undefined,
    },
  }),
};
