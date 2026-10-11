import { createElement } from "react";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { HomePageQuery } from "../home/__generated__/HomePageQuery.graphql";
import { HomePage } from "./HomePage";

export function HomeRoute({ queries }: HomeRouteProps) {
  return createElement(HomePage, { reference: queries.page });
}

export type HomeRouteProps = EntryPointProps<HomeRouteQueries>;

export type HomeRouteQueries = {
  page: HomePageQuery;
};
