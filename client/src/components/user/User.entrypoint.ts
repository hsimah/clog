import { lazyResource, type RouteEntryPoint } from "@tsquid/routes/entrypoint";
import {
  RouteName,
  UserIndexRouteQuery,
  type UserEntryPointParams,
} from "../../routes/__generated__/routes";
import type { UserRouteQueries } from "./UserRoute";
import PAGE_QUERY from "../user/__generated__/UserPageQuery.graphql";
import RECORD_QUERY from "../user/__generated__/UserRecordQuery.graphql";

export const USER_ENTRY_POINT: RouteEntryPoint<
  UserEntryPointParams,
  UserRouteQueries
> = {
  root: lazyResource("UserRoute", () =>
    import("./UserRoute").then((module) => module.UserRoute),
  ),
  getPreloadProps: (route) => ({
    queries: {
      page: {
        parameters: PAGE_QUERY,
        variables: UserIndexRouteQuery.getVariables(route.input),
      },
      record:
        route.currentRoute === RouteName.UserDetail
          ? { parameters: RECORD_QUERY, variables: { id: route.input.id } }
          : undefined,
    },
  }),
};
