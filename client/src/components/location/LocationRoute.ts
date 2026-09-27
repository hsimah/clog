import { createElement } from "react";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { RouteState } from "../../routes/RouteState";
import type { LocationPageQuery } from "../location/__generated__/LocationPageQuery.graphql";
import type { LocationRecordQuery } from "../location/__generated__/LocationRecordQuery.graphql";
import { LocationPage } from "./LocationPage";
import { LocationRecord } from "../location/LocationRecord";
import { LocationForm } from "../location/LocationForm";

export function LocationRoute({ queries, extraProps }: LocationRouteProps) {
  const edit = extraProps.view.endsWith("edit");
  const detail =
    extraProps.view === "new"
      ? createElement(LocationForm, {})
      : queries.record
        ? createElement(LocationRecord, { reference: queries.record, edit })
        : null;
  return createElement(LocationPage, { reference: queries.page, detail });
}

export type LocationRouteProps = EntryPointProps<
  LocationRouteQueries,
  Empty,
  Empty,
  RouteState
>;

export type LocationRouteQueries = {
  page: LocationPageQuery;
  record?: LocationRecordQuery;
};

type Empty = Record<string, never>;
