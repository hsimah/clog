import { createElement } from "react";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { RouteState } from "../../routes/RouteState";
import type { InventoryPageQuery } from "../inventory/__generated__/InventoryPageQuery.graphql";
import type { InventoryLocationsQuery } from "../inventory/__generated__/InventoryLocationsQuery.graphql";
import type { InventoryRecordQuery } from "../inventory/__generated__/InventoryRecordQuery.graphql";
import type { ItemRecordQuery } from "../item/__generated__/ItemRecordQuery.graphql";
import type { LocationRecordQuery } from "../location/__generated__/LocationRecordQuery.graphql";
import type { StockSelectionQuery } from "../stock/__generated__/StockSelectionQuery.graphql";
import { InventoryPage } from "./InventoryPage";
import { ItemRecord } from "../item/ItemRecord";
import { LocationRecord } from "../location/LocationRecord";
import { InventoryRecord } from "../inventory/InventoryRecord";
import { InventoryForm } from "../inventory/InventoryForm";
import { StockSelection } from "../stock/StockSelection";

export function InventoryRoute({ queries, extraProps }: InventoryRouteProps) {
  const edit = extraProps.view.endsWith("edit");
  const detail =
    extraProps.view === "new"
      ? createElement(InventoryForm, {})
      : queries.record
        ? createElement(InventoryRecord, { reference: queries.record, edit })
        : queries.item
          ? createElement(ItemRecord, { reference: queries.item, edit })
          : queries.location
            ? createElement(LocationRecord, {
                reference: queries.location,
                edit,
              })
            : queries.stock
              ? createElement(StockSelection, { reference: queries.stock })
              : null;
  return createElement(InventoryPage, {
    reference: queries.page,
    detail,
    locationsReference: queries.locations,
  });
}

export type InventoryRouteProps = EntryPointProps<
  InventoryRouteQueries,
  Empty,
  Empty,
  RouteState
>;

export type InventoryRouteQueries = {
  page: InventoryPageQuery;
  locations: InventoryLocationsQuery;
  record?: InventoryRecordQuery;
  item?: ItemRecordQuery;
  location?: LocationRecordQuery;
  stock?: StockSelectionQuery;
};

type Empty = Record<string, never>;
