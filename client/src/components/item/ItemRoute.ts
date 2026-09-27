import { createElement } from "react";
import type { EntryPointProps } from "@tsquid/routes/entrypoint";
import type { RouteState } from "../../routes/RouteState";
import type { ItemPageQuery } from "../item/__generated__/ItemPageQuery.graphql";
import type { ItemRecordQuery } from "../item/__generated__/ItemRecordQuery.graphql";
import { ItemPage } from "./ItemPage";
import { ItemRecord } from "../item/ItemRecord";
import { ItemForm } from "../item/ItemForm";

export function ItemRoute({ queries, extraProps }: ItemRouteProps) {
  const edit = extraProps.view.endsWith("edit");
  const detail =
    extraProps.view === "new"
      ? createElement(ItemForm, { initialBarcode: extraProps.barcode })
      : queries.record
        ? createElement(ItemRecord, { reference: queries.record, edit })
        : null;
  return createElement(ItemPage, { reference: queries.page, detail });
}

export type ItemRouteProps = EntryPointProps<
  ItemRouteQueries,
  Empty,
  Empty,
  RouteState
>;

export type ItemRouteQueries = {
  page: ItemPageQuery;
  record?: ItemRecordQuery;
};

type Empty = Record<string, never>;
