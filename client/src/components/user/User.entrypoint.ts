import type { RouteEntryPoint } from "@tsquid/routes/entrypoint";
import { RouteResource } from "../../routes/RouteResource";
import type { RouteState } from "../../routes/RouteState";
import type { UserRouteQueries } from "./UserRoute";
import PAGE_QUERY from "../user/__generated__/UserPageQuery.graphql";
import RECORD_QUERY from "../user/__generated__/UserRecordQuery.graphql";

export const USER_ENTRY_POINT: RouteEntryPoint<
  RouteState,
  UserRouteQueries,
  Empty,
  Empty,
  RouteState
> = {
  root: RouteResource("UserRoute", () =>
    import("./UserRoute").then((module) => module.UserRoute),
  ),
  getPreloadProps: (route) => ({
    extraProps: route,
    queries: {
      page: { parameters: PAGE_QUERY, variables: {} },
      record:
        route.view === "detail"
          ? { parameters: RECORD_QUERY, variables: { id: route.id } }
          : undefined,
    },
  }),
};

type Empty = Record<string, never>;
