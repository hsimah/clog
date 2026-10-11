import { createElement } from "react";
import { RouteName, useLocationRouteContext } from "../../routes/__generated__/routes";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { LocationPageQuery } from "../location/__generated__/LocationPageQuery.graphql";
import type { LocationRecordQuery } from "../location/__generated__/LocationRecordQuery.graphql";
import { LocationPage } from "./LocationPage";
import { LocationRecord } from "../location/LocationRecord";
import { LocationForm } from "../location/LocationForm";

export function LocationRoute({ queries }: LocationRouteProps) {
  const route = useLocationRouteContext();
  const edit = route.currentRoute === RouteName.LocationEdit;
  const detail =
    route.currentRoute === RouteName.LocationNew
      ? createElement(LocationForm, {})
      : queries.record
        ? createElement(LocationRecord, { reference: queries.record, edit })
        : null;
  return createElement(LocationPage, { reference: queries.page, detail });
}

export type LocationRouteProps = EntryPointProps<LocationRouteQueries>;

export type LocationRouteQueries = {
  page: LocationPageQuery;
  record?: LocationRecordQuery;
};
