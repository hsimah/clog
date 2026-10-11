import { lazyResource, type RouteEntryPoint } from "@tsquid/routes/entrypoint";
import {
  RouteName,
  LocationIndexRouteQuery,
  type LocationEntryPointParams,
} from "../../routes/__generated__/routes";
import type { LocationRouteQueries } from "./LocationRoute";
import PAGE_QUERY from "../location/__generated__/LocationPageQuery.graphql";
import RECORD_QUERY from "../location/__generated__/LocationRecordQuery.graphql";

export const LOCATION_ENTRY_POINT: RouteEntryPoint<
  LocationEntryPointParams,
  LocationRouteQueries
> = {
  root: lazyResource("LocationRoute", () =>
    import("./LocationRoute").then((module) => module.LocationRoute),
  ),
  getPreloadProps: (route) => ({
    queries: {
      page: {
        parameters: PAGE_QUERY,
        variables: LocationIndexRouteQuery.getVariables(route.input),
      },
      record:
        route.currentRoute === RouteName.LocationDetail ||
        route.currentRoute === RouteName.LocationEdit
          ? { parameters: RECORD_QUERY, variables: { id: route.input.id } }
          : undefined,
    },
  }),
};
