import { createElement } from "react";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { RouteState } from "../../routes/RouteState";
import type { HomePageQuery } from "../home/__generated__/HomePageQuery.graphql";
import { HomePage } from "./HomePage";

export function HomeRoute({ queries }: HomeRouteProps) {
  return createElement(HomePage, { reference: queries.page });
}

export type HomeRouteProps = EntryPointProps<
  HomeRouteQueries,
  Empty,
  Empty,
  RouteState
>;

export type HomeRouteQueries = {
  page: HomePageQuery;
};

type Empty = Record<string, never>;
