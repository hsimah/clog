import { lazyResource, type RouteEntryPoint } from "@tsquid/routes/entrypoint";
import { HomeRouteQuery, type HomeEntryPointParams } from "../../routes/__generated__/routes";
import type { HomeRouteQueries } from "./HomeRoute";
import PAGE_QUERY from "../home/__generated__/HomePageQuery.graphql";

export const HOME_ENTRY_POINT: RouteEntryPoint<
  HomeEntryPointParams,
  HomeRouteQueries
> = {
  root: lazyResource("HomeRoute", () =>
    import("./HomeRoute").then((module) => module.HomeRoute),
  ),
  getPreloadProps: (route) => ({
    queries: {
      page: {
        parameters: PAGE_QUERY,
        variables: HomeRouteQuery.getVariables(route.input),
      },
    },
  }),
};
