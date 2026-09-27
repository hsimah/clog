import type { RouteEntryPoint } from "@tsquid/routes/entrypoint";
import { RouteResource } from "../../routes/RouteResource";
import type { RouteState } from "../../routes/RouteState";
import type { LocationRouteQueries } from "./LocationRoute";
import PAGE_QUERY from "../location/__generated__/LocationPageQuery.graphql";
import RECORD_QUERY from "../location/__generated__/LocationRecordQuery.graphql";

export const LOCATION_ENTRY_POINT: RouteEntryPoint<
  RouteState,
  LocationRouteQueries,
  Empty,
  Empty,
  RouteState
> = {
  root: RouteResource("LocationRoute", () =>
    import("./LocationRoute").then((module) => module.LocationRoute),
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
