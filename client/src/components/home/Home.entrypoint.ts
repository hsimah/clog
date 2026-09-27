import type { RouteEntryPoint } from "@tsquid/routes/entrypoint";
import { RouteResource } from "../../routes/RouteResource";
import type { RouteState } from "../../routes/RouteState";
import type { HomeRouteQueries } from "./HomeRoute";
import PAGE_QUERY from "../home/__generated__/HomePageQuery.graphql";

export const HOME_ENTRY_POINT: RouteEntryPoint<
  RouteState,
  HomeRouteQueries,
  Empty,
  Empty,
  RouteState
> = {
  root: RouteResource("HomeRoute", () =>
    import("./HomeRoute").then((module) => module.HomeRoute),
  ),
  getPreloadProps: (route) => ({
    extraProps: route,
    queries: {
      page: { parameters: PAGE_QUERY, variables: {} },
    },
  }),
};

type Empty = Record<string, never>;
